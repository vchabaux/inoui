<template>
  <footer v-if="credits?.content">
    <p class="text-fade text-center" v-html="credits?.content"></p>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";

const pageStore = useStore("page");
const pages = computed(() => pageStore.list);

const credits = computed(() => pages.value.find((p) => p.slug === "credits"));
</script>

<style scoped>
footer {
  background-color: var(--color-background-neutral);
  padding: var(--size-4) var(--size-6);
  z-index: 12;
}

p {
  max-width: 120ch;
  font-size: var(--size-3);
  margin-inline: auto;
}
</style>
