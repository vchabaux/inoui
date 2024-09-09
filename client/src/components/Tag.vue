<template>
  <Container class="tag-container" :tag="tag" flow="row">
    <Text class="tag-text" variant="inverted"># {{ label }}</Text>
    <Button class="tag-btn" aria-label="remove" title="remove" variant="plain" size="nested" @click="emits('delete')">
      <Icon name="xmark" />
    </Button>
  </Container>
</template>

<script setup>
import { Button, Container, Icon, Text } from "@owlabio/owl-ui";

const emits = defineEmits(["delete"]);

const props = defineProps({
  tag: {
    type: String,
    default: "div",
  },
  label: {
    type: String,
    required: true
  },
});
</script>

<style scoped>
.tag-container {
  padding-inline-start: var(--size-3);
  background-color: var(--color-full-accent);
  color: var(--color-text-inverted);
  border-radius: var(--app-radius, var(--radius-2));
  overflow: hidden;
  gap: var(--size-1);
  width: max-content;
}

.tag-text {
  line-height: 1;
}

.tag-btn {
  padding: var(--size-1);
}
</style>
