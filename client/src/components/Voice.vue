<template>
  <Container class="voice-container" :class="type" variant="surface">
    <Button
      v-if="closable"
      class="voice-btn"
      variant="text"
      size="s"
      aria-label="close"
      title="close"
      @click="handleClose"
    >
      <Icon name="xmark" />
    </Button>

    <Text
      class="voice-message small-text"
      variant="inherit"
      v-html="message"
    ></Text>
  </Container>
</template>

<script setup>
import { Container, Button, Icon, Text } from "@owlabio/owl-ui";

defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    validator: (value) => ["warning", "success", "error"].includes(value),
  },
  closable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const handleClose = () => emit("close");
</script>

<style scoped>
.voice-container {
  position: relative;
  max-width: 65ch;
  padding: var(--size-2) var(--size-4);
}

.voice-btn {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  color: inherit;
}

.error {
  color: crimson;
  border: var(--app-border, var(--border-1)) solid crimson;
  background-color: rgba(220, 20, 60, 0.1);
}

.warning {
  color: goldenrod;
  border: var(--app-border, var(--border-1)) solid goldenrod;
  background-color: rgba(218, 165, 32, 0.1);
}

.success {
  color: seagreen;
  border: var(--app-border, var(--border-1)) solid seagreen;
  background-color: rgba(46, 139, 87, 0.1);
}
</style>
