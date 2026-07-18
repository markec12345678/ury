import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import authRoutes from './auth';

const routes = [
    {
      path: "/",
      name: "Home",
      component: Home,
      meta: { isLoginPage: false },
    },
    // R36-FIX: Production station route for proper URL parsing
    {
      path: "/:production",
      name: "KDSStation",
      component: Home,
      meta: { isLoginPage: false },
    },
    ...authRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
];

const router = createRouter({
  history: createWebHistory("/URYMosaic/"),
  routes,
});

export default router;