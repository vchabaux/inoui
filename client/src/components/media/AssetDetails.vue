<template>
  <div class="flow-row media-container">
    <img :src="file.url" alt="file thumbnail" class="thumbnail" />

    <div>
      <p>{{ file.originalname }}</p>

      <span class="small-text" v-if="!file.tags?.length">No tag yet</span>
      <div v-else class="variant-surface flow-row">
        <Tag
          v-for="(tag, index) in file.tags"
          :key="index"
          tag="li"
          :label="tag"
          @delete="removeTag(tag)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Tag from "@/components/Tag.vue";

const props = defineProps({
  file: {
    type: Object,
    required: true,
  },
});

function formatSize(size) {
  const units = ["B", "KB", "MB"];
  let i = 0;
  while (size >= 1000) {
    size /= 1000;
    ++i;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

const removeTag = (tagName) => {
  props.file.tags = props.file.tags.filter((tag) => tag !== tagName);
};
</script>

<style scoped>
.media-container {
  align-items: flex-start;
}

.thumbnail {
  width: 200px;
  height: auto;
}

.media-details {
  gap: var(--size-1);
}
</style>
