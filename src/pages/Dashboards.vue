<template>
<div> 
    <div class="row searchRow">
        <div class="col-7">
            <input class="form-control" 
            v-on:keydown.enter="searchStaticGraphs(staticSearch,'enter');" 
            v-model="staticSearch" :placeholder="'Search Dashboard'" /> 
            </div>
        <div class="col-5">
            <dashboardSelect :public="true" @dashboardWasSelected="loadDashboard"></dashboardSelect>
        </div>
    </div>

    <graphGrid :pageName="selectedDashboard" ref="staticGraphGridRef"></graphGrid>
</div>
</template>

<script>
import DashboardSelect from '@/components/DashboardSelect.vue';

export default {
  name: 'Dashboards',
  components:{
      'dashboardSelect': DashboardSelect,
  },
  computed: {
  },
  data() {
    return {
        staticSearch : "",
        selectedDashboard: "null"
    };
  },
  methods: {
    loadDashboard(selectedDashboard){
        var self = this;
        this.$nextTick(() => { 
            self.$refs.staticGraphGridRef.loadGraphsForGridByPage(selectedDashboard);
        });
    },
    getQueryIfSet(){
      if(localStorage.getItem("query") !== null)
        return localStorage.getItem("query");
      else 
        return "";
    },
    searchStaticGraphs(query,key){
      localStorage.setItem("query",query);
      this.$root.$emit('updateGraphContents', true);
    }
  },
  mounted(){
      this.staticSearch = this.getQueryIfSet();
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";


</style>
