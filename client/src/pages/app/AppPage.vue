<template>
  <Container width="l" class="app-page">
    <Text tag="h1" class="color-title">{{ page?.title }}</Text>

    <Container v-html="page?.content" />
  </Container>
</template>

<script setup>
import { computed } from "vue";
import { Container, Text } from "@owlabio/owl-ui";
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
