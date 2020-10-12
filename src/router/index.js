import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
Vue.use(VueRouter);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: "active",
  //mode: 'history',
  base: '/dash/'
});
//Set mode to history for hash for easy routing with apache.
//Remove base for dev env.
export default router;
