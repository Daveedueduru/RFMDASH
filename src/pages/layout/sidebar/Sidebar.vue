<template>
  <div class="sidebar"
       :data-background-color="backgroundColor"
       :data-active-color="activeColor">
    <div class="sidebar-wrapper" id="style-3">
      <div class="logo">
        <a href="./home" class="simple-text">
            <div class="logo-img">
                <img src="@/assets/img/lmnwhitelogo.png" alt="">
            </div>
          {{title}}
        </a>
      </div>
      <slot>

      </slot>
      <ul class="nav">
        <!--By default vue-router adds an active class to each route link. This way the links are colored when clicked-->
        <slot name="links">
          <sidebar-link v-for="(link,index) in sidebarLinks"
                        :key="index"
                        :to="link.path"
                        :name="link.name"
                        :icon="link.icon">
          </sidebar-link>
        </slot>
      </ul>
      <moving-arrow :move-y="arrowMovePx">
      </moving-arrow>
        <div class="nav-item"  id="accountNameContainer" @click="logout()" @mouseover="accountNameButton='Logout'" @mouseout="setAccountButtonToUsername()">
          <div class="dropdown show">
            <a class="btn btn-secondary accountButton" href="#" role="button" id="logoutButton">
              <fai icon="sign-out-alt" />&nbsp;&nbsp;<span>{{accountNameButton}}&nbsp;</span> 
            </a>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
import MovingArrow from "./MovingArrow.vue";
import SidebarLink from "./SidebarLink";
export default {
  props: {
    title: {
      type: String,
      default: ""
    },
    backgroundColor: {
      type: String,
      default: "black",
      validator: value => {
        let acceptedValues = ["white", "black", "darkblue"];
        return acceptedValues.indexOf(value) !== -1;
      }
    },
    activeColor: {
      type: String,
      default: "success",
      validator: value => {
        let acceptedValues = [
          "primary",
          "info",
          "success",
          "warning",
          "danger"
        ];
        return acceptedValues.indexOf(value) !== -1;
      }
    },
    sidebarLinks: {
      type: Array,
      default: () => []
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  provide() {
    return {
      autoClose: this.autoClose,
      addLink: this.addLink,
      removeLink: this.removeLink
    };
  },
  components: {
    MovingArrow,
    SidebarLink
  },
  computed: {
    /**
     * Styles to animate the arrow near the current active sidebar link
     * @returns {{transform: string}}
     */
    arrowMovePx() {
      return this.linkHeight * this.activeLinkIndex;
    }
  },
  data() {
    return {
      linkHeight: 66,
      activeLinkIndex: 0,
      windowWidth: 0,
      isWindows: false,
      hasAutoHeight: false,
      links: [],
      accountNameButton: "Unknown"
    };
  },
  methods: {
    findActiveLink() {
      this.links.forEach((link, index) => {
        if (link.isActive()) {
          this.activeLinkIndex = index;
        }
      });
    },
    addLink(link) {
      const index = this.$slots.links.indexOf(link.$vnode);
      this.links.splice(index, 0, link);
    },
    removeLink(link) {
      const index = this.links.indexOf(link);
      if (index > -1) {
        this.links.splice(index, 1);
      }
    },
    setAccountButtonToUsername(){
      this.accountNameButton = localStorage.getItem("username").toUpperCase();
    },
    logout(){
      this.$parent.$emit("authenticated", false); // Must access $parent first because this is nested inside DashboardLayout.
    }
  },
  mounted() {
    this.setAccountButtonToUsername();
    this.$watch("$route", this.findActiveLink, {
      immediate: true
    });
  }
};
</script>

<style type="text/scss" lang="scss" scoped>
#accountNameContainer{
  position:absolute;
  left:20px;
  bottom:25px;
  width:175px;
  max-width:175px;
}
#accountNameContainer a{
  width:100%;
  overflow: hidden;
  font-size: 14px;
}
#logoutButton{
  background-color: #222222;
  border-color: #545b62;
}
#logoutButton:hover{
  background-color: #545b62;
}
</style>
