import './index.css';
import { createApp, reactive } from "vue";
import App from "./App.vue";

import router from './router';

const app = createApp(App);

// Plugins
app.use(router);

// Auth state shared between router guard and components
const authState = reactive({ isLoggedIn: false });

// R38-FIX: Track whether the initial auth check has completed.
// Without this, the router guard runs before the async fetch resolves,
// causing authenticated users to flash the login page on refresh.
let authChecked = false;
const authCheckPromise = fetch("/api/method/frappe.auth.get_logged_user")
  .then(res => res.ok ? res.json().catch(() => null) : Promise.reject())
  .then(data => {
    if (data && data.message && data.message !== "Guest") {
      authState.isLoggedIn = true;
    }
  })
  .catch(() => {
    // Not logged in — stay on login page
  })
  .finally(() => {
    authChecked = true;
  });

// Configure route guards
router.beforeEach(async (to, from, next) => {
  try {
    // Wait for the initial auth check on first navigation only
    if (!authChecked) {
      await authCheckPromise;
    }
    if (to.matched.some((record) => !record.meta.isLoginPage)) {
      // This route requires auth, check if logged in
      if (!authState.isLoggedIn) {
        next({ name: 'Login', query: { route: to.path } });
      } else {
        next();
      }
    } else {
      if (authState.isLoggedIn) {
        next({ name: 'Home' });
      } else {
        next();
      }
    }
  } catch (err) {
    console.error('Navigation guard error:', err);
    next({ name: 'Login' });
  }
});

app.provide('authState', authState);
app.mount("#app");