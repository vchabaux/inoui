import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";

import App from "@/App.vue";
import Layout from "@/layouts/Layout.vue";
import { initRouter } from "@/router";
import { cnrs1, cnrs2 } from "@/locales/index.js";

const app = createApp(App);

const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: "cnrs2",
  fallbackLocale: "cnrs2",
  messages: { cnrs1: cnrs1, cnrs2: cnrs2 },
});

app
  .use(pinia)
  .use(initRouter(app))
  .use(i18n)
  .use(PrimeVue)
  .component("Layout", Layout)
  .mount("#app");