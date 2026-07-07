<template>
  <Dialog :open="open" modal @hide="$emit('close')" header="Pick an icon" :style="{ width: '600px' }">
    <div class="icon-picker-grid">
      <button
        v-for="icon in icons"
        :key="icon.name"
        class="icon-picker-item"
        :class="{ '-selected': selected === icon.name }"
        @click="selectIcon(icon)"
        :title="icon.name"
      >
        <i :class="icon.class" />
      </button>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from "vue";
import Dialog from "primevue/dialog";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "select"]);

const icons = [
  // Solid icons
  { name: "music", class: "fa-solid fa-music" },
  { name: "film", class: "fa-solid fa-film" },
  { name: "image", class: "fa-regular fa-image" },
  { name: "font", class: "fa-solid fa-font" },
  { name: "location-dot", class: "fa-solid fa-location-dot" },
  { name: "route", class: "fa-solid fa-route" },
  { name: "map", class: "fa-solid fa-map" },
  { name: "compass", class: "fa-solid fa-compass" },
  { name: "star", class: "fa-solid fa-star" },
  { name: "heart", class: "fa-solid fa-heart" },
  { name: "book", class: "fa-solid fa-book" },
  { name: "music", class: "fa-solid fa-music" },
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
  { name: "arrow-right-from-bracket", class: "fa-solid fa-arrow-right-from-bracket" },
  { name: "arrow-up-right-from-square", class: "fa-solid fa-arrow-up-right-from-square" },
  { name: "backward", class: "fa-solid fa-backward" },
  { name: "forward", class: "fa-solid fa-forward" },
  { name: "crosshairs", class: "fa-solid fa-crosshairs" },
  { name: "drum", class: "fa-solid fa-drum" },
  { name: "guitar", class: "fa-solid fa-guitar" },
  { name: "microphone", class: "fa-solid fa-microphone" },
  { name: "volume-high", class: "fa-solid fa-volume-high" },
  { name: "volume-xmark", class: "fa-solid fa-volume-xmark" },
  { name: "headphones", class: "fa-solid fa-headphones" },
  { name: "volume-off", class: "fa-solid fa-volume-off" },
  { name: "pen", class: "fa-solid fa-pen" },
  { name: "trash-can", class: "fa-solid fa-trash-can" },
  { name: "plus", class: "fa-solid fa-plus" },
  { name: "xmark", class: "fa-solid fa-xmark" },
  { name: "sort-down", class: "fa-solid fa-sort-down" },
  { name: "sort-up", class: "fa-solid fa-sort-up" },
  { name: "arrow-right-from-bracket", class: "fa-solid fa-arrow-right-from-bracket" },
  { name: "arrow-up-right-from-square", class: "fa-solid fa-arrow-up-right-from-square" },
  { name: "crosshairs", class: "fa-solid fa-crosshairs" },
  { name: "filter", class: "fa-solid fa-filter" },
  { name: "star", class: "fa-solid fa-star" },
  { name: "icons", class: "fa-solid fa-icons" },
  // Regular icons
  { name: "image", class: "fa-regular fa-image" },
  { name: "file-lines", class: "fa-regular fa-file-lines" },
  { name: "circle-play", class: "fa-regular fa-circle-play" },
  { name: "circle-pause", class: "fa-regular fa-circle-pause" },
  { name: "note-sticky", class: "fa-regular fa-note-sticky" },
  { name: "map", class: "fa-regular fa-map" },
  { name: "compass", class: "fa-regular fa-compass" },
];

const selected = ref(null);

function selectIcon(icon) {
  selected.value = icon.name;
  emit("select", { type: icon.class.startsWith("fa-regular") ? "regular" : "solid", name: icon.name });
}
</script>

<style scoped>
.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: var(--size-2);
  max-height: 400px;
  overflow-y: auto;
}

.icon-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: var(--app-border, 1px) solid var(--color-full-accent);
  border-radius: var(--radius-2);
  background: var(--color-background-neutral);
  cursor: pointer;
  font-size: var(--size-5);
  transition: all 0.15s ease;
}

.icon-picker-item:hover {
  background: var(--color-element-neutral);
  border-color: var(--color-text-neutral);
}

.icon-picker-item.-selected {
  background: var(--color-element-neutral);
  border-color: var(--color-full-accent);
  border-width: 2px;
	}
</style>