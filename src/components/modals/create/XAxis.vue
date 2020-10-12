<template>
<div>

  <h4  v-if="graphType !='pinmap' && graphType !='heatmap' ">X Axis</h4>
  <div style="float:left;width:42%;"  v-if="graphType !='pinmap' && graphType !='heatmap' ">
    <v-select v-if="helperHider" placeholder="Select A Field (Any)" ref="xFieldInput" label="properName" :reduce="field=>field.name" :options="fields" v-model="selected.xAxisField" />
  </div>

  <h4  v-if="graphType =='pinmap' || graphType =='heatmap' ">Map View</h4>
  <div style="float:left;width:64%;" v-if="graphType =='pinmap' || graphType =='heatmap' ">
    <select class="form-control"  v-model="selected.xAxisMapView" >
        <option selected disabled value="">Map View</option>
        <option v-for="mt in mapTypes" :key="mt.value" :value="mt.value">{{mt.name}}</option> 
    </select>
  </div>

  <div class="createGraphInputfieldContainer" style="width:19%;;margin-left:3%;" v-if="graphType != 'metric' && graphType != 'wordcloud' && graphType !='pie' && graphType !='pinmap' && graphType !='heatmap'">
    <div class="createGraphInputLabel">Interval</div>
    <select class="form-control"  v-model="selected.xAxisInterval" >
        <option selected disabled value="">Interval</option>
        <option v-for="interval in intervalsBasedOnType" :key="interval.value" :value="interval.value">{{interval.name}}</option> 
    </select>
  </div>

  <div class="createGraphInputfieldContainer" style="width:19%;;margin-left:3%;" v-if="graphType !='pinmap' && graphType !='heatmap'">
    <div class="createGraphInputLabel">Order By</div>
    <select class="form-control" v-model="selected.xAxisOrder">
        <option selected disabled value="">Order By</option>
        <option v-for="(order,index) in [{name:'Ascending',val:'asc'},{name:'Descending',val:'desc'}]" :key="index" :value="order.val">{{order.name}}</option> 
    </select>
  </div>

  <div class="createGraphInputfieldContainer" style="width:11%;;margin-left:3%;" v-if="graphType != 'metric' && graphType !='pinmap' && graphType !='heatmap' ">
    <div class="createGraphInputLabel">Size</div>
    <input class="form-control"  type="number" min="1" :max="maxSize" v-on:change="enforceMax(selected.xAxisSize)" v-model="selected.xAxisSize">
  </div>

  <div style="clear:both;"></div><br>
</div>
</template>

<script>

export default {
  name: "XAxis",
  components: {},
  props:{
    fields: Array,
    graphType: String
  },
  computed: {
    intervalsBasedOnType: function(){
      if(this.graphType == 'line' || this.graphType == 'area' || this.graphType == 'bar' || this.graphType == 'column')
        return this.intervals;
      else if(this.graphType == 'pie' || this.graphType == 'metric' || this.graphType == 'wordcloud')
        return [this.intervals[0]];
      else
        return this.intervals;
    }
  },
  watch: {
    selected: { 
        handler(){
            this.updateParent();
        },
        deep: true
    }
  },
  data() {
    return {
      maxSize: 100,
      helperHider: true,
      selected : {
          xAxisField: 'effectedObject',
          xAxisOrder: 'desc',
          xAxisInterval: "none",
          xAxisSize: 5,
          xAxisMapView: "worldMap"
      },
      intervals : [
          {name : "None" , value : "none"},
          {name : "1 Minute" , value : "1m"},
          {name : "Hourly" , value : "60m"},
          {name : "4 Hours" , value : "4h"},
          {name : "Daily" , value : "1d"},
          {name : "Weekly" , value : "7d"},
          {name : "Monthly" , value : "31d"}
      ],
      mapTypes:[
        {name : "World Continents" , value : "worldMap" , top_left: "83,-176" , bottom_right: "-57,180"},
        {name : "United States" , value : "usaMap" , top_left: "49,-130" , bottom_right: "20,-73"},
        {name : "North America" , value : "northAmericaMap" , top_left: "87,176" , bottom_right: "10,-32"},
        {name : "South America" , value : "southAmericaMap" , top_left: "10,-101" , bottom_right: "-57,-22"},
        {name : "Europe" , value : "europeMap" , top_left: "82,-13.11" , bottom_right: "36.65,52.16"}, 
        {name : "Asia" , value : "asiaMap" ,  top_left: "72,25" , bottom_right: "-10,180"},
        {name : "Africa" , value : "africaMap" ,  top_left: "37,-26" , bottom_right: "-35,58"},
        {name : "Oceania" , value : "oceaniaMap" ,  top_left: "-9,101" , bottom_right: "-57,180"}
      ]
    }
  },
  methods: {
    updateParent(){
      this.$emit('updateXAxis', null);
      if(this.selected.xAxisField != "" && this.selected.xAxisOrder != "" && this.graphType != 'pinmap' && this.graphType != 'heatmap'){
        this.$emit('updateXAxis', {
          "field":  this.$options.filters.appendKeywordIfNotNumber(this.selected.xAxisField),
          "interval" : this.$options.filters.noneToEmpty(this.selected.xAxisInterval),
          "order" : this.selected.xAxisOrder,
          "size" : this.selected.xAxisSize.toString(),
        });
      }else if(this.graphType == 'pinmap' || this.graphType == 'heatmap'){
        this.$emit('updateXAxis', {
          "field":  "loc",
          "interval" : "",
          "order" : "",
          "size" : "",
          "mapView" : this.selected.xAxisMapView,
          "top_left" : this.getTopLeft(this.selected.xAxisMapView),
          "bottom_right" : this.getBottomRight(this.selected.xAxisMapView),
          "precision" : 5
        });
      }
    },
    getTopLeft(type){
      for (let i = 0; i < this.mapTypes.length; i++) {
        if(this.mapTypes[i].value == type)
          return this.mapTypes[i].top_left;
      }
    },
    getBottomRight(type){
      for (let i = 0; i < this.mapTypes.length; i++) {
        if(this.mapTypes[i].value == type)
          return this.mapTypes[i].bottom_right;
      }
    },
    enforceMax(size){
      if(size > this.maxSize)
        this.selected.xAxisSize = this.maxSize;
    },
    setOptions(xAxis){
      if(this.graphType == 'pinmap' || this.graphType == 'heatmap'){
        this.selected.xAxisMapView = xAxis.mapView;
      }
      else{
        var self = this;
        this.helperHider = false;
        this.$nextTick(() => { self.selected.xAxisField = xAxis.field.replace('.keyword',''); self.helperHider = true; });
        if(xAxis.interval == "")
          this.selected.xAxisInterval = "none";
        else if(xAxis.originalInterval != undefined)
          this.selected.xAxisInterval = xAxis.originalInterval;
        else
          this.selected.xAxisInterval = xAxis.interval;
        this.selected.xAxisOrder = xAxis.order;
        this.selected.xAxisSize = parseInt(xAxis.size);
      }
      this.updateParent();
    }
  },
  filters: {
    appendKeywordIfNotNumber: function (value) {
      if(value == 'occuranceCount')
        return value;
      else
        return value + ".keyword";
    },
    noneToEmpty: function (value) {
      if(value == 'none')
        return "";
      else
        return value;
    },
    capitalize: function(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    createSpaces: function(value) {
      var outString = "";
      for (var i = 0; i < value.length; i++) {
        var char = value.charAt(i);
        if (char == char.toUpperCase() && i != 0) outString += " ";
        outString += char;
      }
      return outString;
    }
  },
  created(){
    this.updateParent();
    if(this.graphType == 'metric'){
      this.maxSize = 1;
      this.selected.xAxisSize = 1;
    }
  }
};
</script>

<style type="text/scss" lang="scss">
.vs__dropdown-toggle{
  height:38px!important; 
}
.vs__clear{
  display:none!important;
}
.vs__selected{
  padding-top:2px!important;
}
</style>
