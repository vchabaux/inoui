<template>
  <div class="width-l app-page">
    <h1 class="color-title">{{ page?.title }}</h1>

    <div v-html="page?.content" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";
import { useRoute } from "vue-router";

const route = useRoute();
const pageStore = useStore("page");
const pages = computed(() => pageStore.list);

const page = computed(() => pages.value.find((p) => p.slug === route.params.slug));
</script>

<style scoped>
:global(main) {
  overflow-y: auto;
}
</style>
