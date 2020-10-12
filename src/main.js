import Vue from 'vue';
import App from './App';
import "es6-promise/auto";
import 'bootstrap';
import router from "./router/index";
import SideBar from "@/pages/layout/sidebar";
import GraphGrid from "@/components/graphs/GraphGrid.vue";
import axios from 'axios'
import VueAxios from 'vue-axios'
import Notify from "vue-notifyjs";
import vSelect from 'vue-select'; // https://www.npmjs.com/package/vue-select
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'; // https://www.npmjs.com/package/vue-ctk-date-time-picker  +   https://chronotruck.github.io/vue-ctk-date-time-picker
import VueCookie from 'vue-cookie'; // https://www.npmjs.com/package/vue-cookie
import VueGridLayout from 'vue-grid-layout'; //https://github.com/jbaysolutions/vue-grid-layout
import Moment from 'vue-moment';
import JSONBigInt from 'json-bigint';
import VueLodash from 'vue-lodash';
import proj4 from 'proj4';
if (typeof window !== 'undefined')
  window.proj4 = window.proj4 || proj4;
import HighchartsVue from 'highcharts-vue' //https://api.highcharts.com/highcharts/chart.zoomType  https://github.com/highcharts/highcharts-vue
import Highcharts from 'highcharts';
import HighChartsMore from 'highcharts/highcharts-more';
import HighChartsWordCloud from 'highcharts/modules/wordcloud';
import HighchartsMap from 'highcharts/modules/map';

//HC Maps
import usaMap from '@highcharts/map-collection/countries/us/us-all.geo.json';
import worldMap from '@highcharts/map-collection/custom/world-highres3.geo.json';
import europeMap from '@highcharts/map-collection/custom/europe.geo.json';
import northAmericaMap from '@highcharts/map-collection/custom/north-america.geo.json';
import southAmericaMap from '@highcharts/map-collection/custom/south-america.geo.json';
import asiaMap from '@highcharts/map-collection/custom/asia.geo.json';
import oceaniaMap from '@highcharts/map-collection/custom/oceania.geo.json';
import africaMap from '@highcharts/map-collection/custom/africa.geo.json';

//Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

//CSS Imports
import "bootstrap/dist/css/bootstrap.css";
import "vue-notifyjs/themes/default.css";
import 'vue-select/dist/vue-select.css';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
import "@/assets/sass/main.scss";

library.add(fas);

Vue.use(SideBar);
Vue.use(Notify);
Vue.use(Moment);
Vue.use(VueCookie);
Vue.use(VueAxios, axios);
Vue.use(VueLodash, { name: 'lodash' });

Vue.use(HighchartsVue);

HighChartsMore(Highcharts);
HighChartsWordCloud(Highcharts);

if (typeof window !== 'undefined') {
    HighchartsMap(Highcharts);
    Highcharts.maps['usaMap'] = usaMap;
    Highcharts.maps['worldMap'] = worldMap;
    Highcharts.maps['europeMap'] = europeMap;
    Highcharts.maps['northAmericaMap'] = northAmericaMap;
    Highcharts.maps['southAmericaMap'] = southAmericaMap;
    Highcharts.maps['asiaMap'] = asiaMap;
    Highcharts.maps['oceaniaMap'] = oceaniaMap;
    Highcharts.maps['africaMap'] = africaMap;
}
  
Object.defineProperty(Vue.prototype,'$JSONBigInt',{value:JSONBigInt});

Vue.component('graphGrid',GraphGrid);

Vue.component('fai', FontAwesomeIcon);
Vue.component('v-select', vSelect);
Vue.component('v-ctk-datetimepicker', VueCtkDateTimePicker);

Vue.component('grid-layout',VueGridLayout.GridLayout);
Vue.component('grid-item',VueGridLayout.GridItem);

Vue.config.productionTip = false;

Highcharts.setOptions({
  colors: ['#38C6F4', '#0C9ED9', '#0075C9','#083176','#3F4145']
  //colors: ['#0af229', '#f20a8d', '#0aeef2','#f2a10a' , '#ff2a26']
});

axios.defaults.baseURL = process.env.API; // Set the default base API url to whatever is in the config
axios.defaults.timeout = 10000;
axios.defaults.headers.common['l3_TOKEN'] = null;
//axios.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
axios.interceptors.response.use((response) => {
  return response;
}, function (error) {
  // console.log(error.toString());
  // if(error.toString().includes("500"))
    // this.$emit("authenticated", false); 
  return Promise.reject(error);
});

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
