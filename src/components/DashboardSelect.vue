<template>
<div> 
    <v-select id="dashboardSelectDropdown" placeholder="Select A Dashboard " label="name" :options="dashboards" v-model="selectedDashboard" v-on:input="selectDashboard(selectedDashboard)" />
</div>
</template>

<script>


export default {
  name: 'DashboardSelect',
  props:{
    public : {
      type: Boolean,
      default : false
    },
    private : {
      type: Boolean,
      default : false
    },
  },
  data() {
    return {
        selectedDashboard: null,
        dashboards: []
    };
  },
  methods: {
    getDashboards(setSelectedToLocalDashboardSettings){
        var self = this;
        var uri = '/conflux/searchGraphs?query=type:layout AND '+ this.showByPermission() +' AND id:dashId*';
        var headers = { headers: {'Content-Type':'application/json'} };
        this.axios.get( uri , headers ).then(function (response) {
            var tempDashboards = [];
            for (let i = 0; i < response.data.length; i++){
              if(response.data[i].type == 'layout'){
                tempDashboards.push(response.data[i]);
              }
            }
            self.dashboards = self.sortByKey(tempDashboards,"name");
            for (let i = 0; i < self.dashboards.length; i++) { // This just moves your "Home Dashboard" to the top
              const el = self.dashboards[i];
              if(el.id == "dashId." +localStorage.getItem("username") + ".layout"){
                self.dashboards.splice(i,1);
                //el.name = el.name + " (STATIC)";
                self.dashboards.unshift(el);
                break;
              }
            }
            if(self.private && self.dashboards.length > 0){ // We are on the home page so set the current dashboard to either the one we just saved or Home
              if(setSelectedToLocalDashboardSettings)
                self.selectedDashboard = JSON.parse(localStorage.getItem("dashboardSettings"));
              else
                self.selectedDashboard = self.dashboards[0];
            }else if (self.public &&  localStorage.getItem("lastViewedPublicDashboard") !== null){ // Reload the last dashboard the user viewed on this page by ID
                var lastViewedPublicDashboardId = localStorage.getItem("lastViewedPublicDashboard");
                for (let i = 0; i < self.dashboards.length; i++) {
                  const el = self.dashboards[i];
                  if(el.id == lastViewedPublicDashboardId){
                    self.selectedDashboard = el;
                    self.selectDashboard(el);
                    break;
                  }
                }
            }
        }).catch(function (error) {
            console.error(error);
            alert("Unable to load dashboards! Please try again. Error:1");
        });
    },
    showByPermission(){
      var queryString = "";
      if(this.public)
        queryString += "permission:public ";
      if(this.public && this.private)
        queryString += "AND ";
      if(this.private)
        queryString += "(permission:private OR permission:public) AND creator:" + localStorage.getItem("username").toLowerCase();
      return queryString;
    },
    selectDashboard(selectedDashboard){
        if(this.public){
          localStorage.setItem("lastViewedPublicDashboard",selectedDashboard.id);
        }
        localStorage.setItem("dashboardSettings",JSON.stringify({
          name: selectedDashboard.name,
          permission: selectedDashboard.permission,
          id: selectedDashboard.id
        }));
        this.$emit('dashboardWasSelected', selectedDashboard);
    },
    sortByKey(array, key) {
        return array.sort(function(a, b) {var x = a[key].toLowerCase(); var y = b[key].toLowerCase(); return ((x < y) ? -1 : ((x > y) ? 1 : 0)); });
    }
  },
  created(){
        this.getDashboards(false);
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";

</style>
