<template>
  <Dialog id="help" open modal class="tutorial">
    <template #header>
      <Text tag="h2">{{app === 'cnrs1' ? "Guide d'exploration" : "Exploring the transmedia map"}}</Text>
    </template>

    <Tuto1 v-if="app === 'cnrs1'" :hasDetectiveMode="hasDetectiveMode" />
    <Tuto2 v-else :hasDetectiveMode="hasDetectiveMode" />
  </Dialog>
</template>

<script setup>
import { computed } from "vue";
import { Dialog, Text } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import Tuto1 from "./Tuto1.vue";
import Tuto2 from "./Tuto2.vue";

const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);

const props = defineProps({
  hasDetectiveMode: Boolean,
});
</script>

<style scoped>
:deep(.owl-dialog-content) {
  width: min(80ch, 90vw) !important;
}

:deep(.owl-dialog-body) {
  display: grid;
  gap: var(--size-6);
}
</style>
