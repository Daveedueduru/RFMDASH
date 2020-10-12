import Login from "@/pages/Login.vue";

import DashboardLayout from "@/pages/layout/DashboardLayout.vue";
import Home from "@/pages/Home.vue";
import Graphs from "@/pages/Graphs.vue";
import HistoricalAlerts from "@/pages/HistoricalAlerts.vue";
import Dashboards from "@/pages/Dashboards.vue";

const routes = [
  {
    path: "/login",
    component: Login,
    name: "Login"
  },
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/login",
    children: [
      {
        path: "home",
        name: "Home",
        component: Home
      },
      {
        path: "graphs",
        name: "Graphs", 
        component: Graphs
      },
      {
        path: "historicalAlerts",
        name: "Alerts", 
        component: HistoricalAlerts
      },
      {
        path: "dashboards",
        name: "Dashboards", 
        component: Dashboards
      }
    ]
  }
];

export default routes;
