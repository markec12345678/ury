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
    // R41-FIX: Use /station/:production instead of /:production.
    // The old /:production route caught ALL single-segment paths
    // (e.g., /settings, /help, /foo), making it impossible to add
    // new top-level routes and hiding 404 errors for typos.
    {
      path: "/station/:production",
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