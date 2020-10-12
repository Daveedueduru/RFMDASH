<template>
  <div>

      <div class="row searchRow">
        <div class="col-3">
          <input class="form-control searchBarItem" v-on:keydown.enter="updateQueryAndGetGraphs()" v-model="inputQuery" placeholder="Search Data"/>
        </div>
        <div class="col-3" id="homeDashboardSelect">
          <dashboardSelect ref="dashboardSelect" :private="true" @dashboardWasSelected="loadDashboard"></dashboardSelect>
        </div>
        <div class="col-2">
          <button class="btn btn-success searchBarItem" v-on:click="showSaveLayoutModal()"><fai icon="save" />&nbsp; Save Dashboard</button>
        </div>
        <div class="col-2">
          <button class="btn btn-success searchBarItem" v-on:click="showAddGraphModal()"><fai icon="plus-square" />&nbsp; Add Graph</button>
        </div>
        <div class="col-2">
          <button class="btn btn-success searchBarItem" v-on:click="showCreateNewModal()"><fai icon="chart-line" />&nbsp; Create Graph</button>
        </div>
      </div>

      <graphGrid ref="graphGridHome" :pageName="'Home'"></graphGrid>

      <createGraphModal ref="createGraphModal"></createGraphModal>
      <addGraphModal ref="addGraphModal"></addGraphModal>
      <saveLayoutModal ref="saveLayoutModal"></saveLayoutModal>

  </div>
</template>

<script>
import ModalCreateGraph from '@/components/modals/ModalCreateGraph.vue';
import ModalAddGraph from '@/components/modals/ModalAddGraph.vue';
import ModalSaveLayout from '@/components/modals/ModalSaveLayout.vue';
import DashboardSelect from '@/components/DashboardSelect.vue';

export default {
  name: "Home",
  components: {
    'createGraphModal': ModalCreateGraph,
    'addGraphModal': ModalAddGraph,
    'saveLayoutModal': ModalSaveLayout,
    'dashboardSelect': DashboardSelect
  },
  data() {
    return {
      debounceInput: null,
      inputQuery: ""
    };
  },
  methods: {
    showCreateNewModal(){
      this.$refs.createGraphModal.toggle();
    },
    showAddGraphModal(){
      this.$refs.addGraphModal.toggle();
    },
    showSaveLayoutModal(){
      this.$refs.saveLayoutModal.toggle();
    },
    setQuery(){
      if(localStorage.getItem("query") !== null)
        this.inputQuery = localStorage.getItem("query");
    },
    updateQueryAndGetGraphs(){
      localStorage.setItem("query",this.inputQuery);
      this.$root.$emit('updateGraphContents', true);
    },
    loadDashboard(dashboardSettings){
      this.$refs.graphGridHome.loadGraphsForGridByPage(dashboardSettings);
    }
  },
  created(){
    this.setQuery();
  }
};

</script>

<style scoped>
.searchBarItem{
  width:100%;
}
</style>
