<template>
  <Dialog :visible="open" modal class="tutorial" @hide="$emit('close')">
    <template #header>
      <h2>{{app === 'cnrs1' ? "Guide d'exploration" : "Exploring the transmedia map"}}</h2>
    </template>

    <Tuto1 v-if="app === 'cnrs1'" :hasDetectiveMode="hasDetectiveMode" />
    <Tuto2 v-else :hasDetectiveMode="hasDetectiveMode" />
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import Dialog from "primevue/dialog";
import { useStore } from "@/stores";
import Tuto1 from "./Tuto1.vue";
import Tuto2 from "./Tuto2.vue";

const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);

const props = defineProps({
  open: Boolean,
  hasDetectiveMode: Boolean,
});
</script>

<style scoped>
:deep(.p-dialog-content) {
  width: min(80ch, 90vw) !important;
}

:deep(.p-dialog-content) {
  display: grid;
  gap: var(--size-6);
}
</style>
