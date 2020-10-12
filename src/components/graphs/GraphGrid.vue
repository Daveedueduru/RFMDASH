<template>
  <div class="graphContainerContainer">
    <div class="graphContainer">
      <grid-layout
        :layout.sync="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :is-mirrored="false"
        :vertical-compact="true"
        :preventCollision="false"
        :margin="[10, 10]"
        :use-css-transforms="true"
        :responsive="false"
        :isDraggable="pageName == 'Home'"
        :isResizable="pageName == 'Home'"
        @layout-updated="gridLayoutUpdatedEvent"
      >
        <grid-item
          v-for="item in layout"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minW="2"
          :minH="5"
          :dragIgnoreFrom="'.innerGraphBody, .optionButtons'"
          :key="item.i"
          @resized="gridItemResizedEvent"
          v-bind:class="{applyTransitions:applyTransitions}"
        >
          <graphContent ref="graphContentRef" :graphObject="getGraphObjectByIdFromCache(item.i)" :loadGraphOnCreate="true" :isPreview="false" :pageName="pageName"></graphContent>
        </grid-item>

      </grid-layout>
    </div>
  </div>
</template>

<script>
import GraphContent from "@/components/graphs/GraphContent.vue";

export default {
  name: "GraphGrid",
  components: {
    graphContent: GraphContent
  },
  computed: {},
  props:{
    pageName : {
      type: String,
      required : true
    }
  },
  data() {
    return {
      applyTransitions:false,
      graphContainerHeight: "0px",
      layout: []
    };
  },
  methods: {
    gridLayoutUpdatedEvent(layout) {
      this.saveCustomGraphsLayout(layout);
      window.dispatchEvent(new Event('resize'));
    },
    gridItemResizedEvent(i, newH, newW, newHPx, newWPx) {
      window.dispatchEvent(new Event('resize'));
    },
    loadGraphsForGridByPage(pageName){
        if(pageName == "null") // The /Dashboards page has been loaded for the first time so we need to wait until a layout is selected.
          return;

        // Go and fetch both the users graphs & layout in a single call from the service.
        // If the user is new, just set the cache to empty and move in.
        // If the user has data, store it into the local cache. Only after that should we update the graphGrid layout as it pulls graph objects from the cache.
      
        if(pageName == "Home"){ // If we are not on the home page, then get graphs based on the pageName and not the user to load the default pages graphs.
          var user = localStorage.getItem("username") + ",*.defaults";
          localStorage.removeItem("dashboardSettings");
        }
        else{
          var user = pageName.creator.toLowerCase() + ",*.defaults";
          var layoutId = pageName.id;
        }
        var rawUsername = localStorage.getItem("username");

        var uri = '/conflux/fetchGraphs?creator=' + user;
        var headers = { headers: {'Content-Type':'application/json'} };
        var self = this;
        this.axios.get( uri , headers
        ).then(function (response) {
            localStorage.setItem("layout",JSON.stringify([]));
            localStorage.setItem("graphs",JSON.stringify([]));
            if(response.data.length == 0)
              return;
            var graphsForCache = [];
            var graphsAndLayout = response.data;
            for (let i = 0; i < graphsAndLayout.length; i++) {
              const el = graphsAndLayout[i];
              if(el.type != 'layout'){
                graphsForCache.push(el);
              }
              else if(el.type == 'layout'){ // Get the proper layout here since the call is pulling multiple.
                if(el.creator == rawUsername && pageName == 'Home' && el.id == ("dashId." + rawUsername + ".layout")) // If we are on the home page, only set the layout to the user who is currently logged in.
                  localStorage.setItem("layout", JSON.stringify(el.data));
                else if(pageName != 'Home' && el.id == layoutId) // Else if we are on any other page then we are only pulling that pages layout so set it.
                  localStorage.setItem("layout", JSON.stringify(el.data));
              }
            }
            localStorage.setItem("graphs", JSON.stringify(graphsForCache));
            self.layout = JSON.parse(localStorage.getItem("layout"));
            self.$root.$emit('updateGraphContents', true); // Added 12/6 SB
        }).catch(function (error) {
            localStorage.setItem("layout",JSON.stringify([]));
            localStorage.setItem("graphs",JSON.stringify([]));
            console.error(error);
            alert("Unable to load graphs for "+localStorage.getItem("username")+"! Please try again. Error:1");
        });

    },
    saveCustomGraphsLayout(layout, editedId){ // This is called on any layout change. Save the layout to ES and then update the cache and local variable after.
     if(localStorage.getItem("dashboardSettings") !== null)
        var dashboardSettings = JSON.parse(localStorage.getItem("dashboardSettings"));
      else
        var dashboardSettings = null;

      var username = localStorage.getItem("username");
      var currentDate = Date.now();
      var self = this;
      var payload = {
        type: 'layout', 
        creator: username , 
        data: layout
      };
      if(dashboardSettings != null){ // We are saving a new dashboard so add the new metadata
        payload.name = dashboardSettings.name;
        payload.permission = dashboardSettings.permission;
        payload.id = dashboardSettings.id;
      }else{ // We are re-saving our current private home dashboard.
        dashboardSettings = {
          name: "Home Dashboard",
          permission: "private",
          id: "dashId." + username + ".layout"
        };
        payload.name = dashboardSettings.name;
        payload.permission = dashboardSettings.permission;
        payload.id = dashboardSettings.id;
      }

      //console.log(payload);
      var headers =  { headers: {'Content-Type':'application/json'}};
      this.axios.post( '/conflux/saveGraph' , payload , headers
      ).then(function (response) {
          localStorage.setItem("layout",JSON.stringify(layout));
          localStorage.setItem("dashboardSettings",JSON.stringify(dashboardSettings));
          if(editedId != null && editedId != "reloadDashboards") // If we are saving a new layout after an EDIT we will need to remove the graph temporarily so the v-layout component will redraw it with its new data.
            for (let i = 0; i < self.layout.length; i++)
              if(self.layout[i].i == editedId)
                self.layout[i].i = null; //Set layout id to null and then wait for the next tick to restore it so the vue-layout will re-render the component.
          self.$nextTick(() => { 
            self.layout = layout;
            if(editedId == "reloadDashboards"){ // We are abusing the editedId field here to go and update the dashboard select dropdown if we just saved a new one
              setTimeout(function(){
                self.$parent.$refs.dashboardSelect.getDashboards(true);
              }, 1000);
            } 
          });

      }).catch(function (error) {
          console.error(error);
          alert("Unable to save layout! Please try again. Error:1");
      });
    },
    getGraphObjectByIdFromCache(id){ // We can pull graph objects from the cache because we always update the graphs in the cache on created() before initializing this.layout which will call this function.
      if(localStorage.getItem("graphs") !== null){
        var graphs = JSON.parse(localStorage.getItem("graphs"));
        for (let i = 0; i < graphs.length; i++) {
          if(graphs[i].id == id){
            return graphs[i];
          }
        }
      }
      return {id:id, reason: "Graph does not exist."};
    }
  },
  mounted() {
    this.loadGraphsForGridByPage(this.pageName);

    this.$root.$off('saveNewLayout');
    this.$root.$on('saveNewLayout', (layout) => {this.saveCustomGraphsLayout(layout, null); });
    this.$root.$off('saveNewEditedLayout');
    this.$root.$on('saveNewEditedLayout', (layout, editedId) => {this.saveCustomGraphsLayout(layout, editedId); });

    this.$root.$off('updateGraphContents');
    this.$root.$on('updateGraphContents', (mostlyTrue) => {
      var graphs = this.$refs.graphContentRef; // Gets ALL the graphContent children. Then just loop through and draw their graphs!
      if(graphs != undefined)
        for (let i = 0; i < graphs.length; i++)
          graphs[i].drawGraph();
    });
  },
  beforeDestroy() {
    this.$root.$off('saveNewLayout');
    this.$root.$off('saveNewEditedLayout');
    this.$root.$off('updateGraphContents');
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";

.graphContainerContainer {
  margin-left: -10px;
  margin-bottom: 15px;
  width: calc(100% + 20px);
  max-width: calc(100% + 20px);
}

.graphContainer {
  display: inline;
  padding: 0px;
}

.vue-grid-item {
  border: solid 1px $ctl-border-gray;
  background-color: $ctl-white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

</style>
