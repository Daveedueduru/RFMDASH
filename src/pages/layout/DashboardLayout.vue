<template>
  <div class="wrapper">
    <side-bar>
      <template slot="links">
        <sidebar-link to="/home" name="Home" icon="home"/>
        <sidebar-link to="/graphs" name="My Graphs" icon="chart-pie"/>
        <sidebar-link to="/historicalalerts" name="Alerts" icon="history"/> 
        <!-- <sidebar-link to="/sites" name="Sites" icon="map"/>
        <sidebar-link to="/users" name="Users" icon="users"/>
        <sidebar-link to="/devices" name="Devices" icon="server"/>
        <sidebar-link to="/tickets" name="Tickets" icon="ticket-alt"/> -->
        <!-- <sidebar-link to="/suppressions" name="Suppressions" icon="eye"/> -->
        <sidebar-link to="/dashboards" name="Dashboards" icon="th"/>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>
      <dashboard-content @click.native="toggleSidebar"></dashboard-content>
      <!-- <content-footer></content-footer> -->
      <div id="backgroundPathwayContainer">
        <img src="@/assets/img/pathways.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import MobileMenu from "./MobileMenu";
export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    MobileMenu
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    }
  }
};
</script>

<style lang="scss">
  .main-panel{
    height: calc(100% - 55px);
  }
  #backgroundPathwayContainer{
      position: fixed;
      right:0px;
      bottom:0px;
      z-index:-100;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      pointer-events: none!important;
      display: none!important;
  }
  #backgroundPathwayContainer img{
      width:100%;
      height:100%;
      pointer-events: none!important;
  }
</style>
