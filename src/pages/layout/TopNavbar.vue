<template>
<div>

  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <h3 id="routeHeader">{{routeName}}</h3>
      <button class="navbar-toggler navbar-burger"
              type="button"
              @click="toggleSidebar"
              :aria-expanded="$sidebar.showSidebar"
              aria-label="Toggle navigation">
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
        <span class="navbar-toggler-bar"></span>
      </button>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item" id="globalDateSelectContainer">
                <dateTimePicker></dateTimePicker>
          </li>
          <li class="nav-item" id="profilesDropdownContainer">
                <profileSelect></profileSelect>
          </li>
        </ul>
      </div>
    </div>
    
  </nav>
</div>
</template>
<script>
import ProfileSelect from '@/components/ProfileSelect.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';

export default {
  components:{
    'profileSelect' : ProfileSelect,
    'dateTimePicker': DateTimePicker, 
  },
  computed: {
    routeName() {
      return this.$route.name;
    }
  },
  data() {
    return {
      loginButtonName: "Unknown"
    };
  },
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    }
  },
  created(){
    this.loginButtonName = localStorage.getItem("username").toUpperCase();
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
@import "../../assets/sass/custom-css/_global.scss";

#routeHeader{
  margin-left:17px;
  margin-top:17px;
}
#profilesDropdownContainer{
  margin-right:15px;
}
#globalDateSelectContainer{
  margin-right:25px;
}
#profilesDropdownContainer , #globalDateSelectContainer{
  margin-top:0px;
}
li i, li p{
  display: inline-block;
}
li{
  margin-right:15px;
}
</style>

