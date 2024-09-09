<template>
  <Container v-if="credits?.content" tag="footer">
    <Text variant="fade" align="center" v-html="credits?.content"></Text>
  </Container>
</template>

<script setup>
import { computed } from "vue";
import { Container, Text } from "@owlabio/owl-ui";
import { useStore } from "@/stores";

const pageStore = useStore("page");
const pages = computed(() => pageStore.list);

const credits = computed(() => pages.value.find((p) => p.slug === "credits"));
</script>

<style scoped>
footer {
  background-color: var(--color-background-neutral);
  padding: var(--size-2) var(--size-6);
  z-index: 12;
}

p {
  max-width: 120ch;
  font-size: var(--size-3);
  margin-inline: auto;
}
</style>
