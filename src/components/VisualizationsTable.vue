<template>
<div>
    <div class="row searchRow" v-if="tableType == 'fullTable'">
      <div class="col-10">
        <input class="form-control" v-model="searchQuery" placeholder="Search Graphs" />
      </div>
      <div class="col-2">
        <button class="btn btn-success searchBarItem" v-on:click="showCreateNewModal()"><fai icon="plus-square" />&nbsp; Create Graph</button>
      </div> 
    </div>

    <div class="row searchRow" v-else-if="tableType == 'selectableTable'">
      <div class="col-12">
        <input class="form-control" v-model="searchQuery" placeholder="Search Graphs" />
      </div>
    </div>
  <div v-bind:class="[{smallTableHeight: tableType == 'selectableTable'} , {contentContainer: true} , {graphContainer: tableType == 'fullTable'}]">
    <div class="row">
      <div class="col-12">
          <table class="table">
              <thead>
                <th>Title</th>
                <th>Type</th>
                <th>Creator</th>
                <th>Date Created</th>
                <th v-if="tableType == 'fullTable'" class="commandsColumn"></th>
              </thead>
              <tbody>
                <tr v-for="vis in filteredVisualizations" :key="vis.id" v-bind:class="[{selectableTableRow: tableType == 'selectableTable'} , {selectedGraph: vis.id == selectedGraphId}]" v-on:click="selectRow(vis.id,tableType);">
                  <td>{{vis.data.title}}</td>
                  <td><fai :icon="getGraphTypeIcon(vis.type)" class="visTableGraphIcon" />{{getHumanReadableGraphTypeName(vis.type)}}</td>
                  <td> {{vis.creator.toUpperCase() | formatUsername}}</td>
                  <td>{{vis.dateCreated | moment("ll HH:mm")}}</td>
                  <td v-show="tableType == 'fullTable'" class="commandsCell">
                    <button title="Delete Graph" class="btn btn-danger deleteGraphButton" :disabled="disableGraphDelete(vis)" v-on:click="deleteGraph(vis.id)"><fai icon="trash-alt" /></button>
                    <button title="Edit Graph" class="btn btn-info editGraphButton" :disabled="disableEditGraph(vis)" v-on:click="editGraph(vis)"><fai icon="edit" /></button>
                  </td>
                </tr>
              </tbody>
          </table>
        </div>
      </div> 
  </div>

  <createGraphModal ref="createGraphModal" @updateGraphList="getUserAndDefaultGraphs(true)"></createGraphModal>
</div>
</template>

<script>
import ModalCreateGraph from '@/components/modals/ModalCreateGraph.vue';

export default {
  name: 'VisualizationsTable',
  components:{
    'createGraphModal': ModalCreateGraph,
  },
  props:{
    tableType: String
  },
  computed: {
    filteredVisualizations(){
      if(this.searchQuery)
        return this.visualizations.filter((vis)=>{
          return (
            vis.data.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            vis.type.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
            vis.creator.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        })
        else
          return this.visualizations;
      }
  },
  data() {
    return {
        visualizations: [],
        searchQuery: "",
        selectedGraphId: "",
        loadingDeleteGraph: []
    };
  },
  methods: {
    showCreateNewModal(){
      this.$refs.createGraphModal.toggle();
    },
    getGraphTypeIcon(type){
      var gts = this.$refs.createGraphModal.graphTypes;
      for (let i = 0; i < gts.length; i++) {
        if(type == gts[i].value)
          return gts[i].icon;
        
      }
      return "info";
    },
    getHumanReadableGraphTypeName(type){
        var gts = this.$refs.createGraphModal.graphTypes;
        for (let i = 0; i < gts.length; i++) {
          if(type == gts[i].value)
            return gts[i].name;
          
        }
        return "Unknown";
    },
    getUserAndDefaultGraphs(debounceForUpdates){
      // Should get both the logged in users graphs as well as any default/(group**) graphs for that user.
      // This is called on page create, when a graph is saved by a user, and when a graph is deleted by a user.

      //this.visualizations = [];
      var debounce = 0;
      if(debounceForUpdates)
        debounce = 1000;

      var self = this; 
      var debounce = this.lodash.debounce(function(){ // Debounce is needed because rest service is not restful. Ask bala/mani about this.
        var user = localStorage.getItem("username");
        var defaults = "*.defaults";

        var uri = '/conflux/fetchGraphs?creator=' + user + "," + defaults;
        var headers = { headers: {'Content-Type':'application/json'} };
        self.axios.get( uri , headers
        ).then(function (response) {
            var userAndDefaultGraphsOnly = [];
            for (let i = 0; i < response.data.length; i++){
              if(response.data[i].type != 'layout'){
                response.data[i].creator = response.data[i].creator.toLowerCase();
                userAndDefaultGraphsOnly.push(response.data[i]);
              }
            }
            self.visualizations = self.sortByKey(userAndDefaultGraphsOnly,'creator');
            //console.log(self.visualizations);
        }).catch(function (error) {
            console.error(error);
            alert("Unable to load graphs for "+user+"! Please try again. Error:1");
        });
    
      }, debounce);
      debounce();

    },
    addGraph(){
      var layout = [];
      if(localStorage.getItem("layout") !== null){
        layout = JSON.parse(localStorage.getItem("layout"));
        for (let i = 0; i < layout.length; i++) {
          if(layout[i].i == this.selectedGraphId){
            console.error("Graph already exists in layout.");
            return;
          }
        }
      }
      var newGraphSpot = {
        x : 0,
        y : 0,
        w : 4,
        h : 8,
        i : this.selectedGraphId
      };
      layout.push(newGraphSpot);

      this.$root.$emit('saveNewLayout', layout);
    },
    deleteGraph(id){ 
      // Delete the graph from the databse. Then remove it from the graph cache and layout cache. Lastly, emit the event to go save the new layout if it DID exist in the layout cache.
      // Lastly, go and fetch the new visualizations list from the database since it has now changed to -1 graph.
      this.loadingDeleteGraph.push(id);
      var uri = '/conflux/deleteGraph?id=' + id;
      var headers = { headers: {'Content-Type':'application/json'} };
      var self = this;
      this.axios.get( uri , headers
      ).then(function (response) {
          if(localStorage.getItem("graphs") !== null){
            var graphs = JSON.parse(localStorage.getItem("graphs"));
            for (let i = 0; i < graphs.length; i++) {
              if(graphs[i].id == id){
                graphs.splice(i,1);
                localStorage.setItem("graphs", JSON.stringify(graphs));
                break;
              }
            }
          }

          if(localStorage.getItem("layout") !== null){
            var layout = JSON.parse(localStorage.getItem("layout"));
            for (let i = 0; i < layout.length; i++) {
              if(layout[i].i == id){
                layout.splice(i,1);
                self.$root.$emit('saveNewLayout', layout);
                break;
              }
            }
          }
          self.getUserAndDefaultGraphs(true);
      }).catch(function (error) {
          console.error(error);
          alert("Unable to delete graph! Please try again. Error:1");
      }).then(function (response) {
          self.loadingDeleteGraph = self.loadingDeleteGraph.splice(self.loadingDeleteGraph.indexOf(id), 1); ;
      });

    },
    editGraph(graphObject){
      this.$refs.createGraphModal.openCreateGraphForEdit(graphObject);
    },
    selectRow(id,tableType){
        if(tableType == 'selectableTable'){
            this.selectedGraphId = id;
            this.$emit('rowSelectedEvent', id); //Broadcast to the modal parent a row has been selected so we can enable the add graph button.
        }
    },
    isRowSelected(){
        return this.selectedGraphId != "";
    },
    disableGraphDelete(vis){
      var user = localStorage.getItem("username").toLowerCase();

      if(this.loadingDeleteGraph.includes(vis.id))
        return true;
      else if(user.includes(".defaults") == false && vis.creator.toLowerCase().includes(".defaults"))
        return true
      else if (user.includes(".defaults") && vis.creator.toLowerCase() != user)
        return true;

      return false;
    },
    disableEditGraph(vis){
      var user = localStorage.getItem("username").toLowerCase();
      if(user.toLowerCase() == vis.creator.toLowerCase())
        return false;
      return true;
    },
    sortByKey(array, key) {
        return array.sort(function(a, b) {var x = a[key]; var y = b[key]; return ((x < y) ? -1 : ((x > y) ? 1 : 0)); });
    }
  },
  filters: {
    formatUsername: function (value) {
      if(value.includes(".DEFAULTS")){
        var plainName = value.replace(".DEFAULTS", "").toLowerCase();
        return "DEFAULT - " + plainName.charAt(0).toUpperCase() + plainName.slice(1);
      }
      return value;
    }
  },
  created(){
    this.getUserAndDefaultGraphs(false);
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";

.smallTableHeight{
    max-height:296px;
    min-height:296px;
    overflow-y: scroll;
    overflow-x: hidden;
}

.visTableGraphIcon{
  width:30px;
  color:$ctl-medium-gray;
}

.selectableTableRow:hover td{
    background-color: $ctl-light-gray;
    cursor: pointer;
}
.selectedGraph td , .selectedGraph td .visTableGraphIcon{
    background-color: $ctl-vibrant-blue!important;
    color:$ctl-white!important;
}

.contentContainer{
  background-color: $ctl-white;
}

.deleteGraphButton{
  margin-right:1px;
  padding-left:12px!important;
}

.editGraphButton{
  margin-right:10px;
}

.deleteGraphButton , .editGraphButton{
  height:30px;
  min-width:46px!important;
  max-width:46px!important;
  width:46px!important;
  padding-top:3px;
  padding-left:13px;
  float:right;
}
.commandsCell{
  padding-top:5px!important;
  padding-bottom:3px!important;
}
.commandsColumn{
  width:140px;
}

td{
  padding-top:8px!important;
}


</style>
