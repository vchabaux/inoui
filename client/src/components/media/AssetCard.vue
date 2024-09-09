<template>
  <Container class="asset-container" flow="row" :class="{ '-selected': selected }">
    <Button :aria-label="file.originalname" :title="file.originalname" variant="text" class="asset-button" @click="emits('select', file)">
      <Thumbnail :size="size" :variant="variant" :type="file.mimetype || file.mime_type" :src="file.url">
        <template #footer>
          <div class="media-card-footer">
            <Text :lines="1" align="start">{{ file.originalname }}</Text>
          </div>
        </template>
      </Thumbnail>
    </Button>

    <Container class="asset-actions" flow="column">
      <Button v-if="!picker" aria-label="delete" title="delete" variant="text" icon size="s" class="danger-btn" @click="emits('delete', $event, file)">
        <Icon name="trash-can" />
      </Button>
      <Button v-if="!picker" aria-label="preview" title="preview" variant="text" icon size="s" @click="emits('preview', file)">
        <Icon name="eye" />
      </Button>
      <Button aria-label="copy url" title="copy url" variant="text" icon size="s" :pending="isCopying" @click="copyFile(file)">
        <Icon name="link" />
      </Button>
    </Container>
  </Container>
</template>

<script setup>
import { ref } from "vue";
import { Container, Thumbnail, Button, Icon, Text } from "@owlabio/owl-ui";

const emits = defineEmits(["preview", "delete", "copy", "select"]);

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    validator: (value) => ["cover", "contain"].includes(value),
    default: "cover",
  },
  size: {
    type: String,
    validator: (value) => ["s", "m", "l"].includes(value),
    default: "m",
  },
  selected: {
    type: Boolean,
    default: false,
  },
  picker: {
    type: Boolean,
    default: false,
  },
});

const isCopying = ref(false);

function copyFile(file) {
  isCopying.value = true;
  emits("copy", file);

  setTimeout(() => {
    isCopying.value = false;
  }, 300);
}

function formatSize(size) {
  const units = ["B", "KB", "MB"];
  let i = 0;
  while (size >= 1000) {
    size /= 1000;
    ++i;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}
</script>

<style scoped>
.asset-container {
  gap: 0;
  align-items: stretch;
  overflow: hidden;
  border-radius: var(--app-radius, var(--radius-2));
}

.-selected {
  outline: var(--border-2) solid var(--color-full-accent) !important;
  outline-offset: var(--border-2);
}

.asset-button {
  padding: 0;
  border: 0;
}

:deep(.owl-thumbnail) {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  border-inline-end: 0;
}

:deep(.owl-button) {
  border-radius: 0;
}

.asset-actions {
  background-color: var(--color-surface-neutral);
  border-start-end-radius: var(--app-radius, var(--radius-2));
  border-end-end-radius: var(--app-radius, var(--radius-2));
  border: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  gap: 0;
  justify-content: space-between;
}

.asset-actions :deep(.owl-button) {
  padding: var(--size-1);
}

.media-card-footer {
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  gap: var(--size-2);
}
</style>
