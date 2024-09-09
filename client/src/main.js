import { api } from "@/api/axios";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";

import App from "@/App.vue";
import Layout from "@/layouts/Layout.vue";
import { initRouter } from "@/router";
import { initStoreCategory } from "@owlabio/category-manager";
import { cnrs1, cnrs2 } from "@/locales/index.js";
import { iconManagerPlugin } from "@owlabio/icon-manager/client";

const app = createApp(App);

const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: "cnrs2",
  fallbackLocale: "cnrs2",
  messages: { cnrs1: cnrs1, cnrs2: cnrs2 },
});

initStoreCategory(api, "/nodes");


app
  .use(pinia)
  .use(initRouter(app))
  .use(iconManagerPlugin, { baseURL: import.meta.env.VITE_APP_BACKEND_URL })
  .use(i18n)
  .component("Layout", Layout)
  .mount("#app");
