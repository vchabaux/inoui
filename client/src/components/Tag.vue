<template>
  <div class="tag-container flow-row" :is="tag">
    <span class="tag-text text-inverted"># {{ label }}</span>
    <Button class="tag-btn" aria-label="remove" title="remove" text size="small" @click="emits('delete')">
      <i class="fa-solid fa-xmark" />
    </Button>
  </div>
</template>

<script setup>
import Button from "primevue/button";

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
