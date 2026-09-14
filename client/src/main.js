import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/owl-css-reset.css";
import "@/styles/theme.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@/styles/el-theme.css";

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
  .use(ElementPlus)
  .component("Layout", Layout)
  .mount("#app");