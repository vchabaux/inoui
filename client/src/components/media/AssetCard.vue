<template>
  <div class="flow-row asset-container" :class="{ '-selected': selected }">
    <div class="asset-button" @click="emits('select', file)">
      <div class="media-thumbnail">
        <img v-if="mediaKind(file) === 'image'" :src="file.url" :alt="file.originalname" class="thumbnail" />
        <div v-else-if="mediaKind(file) === 'audio'" class="media-thumbnail placeholder">
          <i class="fa-solid fa-music"></i>
        </div>
        <div v-else-if="mediaKind(file) === 'video'" class="media-thumbnail placeholder">
          <i class="fa-solid fa-video"></i>
        </div>
        <div v-else class="media-thumbnail placeholder">
          <i class="fa-solid fa-file"></i>
        </div>
      </div>
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

function mediaKind(file) {
  const mime = file.mimetype || file.mime_type || "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "file";
}
</script>

<style scoped>
.asset-container {
  position: relative;
  gap: 0;
  align-items: stretch;
  width: 100%;
  border: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  border-radius: 0.5rem;
  overflow: hidden;
}

.-selected {
  outline: var(--border-2) solid var(--color-full-accent) !important;
  outline-offset: var(--border-2);
}

.asset-button {
  width: 100%;
  display: block;
  padding: 0;
  border: 0;
  cursor: pointer;
}

.media-thumbnail {
  width: 100%;
  min-height: 177px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-thumbnail.placeholder {
  width: 100%;
  min-height: 177px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-neutral);
  color: var(--color-muted);
  font-size: 2rem;
}

.asset-actions {
  position: absolute;
  top: var(--size-2);
  inset-inline-end: var(--size-2);
  display: flex;
  flex-direction: row;
  gap: var(--size-1);
  z-index: 2;
  background-color: var(--color-surface-neutral);
  border-radius: var(--app-radius, var(--radius-2));
  padding: var(--size-1);
}

.media-card-footer {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-between;
  gap: var(--size-2);
  padding: var(--size-2);
}
</style>
