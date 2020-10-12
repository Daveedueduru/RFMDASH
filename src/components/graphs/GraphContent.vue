<template>
<div style="display:inline;">
  <div class="innerGraphHeader unselectable">
    <span class="graphTitle">{{graphTitle}}</span>
    <span class="optionButtons" v-if="graphObject.id != undefined && isPreview == false && pageName == 'Home'">
      <div class="editGraphButton" v-if="!disableDefaultGraphs(graphObject.creator)"><fai class="editGraphButtonIcon" icon="edit" title="Edit Graph" v-on:mousedown="editGraph(graphObject)"/></div>
      <div class="removeGraphButton"><fai icon="times" title="Remove Graph" v-on:mousedown="removeGraphFromLayout(graphObject.id)"/></div>
    </span>
  </div>

  <span v-if="graphObject.type == 'pinmap' || graphObject.type == 'heatmap'">
    <highcharts v-if="reloadMapAfterDataLoaded" class="responsiveChart innerGraphBody" ref="hcmRef" :options="mapOptions" :constructor-type="'mapChart'"></highcharts>
  </span>
  <span v-else>
    <highcharts class="responsiveChart innerGraphBody" ref="hcRef" :options="chartOptions" :constructor-type="'chart'" ></highcharts>
  </span>

  <div class="graphCoverDuringLoad" v-show="!loaded"></div>
  <div class="graphCoverFailedLoad" v-bind:class="{'yellowNoDataFailedLoad' : (graphLoadResponseStatus == 'No data.' || graphLoadResponseStatus == 'Too much data.')} " v-show="graphLoadFailed">
    <div class='graphCoverFailedLoadText'>
      <span v-if="graphLoadResponseStatus == 'No data.'">No data exists for this graph. You may need to adjust your date/search settings.<div style="margin-top:10px;"><fai style="font-size:24px;" icon="frown"/></div></span>
      <span v-else-if="graphLoadResponseStatus == 'Too much data.'">Too many data points exist to draw this map ({{this.turboThreshold}}+). Try narrowing your search further.<div style="margin-top:10px;"><fai style="font-size:24px;" icon="dizzy"/></div></span>
      <span v-else>Unable to load graph.<div style="margin-top:10px;"><fai style="font-size:24px;" icon="exclamation-circle"/></div></span>
    </div>
  </div>
</div>

</template>

<script>

export default {
  name: "GraphContent",
  components: {},
  computed: {
    graphTitle: function(){
      if(this.graphLoadFailed){
        if(this.graphLoadResponseStatus == "No data." || this.graphLoadResponseStatus )
          return this.graphObject.data.title;
        else if(this.graphObject.reason != undefined)
          return "Failed: Graph could not be found.";
        else
          return "Failed: Timeout from service.";
      }
      else if(this.graphObject.data != undefined && this.loaded)
        return this.graphObject.data.title;
      else if(this.loaded == false && this.noTitle == false)
        return "Loading graph...";
      else
        return "N/A";
    }
  },
  props:{
    graphObject: Object,
    loadGraphOnCreate: Boolean,
    isPreview: Boolean,
    pageName: String
  },
  watch:{

  },
  data() {
    return {
      noTitle: true,
      loaded: false,
      graphLoadFailed: false,
      graphLoadResponseStatus: "",
      completedGraphObjectWithFilters: {},
      reloadMapAfterDataLoaded: false,
      turboThreshold: 1000, //Max points before not drawing the graph because it would be too slow.
      chartOptions: {
        title: {
            text: ''
        },
        chart :{
            'type' : '',
            'zoomType': 'x'
        },
        xAxis: {
           title: {
                text: ''
            },
            categories: []
        },
        yAxis: {
            title: {
                text: ''
            }
        }, 
        series: []
      },
      mapOptions: {
      }
    };
  },
  methods: {
    drawGraph(){
      if(this.graphObject.id == null || (this.graphObject.reason != undefined && this.graphObject.reason == "Graph does not exist.")) return;
      //console.log(JSON.stringify(this.graphObject, null, 4));
      this.reloadMapAfterDataLoaded = false; //This is up here to give the highmaps library enough time as possible to delete the old map and load the new one... I know, but trust me...
      this.completedGraphObjectWithFilters = this.getCompletedGraphObject();
      var type = this.completedGraphObjectWithFilters.graphs[0].type;
      if(this.completedGraphObjectWithFilters.graphs[0].type == 'wordcloud') // The service only supports the metric keyword, so change it temporarily to get back data.
        this.completedGraphObjectWithFilters.graphs[0].type = "metric";
      // Check if any intervals are out of control and need adjusting.
      this.completedGraphObjectWithFilters = this.adjustIntervalIfNecessary(this.completedGraphObjectWithFilters);

      var uri = '/conflux/graphData';
      var headers = { headers: {'Content-Type':'application/json'} };
      var payload = this.completedGraphObjectWithFilters;
      //console.log(JSON.stringify(this.completedGraphObjectWithFilters,null, 4));

      var self = this;
      this.loaded = false;
      this.noTitle = false;
      this.graphLoadFailed = false;
      this.axios.post( uri , payload , headers
      ).then(function (response) {
          if(type == 'line' || type == 'area' || type == 'bar' || type == 'pie'){
            if(self.completedGraphObjectWithFilters.graphs[0].data.xAxis.interval == '')
              self.createNoIntervalLineBarAreaPieChart(response);
            else
              self.createYesIntervalLineBarAreaChart(response);
          }
          else if (type == 'metric' || type == 'wordcloud'){
            self.createMetricOrWordcloudChart(response,type);
          }
          else if (type == 'pinmap' || type == 'heatmap'){
            self.createMapChart(response,self.graphObject);
          }

          if(self.isPreview && type != 'pinmap' && type != 'heatmap')
             self.$refs.hcRef.chart.redraw();
          window.dispatchEvent(new Event('resize'));
      }).catch(function (error) {
          //console.error(error);
          self.graphLoadFailed = true;
          self.graphLoadResponseStatus = "Unable to load graph."
      }).then(function (response) {
          self.loaded = true;
      });

    },
    createMapChart(response,graphObject){
      this.mapOptions = {};
      
      response = response.data[Object.keys(response.data)[0]].aggregations["filter#filter_agg"]["geohash_grid#geoHash"].buckets;
      //console.log(response);
      if(!this.doesGraphContainData(response))
        return;
      if(response.length > this.turboThreshold){
        this.graphLoadFailed = true;
        this.graphLoadResponseStatus = "Too much data."
        return;
      }

      var mapView = graphObject.data.xAxis.mapView;
      var mapType = graphObject.type;
      this.mapOptions.chart = {map : mapView};
      this.mapOptions.title = {text : null};
      this.mapOptions.xAxis = {crosshair: {zIndex: 5,dashStyle: 'dot', snap: false,color: 'gray'}};
      this.mapOptions.yAxis = {crosshair: {zIndex: 5,dashStyle: 'dot', snap: false,color: 'gray'}};
      this.mapOptions['mapNavigation'] = {enabled:true, enableDoubleClickZoom: true, enableButtons:true, enableMouseWheelZoom:false};
      this.mapOptions.tooltip = { pointFormat: '{point.name}<br>' +'Lat: {point.lat}<br>' + 'Lon: {point.lon}<br>' };
      this.mapOptions.series = [
        {
          name: 'Basemap',
          borderColor: '#bebebe',
          nullColor: '#eeeeee',
          showInLegend: false
        }, 
        {
          name: 'Separators',
          type: 'mapline',
          nullColor: '#bebebe',
          showInLegend: false,
          enableMouseTracking: false
        }, 
        {
          name: graphObject.data.yAxis.aggregate + " " + graphObject.data.yAxis.field,
          type: this.getActualTypeForChart(mapType),
          showInLegend: false,
          animationLimit: 1, // Animating with a lot of data points causes JANK.
          turboThreshold: this.turboThreshold, // This is a hard cap on the number of points to draw. If over, nothing is drawn...
          maxSize: '12%',
          cursor: 'pointer',
          data: this.getParsedMapDataForPoints(response,mapType,graphObject)
        }
      ];
      this.reloadMapAfterDataLoaded = true; //This NEEDS to come AFTER all the mapOptions are set or else the highMap will not load properly.
    },
    getParsedMapDataForPoints(response,mapType,graphObject){
      var self = this;
      var outData = [];
      var maxVal = 0, minVal = null;
      for (let i = 0; i < response.length; i++) {
        const el = response[i];
        const count = this.getAggDataValue(el);
        if(count > maxVal)
          maxVal = count;
        if(minVal == null || count < minVal)
          minVal = count;
      }
      //var color = (mapType == 'heatmap' ? this.getCTLColor('mintgreen') : this.getCTLColor('vibrantblue'));
      for (let i = 0; i < response.length; i++) {
        const el = response[i];
        var color = self.determineColorBasedOnZValue(this.getAggDataValue(el),minVal,maxVal);
        var outObject = {
          name: this.getAggDataValue(el),
          z: this.getAggDataValue(el),
          lat: el["geo_centroid#geoCenter"].location.lat,
          lon: el["geo_centroid#geoCenter"].location.lon,
          color: color,
          //events: { click: function(){ self.clickedMapPoint(el,graphObject); } }
        };
        outData.push(outObject);
      }
      return outData;
    },
    clickedMapPoint(point,graphObject){
      alert(JSON.stringify(point) + "\n\n" + JSON.stringify(graphObject.data))
    },
    determineColorBasedOnZValue(z,min,max){
      var numParts = 12;
      var diff = max - min;
      var partition = diff / numParts;
      var greenToRedGradient = [
        "#38c6f4",
        "#37bdfd",
        "#4fb1ff",
        "#70a4ff",
        "#9294fb",
        "#b282ec",
        "#cd6dd6",
        "#e255b8",
        "#ef3b96",
        "#f42270",
        "#ef1748",
        "#e1251b",
        "#e1251b"
      ];
      var getIndex = Math.floor(z/partition) - 1;
      if(getIndex <= 0 || getIndex == 'Infinity') getIndex = 1;
      if(getIndex >= greenToRedGradient.length) getIndex = greenToRedGradient.length - 1;
      return greenToRedGradient[getIndex];
    },
    getCTLColor(color){
      if(color == 'mintgreen')
        return "#48D597";
      else if(color == 'vibrantblue')
        return "#0047BB";
      else if(color == 'navyblue')
        return "#001E60";
      else if(color == 'darkgray')
        return "#222222";
      else if (color == 'mediumgray')
        return "#53565A";
      else if (color == 'gray')
        return "#BEBEBE";
    },
    getActualTypeForChart(type){
      if(type == 'pinmap')
        return 'mappoint';
      if(type == 'heatmap')
        return 'mapbubble';
      return 'mappoint';
    },
    createMetricOrWordcloudChart(response,type){
      response = response.data[Object.keys(response.data)[0]].aggregations["sterms#terms"].buckets;
      if(!this.doesGraphContainData(response))
        return;

      var outData = [];
      for (let i = 0; i < response.length; i++) {
        const el = response[i];
        if(el.key == "" || el.key == undefined || el.key == null || el.key == "null")
          el.key = "null";
        var dataPoint = {
          name : el.key,
          weight : this.getAggDataValue(el),
        }
        if(type == 'metric')
          dataPoint.name += " <br><span style='font-size:8px;'>(" + dataPoint.weight + ")</span>";
        outData.push(dataPoint);
      }
      this.chartOptions.chart.type = 'wordcloud';
      this.chartOptions.title.text = this.completedGraphObjectWithFilters.graphs[0].data.yAxis.aggregate + " " + this.completedGraphObjectWithFilters.graphs[0].data.yAxis.field + " for " +  this.parseAwayDotKeyword(this.completedGraphObjectWithFilters.graphs[0].data.xAxis.field) ;
      this.chartOptions.series = [{
        data: outData,
        name: this.completedGraphObjectWithFilters.graphs[0].data.yAxis.aggregate 
      }];
    },
    createNoIntervalLineBarAreaPieChart(response){
      response = response.data[Object.keys(response.data)[0]].aggregations["sterms#terms"].buckets;
      if(!this.doesGraphContainData(response))
        return;

      var type = this.completedGraphObjectWithFilters.graphs[0].type;
      if(type == 'bar' && this.completedGraphObjectWithFilters.graphs[0].data.flipAxis)
        type = 'bar';
      else if(type == 'bar')
        type = 'column';

      var outData = [];
      var outCats = [];
      for (let i = 0; i < response.length; i++) {
        const el = response[i];
        var dataPoint = {
          name: el.key,
          y: this.getAggDataValue(el)
        }
        outCats.push(el.key);
        outData.push(dataPoint);
      }

      this.chartOptions.chart.type = type;
      this.chartOptions.yAxis.title.text = this.completedGraphObjectWithFilters.graphs[0].data.yAxis.aggregate;
      this.chartOptions.xAxis.categories = outCats; // Needed for non-time-series graphs. Must match data array.
      this.chartOptions.xAxis.max = response.length-1; // Set the max to show categories (dates) even if no data is available.
      this.chartOptions.series = { data:outData , name: this.parseAwayDotKeyword(this.completedGraphObjectWithFilters.graphs[0].data.xAxis.field) };
    },
    createYesIntervalLineBarAreaChart(response){
      response = response.data[Object.keys(response.data)[0]].aggregations["date_histogram#dateHistogram"].buckets;
      if(!this.doesGraphContainData(response))
        return;

      var type = this.completedGraphObjectWithFilters.graphs[0].type;
      if(type == 'bar' && this.completedGraphObjectWithFilters.graphs[0].data.flipAxis)
        type = 'bar';
      else if(type == 'bar')
        type = 'column';

      var outData = [];
      var outDateCats = [];
      var allKeys = [];

      //Frist we loop through to fill the date categories and collect all the unique key values.
      for (let i = 0; i < response.length; i++) {
        outDateCats.push( this.$moment.utc(response[i].key).format('MM/DD HH:mm')); //Updated from Unix to UTC!
 
        var subBucketData =  response[i]["sterms#terms"].buckets;

        for (let j = 0; j < subBucketData.length; j++) {
          const el = subBucketData[j];
          
          if(_.includes(allKeys, el.key) == false)
            allKeys.push(el.key);
        }
      }

      //Next we iterate over all the unique keys and fill their data arrays up with nulls corresponding to the number of date categories (response.length)
      for (let i = 0; i < allKeys.length; i++) {
          outData.push({data:[], name: allKeys[i] , stack: 0});
          for (let k = 0; k < response.length; k++)
            outData[i].data.push(null);
      }

      //Finally, we iterate through the entire response and buckets again and go back through our outData array and update the index values that are not null.
      for (let i = 0; i < response.length; i++) {
        var subBucketData =  response[i]["sterms#terms"].buckets;
        for (let j = 0; j < subBucketData.length; j++) { // Going through each bucket of values.
          const el = subBucketData[j];
          for (let k = 0; k < outData.length; k++) { //Go through our null array string until we find the corresponding empty null array that matches this key. Then set the index(date) to the value.
            if(outData[k].name == el.key)
              outData[k].data[i] = this.getAggDataValue(el);
          }
        }
      }

      //Finally we are left with an array of keys (uniq) each with its own data array of values with a length that matches the number of date categories. (with the proper dates filled in...)
      //console.log(outData);


      if(!this.doesGraphContainData(outData))
        return;
      
      if(type == 'column')
        this.chartOptions['plotOptions'] = {column: { stacking: 'normal'}};
      else if(type == 'area')
        this.chartOptions['plotOptions'] = {area: { stacking: 'normal'}};

      this.chartOptions.chart.type = type;
      this.chartOptions.yAxis.title.text = this.completedGraphObjectWithFilters.graphs[0].data.yAxis.aggregate;
      this.chartOptions.xAxis.title.text = this.parseAwayDotKeyword(this.completedGraphObjectWithFilters.graphs[0].data.xAxis.field);
      this.chartOptions.xAxis.max = response.length-1; // Set the max to show categories (dates) even if no data is available.
      this.chartOptions.xAxis.categories = outDateCats; // The x axis is an array of dates (order has to match data series order!)
      this.chartOptions.series = outData; // series = [{data: [datapoint1,datapoint2]}, {data: [datapoint1,datapoint2]}]
    },
    parseAwayDotKeyword(field){
      return field.replace('.keyword','')
    },
    doesGraphContainData(buckets){
      if(buckets.length <= 0){
        this.graphLoadResponseStatus = "No data.";
        this.graphLoadFailed = true;
        return  false;
      }
      return true;
    },
    adjustIntervalIfNecessary(completedGraphObject){
      if(completedGraphObject.graphs[0].data.xAxis == undefined)
        return completedGraphObject;

      if(completedGraphObject.graphs[0].data.xAxis.originalInterval != undefined) // Need temp variables since we are modifying the reference and not copying here
        completedGraphObject.graphs[0].data.xAxis.interval = completedGraphObject.graphs[0].data.xAxis.originalInterval;

      var start = completedGraphObject.filters.startDate;
      var end = completedGraphObject.filters.endDate;
      var diff = Math.abs(this.$moment(start).diff(this.$moment(end),'days'));
      var interval = completedGraphObject.graphs[0].data.xAxis.interval;
      completedGraphObject.graphs[0].data.xAxis.originalInterval = interval;

      if(interval == "60m")
        interval = 1/24;
      else if (interval == "4h")
        interval = 1/6;
      else if (interval == "1m")
        interval = 1/1440;
      var numBuckets = Math.abs(parseFloat(diff) / parseFloat(interval));

      var limit = 120;
      var tightLimitForHourlySearches =  63;
      if(numBuckets > limit){
        var newIntervalToSatisfyLimit = Math.ceil(diff/limit) + "d";
        if(completedGraphObject.graphs[0].data.xAxis.interval == '1m' && newIntervalToSatisfyLimit == '1d' && diff < 8){
          newIntervalToSatisfyLimit = '1h';
        }
        else if(newIntervalToSatisfyLimit == '1d' && diff < tightLimitForHourlySearches && completedGraphObject.graphs[0].data.xAxis.interval != '1m'){ // If we are adjusting too tightly on a less than 2 month time period, dial back to 6h or 30m for more detail than 1d
            newIntervalToSatisfyLimit = '6h';
        }
        //console.log("The "+completedGraphObject.graphs[0].data.xAxis.interval +" interval for " +completedGraphObject.graphs[0].data.title+ " has been adjusted to " + newIntervalToSatisfyLimit + " to avoid " + numBuckets + " buckets.");
        completedGraphObject.graphs[0].data.xAxis.interval = newIntervalToSatisfyLimit;
      }
      //console.log(start + " - " + end + " - " + diff + "d - " + interval + " --- " + numBuckets + " -  " + completedGraphObject.graphs[0].data.xAxis.interval);
      return completedGraphObject;
    },
    getGlobalOptions(){
      var profiles = JSON.parse(localStorage.getItem("profiles"));
      for (let i = 0; i < profiles.length; i++) {
        profiles[i] = profiles[i].id;
      }
      var query = "";
      if(localStorage.getItem("query") !== null && this.isPreview == false)
        query = localStorage.getItem("query");
      return {
          "dateRangeField":"createTime",
          "startDate": localStorage.getItem("startTime"),
          "endDate": localStorage.getItem("endTime"),
          "profiles": profiles,
          "query": query,
      };
    },
    getCompletedGraphObject(){ 
      return { 
          "graphs": [ this.graphObject ],
          "filters": this.getGlobalOptions()
      };
    },
    removeGraphFromLayout(id){
      if(localStorage.getItem("layout") == null)
        return;
        
      var layout = JSON.parse(localStorage.getItem("layout"));
      for (let i = 0; i < layout.length; i++) {
        if(layout[i].i == id){
          layout.splice(i,1);
          this.$root.$emit('saveNewLayout', layout);
          break;
        }
      }
    },
    editGraph(graphObject){
      var homeComponent = this.$parent.$parent.$parent.$parent; // Yikes! As long as the home page stays where it is this is OK.
      homeComponent.$refs.createGraphModal.openCreateGraphForEdit(graphObject);
    },
    getAggDataValue(element){
      //console.log(element);
      var aggName = "aggs";
      if(this.graphObject.type == "pinmap" || this.graphObject.type == 'heatmap')
        aggName = "metrics"
      if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'count')
        return element["doc_count"];
      else if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'average')
        return element["avg#" + aggName].value;
      else if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'sum')
        return element["sum#" + aggName].value;
      else if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'median')
        return element["median_absolute_deviation#" + aggName].value;
      else if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'min')
        return element["min#" + aggName].value;
      else if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'max')
        return element["max#" + aggName].value;
      else if(this.graphObject.data.yAxis.aggregate.toLowerCase() == 'uniquecount')
        return element["cardinality#" + aggName].value;
    },
    disableDefaultGraphs(creator){
      if(creator == undefined || creator == null)
        return false;
      var user = localStorage.getItem("username").toLowerCase();
      if(user == creator)
        return false;
      else if(creator.toLowerCase().includes(".defaults"))
        return true;
      return false;
    }
  },
  mounted() {
    if(this.loadGraphOnCreate)
      this.drawGraph();
  },
  beforeDestroy(){
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";

.innerGraphHeader {
  background-color: $ctl-light-gray;
  border-bottom: 1px solid $ctl-border-gray;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  height: 28px;
  padding-left: 6px;
  padding-top: 2px;
}

.innerGraphBody {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  height: calc(100% - 28px);
  overflow: hidden;
  padding-top:10px;
}

.optionButtons{
  position:absolute;
  top:1px;
  right:1px;
  color:$ctl-gray;
  background-color:#eeeeee;
  padding-left:5px;
  padding-right:5px;
}

.editGraphButton{
  display: inline-block;
  margin-right:3px;
  font-size: 13px;
  cursor: pointer;
}
.editGraphButtonIcon{
  display: block;
  margin-top:0px;
}
.removeGraphButton{
  cursor: pointer;
  display: inline-block;
}

.editGraphButton:hover{
  color: $ctl-vibrant-blue;
}
.removeGraphButton:hover{
  color:#dc3545;
}

.graphTitle{
  text-overflow:ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display:block;
}

.graphCoverDuringLoad{
  position:absolute;
  top:28px;
  left:0px;
  width:100%;
  height:calc(100% - 28px);
  background-color:white!important;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}

.graphCoverFailedLoad{
  position:absolute;
  top:28px;
  left:0px;
  width:100%;
  height:calc(100% - 28px);
  background-color:#ffe5e5;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  padding:2px;
}
.yellowNoDataFailedLoad{
  background-color: #fff8e5!important;
}
.graphCoverFailedLoadText{
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  text-align: center;
  color:$ctl-medium-gray;
}

</style>