<template>
  <div :class="{'nav-open': $sidebar.showSidebar}">
    <notifications></notifications>
    <router-view @authenticated="setAuthState"></router-view>
  </div>
</template>

<script>
    export default {
        name: 'App',
        data() {
            return {
                authenticated: false,
            }
        },
        mounted() {
            if(this.getAuthState()){
              this.setAuthState(true);
            }
            if(!this.authenticated) {
                this.routeToLogin();
            }
        },
        methods: {
            setAuthState(status) { // This is triggered on router-view when the login page or logout button emit an authenticated event.
                this.authenticated = status;
                if(status == false){
                  this.deleteAuthState();
                  this.routeToLogin();
                }
                else{
                  this.routeToHome();
                }
            },
            getAuthState(){
              return this.$cookie.get('auth') && localStorage.getItem("username") !== null && localStorage.getItem("username") != "";
            },
            deleteAuthState(){
              localStorage.removeItem('fullname');
              localStorage.removeItem('username');
              localStorage.removeItem('token');
              this.$cookie.delete('auth');
            },
            routeToLogin(){
              this.$router.replace({ name: "Login" });
            },
            routeToHome(){
              this.$router.replace({ name: "Home" });
            }
        }
    }
</script>

<style lang="scss">
.vue-notifyjs.notifications {
  .alert {
    z-index: 10000;
  }
  .list-move {
    transition: transform 0.3s, opacity 0.4s;
  }
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active {
    transition: transform 0.2s ease-in, opacity 0.4s ease-in;
  }
  .list-leave-active {
    transition: transform 1s ease-out, opacity 0.4s ease-out;
  }

  .list-enter {
    opacity: 0;
    transform: scale(1.1);
  }
  .list-leave-to {
    opacity: 0;
    transform: scale(1.2, 0.7);
  }
}
</style>
