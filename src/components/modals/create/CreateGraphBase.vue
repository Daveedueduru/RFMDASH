<template>
<div class="row">

    <div class="col-sm-6">
        <graphTitle @updateTitle="parseTitle" :graphType="graphType" ref="graphTitle"></graphTitle>
        <graphQuery @updateQuery="parseQuery" :graphType="graphType" ref="graphQuery"></graphQuery>
        <yAxis @updateYAxis="parseYAxis" :fields="fields" :graphType="graphType" ref="yAxis"></yAxis>
        <xAxis @updateXAxis="parseXAxis" :fields="fields" :graphType="graphType" ref="xAxis"></xAxis>
    </div>

    <div class="col-sm-6">
        <graphPreview ref="graphPreview"></graphPreview>
    </div>

</div>
</template>

<script>
import Title from '@/components/modals/create/Title.vue';
import Query from '@/components/modals/create/Query.vue';
import YAxis from '@/components/modals/create/YAxis.vue';
import XAxis from '@/components/modals/create/XAxis.vue'; 
import Preview from '@/components/modals/create/Preview.vue';

export default {
  name: "CreateGraphBase",
  components: { 
      'graphTitle' : Title,
      'graphQuery' : Query,
      'yAxis' : YAxis,
      'xAxis' : XAxis,
      'graphPreview' : Preview
  },
  props: {
      graphType: String
  },
  computed: {},
  watch: {
   // This watches all updates to the parsedGraph object. If everything is no longer null, we can emit the event to enable save.
   // It's the responsibility of the child components to make sure they are valid before emitting a value.
   // If a child component's value becomes invalid, it should re-emit a null event.
   parsedGraph: { 
        handler(pg){
            //console.dir(JSON.stringify(pg.data));
            if(
                pg.data.title != null &&
                pg.data.query != null &&
                pg.data.yAxis != null &&
                (pg.data.xAxis != null || pg.data.geometrics != null)
            ){
                this.areGraphInputsValid = true;
                this.$emit('readyForSave', true);
            }else{
                this.areGraphInputsValid = false;
                this.$emit('readyForSave', false);
            }
        },
        deep: true
    }
  },
  data() {
    return {
        loadingFields: true,
        fields : [
            { name: "Loading Fields..." , value: "loading" , type : "number" },
        ],
        parsedGraph: {
            "id": null,
            "type": null,
            "creator" : null,
            "dateCreated" : null,
            "data" : {
                "title" : null,
                "query" : "", // Optional
                "yAxis" : null,
                "xAxis" : null,
                "flipAxis" : false
            }
        },
        areGraphInputsValid: false
    };
  },
  methods: {
      getFields(){
        this.loadingFields = true;
    
        var uri = '/conflux/alertfields';
        var payload = {};
        var headers = { headers: {} };

        var self = this;
        this.axios.post( uri , payload , headers
        ).then(function (response) {
            for (let i = 0; i < response.data.length; i++) {
              const el = response.data[i];
              el['properName'] =  self.$options.filters.createSpaces(self.$options.filters.capitalize(el.name));
            }
            self.fields = self.sortByKey(response.data,"name");
        }).catch(function (error) {
            console.error(error);
        }).then(function (response) {
            self.loadingFields = false;
        });

      },
      sortByKey(array, key) {
          return array.sort(function(a, b) {var x = a[key]; var y = b[key]; return ((x < y) ? -1 : ((x > y) ? 1 : 0)); });
      },
      parseTitle(title){
        this.parsedGraph.data.title = title;
      },
      parseQuery(query,flipAxis){
        this.parsedGraph.data.flipAxis = flipAxis;
        this.parsedGraph.data.query = query;
      },
      parseYAxis(yAxis){
        this.parsedGraph.data.yAxis = yAxis;
      },
      parseXAxis(xAxis){
        this.parsedGraph.data.xAxis = xAxis;
      },
      getParsedGraph(){
        this.parsedGraph.id = localStorage.getItem("username") + "." + Date.now();
        this.parsedGraph.type = this.graphType;
        this.parsedGraph.creator = localStorage.getItem("username");
        this.parsedGraph.dateCreated = Date.now();
        if(this.parsedGraph.type == 'pinmap' || this.parsedGraph.type == 'heatmap')
          return this.parseKeysForMapGraphs(this.parsedGraph);
        return this.parsedGraph;
      },
      parseKeysForMapGraphs(payload){
        payload.data['metrics'] = payload.data.yAxis;
        payload.data['geometrics'] = payload.data.xAxis;
        return payload;
      },
      save(editGraphObject){
        this.$parent.$parent.setDisableSaveWhileSaving(true);
        var isEditedGraph = (editGraphObject != null); // Replace some of the non-data properties with the original values if we are about to save an edit.

        var uri = '/conflux/saveGraph';
        var payload = this.getParsedGraph();
        if(isEditedGraph){ 
          payload.id = editGraphObject.id;
          payload.creator = editGraphObject.creator;
          // dateCreated we want updated and type cannot be changed in the edit modal.
        }
        var headers = { headers: {'Content-Type':'application/json'} };

        var self = this;
        this.axios.post( uri , payload , headers
        ).then(function (response) {
            if(response.status != 200){
              alert("Unable to save graph! Please try again. Error:1");
            }else{
              self.addGraphToCache(isEditedGraph, payload); // Add the graph to local storage. Update the storage item if this is an edit.
              self.$parent.$parent.$emit("updateGraphList", null); // In case we are on the visualizations page we need to update the visualizationTable component immediately.
              self.addGraphToLayout(isEditedGraph,payload); // Add the new graph Id to the layout and go and save it. When it's done emit out to the graphgrid to update its layout from the cache.
              self.$parent.$parent.toggle(); // Close the modal
            }
        }).catch(function (error) {
            console.error(error);
            alert("Unable to save graph! Please try again. Error:2");
        }).then(function (response) {
            self.$parent.$parent.setDisableSaveWhileSaving(false);
        });
      },
      addGraphToCache(isEditedGraph,payload){
        if(localStorage.getItem("graphs") !== null){
          var graphs = JSON.parse(localStorage.getItem("graphs"));
          if(isEditedGraph)
            for (let i = 0; i < graphs.length; i++) {
              if(graphs[i].id == payload.id){
                graphs[i] = payload;
                break;
              }
            }
          else
            graphs.push(payload);
          localStorage.setItem("graphs", JSON.stringify(graphs));
        }else{
          localStorage.setItem("graphs", JSON.stringify([payload]));
        }
      },
      addGraphToLayout(isEditedGraph,payload){
        var layout = [];
        if(localStorage.getItem("layout") !== null)
          layout = JSON.parse(localStorage.getItem("layout"));

        if(isEditedGraph){
          // If we are editng the graph that maeans it already exists in the layout.
          // All we need to do is pass the id so we can re-draw it in the layout component.
          this.$root.$emit('saveNewEditedLayout', layout, payload.id);
        }else{
          var newGraphSpot = {
            x : 0,
            y : 0,
            w : 4,
            h : 8,
            i : this.parsedGraph.id
          };
          layout.push(newGraphSpot);
          this.$root.$emit('saveNewLayout', layout);
        }

      },
      // This is called from the visTable/Home components when a graph needs to be opened for editing.
      // Each sub component here is responsible for appropriately backparsing a saved graph into its inputs.
      setGraph(editableGraphObject){ 
        this.$refs.graphTitle.setOptions(editableGraphObject.data.title);
        this.$refs.graphQuery.setOptions(editableGraphObject.data.query,editableGraphObject.data.flipAxis); 
        this.$refs.yAxis.setOptions(editableGraphObject.data.yAxis);
        this.$refs.xAxis.setOptions(editableGraphObject.data.xAxis);
      }
  },
  filters: {
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
  created() {
    this.getFields();
  }
};
</script>

<style type="text/scss" lang="scss">
@import "../../../assets/sass/custom-css/_global.scss";
.createGraphInputfieldContainer{
  display:block;
  float:left;
}
.createGraphInputLabel{
  margin-top:-30px;
  margin-bottom:6px;
  margin-left:4px;
  color:$ctl-medium-gray;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}
.createGraphInputLabelNoMargins{
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
}

</style>
