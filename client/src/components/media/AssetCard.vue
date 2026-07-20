<template>
  <div class="flow-row asset-container" :class="{ '-selected': selected }">
    <div class="asset-button" @click="emits('select', file)">
      <img :src="file.url" :alt="file.originalname" class="thumbnail" />
      <div class="media-card-footer">
        <span class="line-clamp-1 text-start">{{ file.originalname }}</span>
      </div>
    </div>

    <div class="flow-column asset-actions">
      <el-button v-if="!picker" aria-label="delete" title="delete" text size="small" class="danger-btn" @click="emits('delete', $event, file)">
        <i class="fa-solid fa-trash-can" />
      </el-button>
      <el-button v-if="!picker" aria-label="preview" title="preview" text size="small" @click="emits('preview', file)">
        <i class="fa-solid fa-eye" />
      </el-button>
      <el-button aria-label="copy url" title="copy url" text size="small" @click="copyFile(file)">
        <i class="fa-solid fa-link" />
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

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
  cursor: pointer;
}

.thumbnail {
  width: 100%;
  height: auto;
  display: block;
}

.asset-actions {
  background-color: var(--color-surface-neutral);
  border-start-end-radius: var(--app-radius, var(--radius-2));
  border-end-end-radius: var(--app-radius, var(--radius-2));
  border: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  gap: 0;
  justify-content: space-between;
}

.media-card-footer {
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  gap: var(--size-2);
}
</style>
