<template>
<div> 
    <v-select id="profilesDropdown" placeholder="Select Profiles (All)" label="name" multiple :options="profiles" v-model="selectedProfiles" v-on:input="saveSelectedProfiles()" />
</div>
</template>

<script>

export default {
  name: 'ProfileSelect',
  components:{
  },
  computed: {
  },
  data() {
    return {
        loadingProfiles: false,
        profiles : [
            {name: 'Loading Profiles...', id: ''}
        ],
        selectedProfiles:[]
    };
  },
  methods: {
    loadProfiles(){
      var self = this;
      this.loadingProfiles = true;
      this.axios({
        method:'get',
        url: '/conflux/profiles',
        timeout: 45000
      }).then(function (response) {
        response = self.$JSONBigInt.parse(response.data.payload);
        var parsedProfiles = [];
        for (let i = 0; i < response.length; i++) {
          if(response[i].type == "PUBLICPROFILE")
            parsedProfiles.push({
              name: response[i].name,
              id: response[i].id.toString()
            });
        }
        self.profiles = self.sortByKey(parsedProfiles,'name');
      }).catch(function (error) {
        console.error(error);
        alert("Error while loading profiles! Error: 1");
      }).then(function (response) {
        self.loadingProfiles = false;
      });
    },
    loadSelectedProfiles(){
      if(localStorage.getItem("profiles") !== null)
        this.selectedProfiles = JSON.parse(localStorage.getItem("profiles"));
      else
        localStorage.setItem("profiles",JSON.stringify([]));
    },
    saveSelectedProfiles(){
      localStorage.setItem("profiles", JSON.stringify(this.selectedProfiles));
      this.$root.$emit('updateGraphContents', true);
    },
    sortByKey(array, key) {
        return array.sort(function(a, b) {var x = a[key]; var y = b[key]; return ((x < y) ? -1 : ((x > y) ? 1 : 0)); });
    },
  },
  created(){
    this.loadProfiles();
    this.loadSelectedProfiles();
  }
};

</script>

<style type="text/scss" lang="scss" scoped>
@import "../assets/sass/custom-css/_global.scss";

#profilesDropdownContainer{
  margin-right:25px;
}
#profilesDropdown{
  margin-top:15px;
  display: inline-block;
  min-width:295px;
  width:100%;
  background-color:$ctl-white;
  border-radius: 4px;
  height:36px;
  cursor: pointer!important;
}
</style>
