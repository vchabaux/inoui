import { api } from "@/api/axios";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";

import App from "@/App.vue";
import Layout from "@/layouts/Layout.vue";
import { initRouter } from "@/router";
// TODO Phase 4: remplacer category-manager par store maison
// import { initStoreCategory } from "@owlabio/category-manager";
import { cnrs1, cnrs2 } from "@/locales/index.js";
// TODO Phase 4: remplacer icon-manager par FontAwesome standard
// import { iconManagerPlugin } from "@owlabio/icon-manager/client";

const app = createApp(App);

const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: "cnrs2",
  fallbackLocale: "cnrs2",
  messages: { cnrs1: cnrs1, cnrs2: cnrs2 },
});

// TODO Phase 4: réactiver avec le store category maison
// initStoreCategory(api, "/nodes");


app
  .use(pinia)
  .use(initRouter(app))
  // TODO Phase 4: réactiver avec FontAwesome standard
  // .use(iconManagerPlugin, { baseURL: import.meta.env.VITE_APP_BACKEND_URL })
  .use(i18n)
  .component("Layout", Layout)
  .mount("#app");
