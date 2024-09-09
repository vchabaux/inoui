<template>
  <ScriptFontAwesome />
  <Layout>
    <router-view />
  </Layout>
</template>

<script setup>
import "@owlabio/owl-css/dist/style.css";
import "@owlabio/owl-ui/dist/style.css";
import "@owlabio/da-table/dist/style.css";
import "@owlabio/category-manager/style.css";
import "@owlabio/icon-manager/style";
import "@/styles/theme.css";

import { ScriptFontAwesome } from "@owlabio/icon-manager/client";
import { useStore } from "@/stores";
import Layout from "@/layouts/Layout.vue";
import { computed, watch } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import * as icons from "@/utils/use-icons";

const settingsStore = useStore("settings");
const authStore = useStore("auth");
const userStore = useStore("user");
const noticeStore = useStore("notice");
const nakalaStore = useStore("nakala");
const trackStore = useStore("track");
const playlistStore = useStore("playlist");
const pageStore = useStore("page");
const musicianStore = useStore("musician");

const settings = computed(() => settingsStore.settings);
const app = computed(() => settingsStore.project);
const favicon = document.querySelector("link[rel='icon']");
const headTitle = document.querySelector("title");

settingsStore.initialize();
authStore.initialize();
userStore.find();
noticeStore.find();
trackStore.initialize();
playlistStore.initialize();
pageStore.initialize();
musicianStore.initialize();

library.add(icons);

watch(
  () => settings.value,
  (settings) => {
    if (settings) {
      favicon.href = app.value === "cnrs1" ? "/cnrs1.png" : "/cnrs2.png";
      headTitle.innerHTML =
        app.value === "cnrs1" ? settings.name.toUpperCase() : settings.name;
    }

    if (settings.storage.destination === "nakala") {
      nakalaStore.initialize();
    }
  }
);
</script>

<style>
pre {
  white-space: pre-wrap;
}

.small-text {
  font-size: var(--size-3-5);
}

.danger-btn {
  --color-full-accent: crimson !important;
}

.owl-dialog-content {
  width: min(50ch, 100vw) !important;
}

.upload-forms {
  margin-block-start: var(--size-8);
}

.upload-btn {
  margin-block-start: var(--size-4);
}

/* fix for safari, this is very buggy (and not disturbing other browsers) */
.-icon {
  aspect-ratio: unset !important;
}
</style>
