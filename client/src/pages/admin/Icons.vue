<template>
  <h1>Icons manager</h1>
  <p class="small-text text-fade">Available FontAwesome Free icons</p>
  <div class="icon-grid">
    <div v-for="icon in icons" :key="icon.name" class="icon-item" :title="icon.name">
      <i :class="icon.class" />
      <span class="icon-name">{{ icon.name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminPageIcon",
};
</script>

<script setup>
const icons = [
  { name: "music", class: "fa-solid fa-music" },
  { name: "film", class: "fa-solid fa-film" },
  { name: "font", class: "fa-solid fa-font" },
  { name: "location-dot", class: "fa-solid fa-location-dot" },
  { name: "route", class: "fa-solid fa-route" },
  { name: "map", class: "fa-solid fa-map" },
  { name: "compass", class: "fa-solid fa-compass" },
  { name: "star", class: "fa-solid fa-star" },
  { name: "heart", class: "fa-solid fa-heart" },
  { name: "book", class: "fa-solid fa-book" },
  { name: "headphones", class: "fa-solid fa-headphones" },
  { name: "drum", class: "fa-solid fa-drum" },
  { name: "guitar", class: "fa-solid fa-guitar" },
  { name: "microphone", class: "fa-solid fa-microphone" },
  { name: "volume-high", class: "fa-solid fa-volume-high" },
  { name: "eye", class: "fa-solid fa-eye" },
  { name: "eye-slash", class: "fa-solid fa-eye-slash" },
  { name: "pen", class: "fa-solid fa-pen" },
  { name: "plus", class: "fa-solid fa-plus" },
  { name: "xmark", class: "fa-solid fa-xmark" },
  { name: "trash-can", class: "fa-solid fa-trash-can" },
  { name: "filter", class: "fa-solid fa-filter" },
  { name: "question", class: "fa-solid fa-question" },
  { name: "arrow-left", class: "fa-solid fa-arrow-left" },
  { name: "arrow-down", class: "fa-solid fa-arrow-down" },
  { name: "crosshairs", class: "fa-solid fa-crosshairs" },
  { name: "icons", class: "fa-solid fa-icons" },
  { name: "image", class: "fa-regular fa-image" },
  { name: "file-lines", class: "fa-regular fa-file-lines" },
  { name: "circle-play", class: "fa-regular fa-circle-play" },
  { name: "circle-pause", class: "fa-regular fa-circle-pause" },
  { name: "note-sticky", class: "fa-regular fa-note-sticky" },
  { name: "map", class: "fa-regular fa-map" },
  { name: "compass", class: "fa-regular fa-compass" },
];
</script>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--size-3);
  margin-block-start: var(--size-4);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-3);
  border: var(--app-border, 1px) solid var(--color-full-accent);
  border-radius: var(--radius-2);
  background: var(--color-background-neutral);
  font-size: var(--size-6);
}

.icon-name {
  font-size: var(--size-3);
  color: var(--color-text-fade);
  word-break: break-all;
  text-align: center;
}
</style>