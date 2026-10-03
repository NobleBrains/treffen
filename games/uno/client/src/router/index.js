import Vue from "vue";
import VueRouter from "vue-router";
const Home = () => import("@/views/Home.vue");
const Game = () => import("@/views/Game.vue");
const Stats = () => import("@/views/Stats.vue");

Vue.use(VueRouter);

const isUnoSubpath =
  typeof window !== "undefined" &&
  window.location &&
  window.location.pathname.startsWith("/uno");

const routes = [
  {
    path: "/",
    alias: ["/uno", "/uno/"],
    name: "Home",
    component: Home,
  },
  {
    path: "/game",
    alias: ["/uno/game"],
    name: "Game",
    component: Game,
  },
  {
    path: "/stats",
    alias: ["/uno/stats"],
    name: "Stats",
    component: Stats,
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  mode: "history",
  base: isUnoSubpath ? "/uno/" : "/",
  routes,
});

export default router;
