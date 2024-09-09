<template>
  <Container flow="row" class="media-container">
    <Thumbnail size="m" variant="contain" type="image" :src="file.url">
      <template #footer>
        <Text class="small-text" align="center"
          >{{ file.mediaType }} - {{ formatSize(file.size) }}</Text
        >
      </template>
    </Thumbnail>

    <Container>
      <Text>{{ file.originalname }}</Text>

      <Text class="small-text" v-if="!file.tags?.length">No tag yet</Text>
      <Container v-else variant="surface" flow="row">
        <Tag
          v-for="(tag, index) in file.tags"
          :key="index"
          tag="li"
          :label="tag"
          @delete="removeTag(tag)"
        />
      </Container>
    </Container>
  </Container>
</template>

<script setup>
import { Container, Thumbnail, Text } from "@owlabio/owl-ui";
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

.media-details {
  gap: var(--size-1);
}
</style>
