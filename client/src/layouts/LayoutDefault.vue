<template>
  <Container class="app-shell" stretched>
    <Header v-if="!isIntro" :open="isMenuOpen" @toggleMenu="isMenuOpen = !isMenuOpen" />

    <main :class="{ 'app-intro': isIntro }">
      <slot />
    </main>

    <Footer v-if="!isIntro" />
  </Container>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Container } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import Header from "@/layouts/Header.vue";
import Footer from "@/layouts/Footer.vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const route = useRoute();
const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);
const isMenuOpen = ref(false);
const isIntro = computed(() => route.path === "/intro");

if (app.value === "cnrs1") {
  import("@/styles/cnrs1.css");
  document.querySelector("html").lang = "fr";
  document.querySelector("body").classList.add("dark");
  locale.value = "cnrs1";
} else {
  import("@/styles/cnrs2.css");
  document.querySelector("html").lang = "en";
  document.querySelector("body").classList.add("light");
  locale.value = "cnrs2";
}

watch(
  () => route.path,
  () => (isMenuOpen.value = false)
);

watch(
  () => app.value,
  (app) => {
    if (app === "cnrs1") {
      import("@/styles/cnrs1.css");
      document.querySelector("html").lang = "fr";
      document.querySelector("body").classList.add("dark");
      locale.value = "cnrs1";
    } else {
      import("@/styles/cnrs2.css");
      document.querySelector("html").lang = "en";
      document.querySelector("body").classList.add("light");
      locale.value = "cnrs2";
    }
  }
);
</script>

<style>
.app-shell {
  min-height: 100vh;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0 !important;
}

main {
  flex: 1;
  position: relative;
}

.app-page {
  padding: var(--size-8);
  gap: var(--size-10);
  margin-inline: auto;
}

.-active {
  background-color: var(--color-full-accent) !important;
  color: var(--color-background-neutral) !important;
  filter: none !important;
}

.-active:not(button) {
  text-decoration: underline !important;
}
</style>
