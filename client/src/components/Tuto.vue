<template>
  <el-dialog :model-value="open" @close="$emit('close')" class="tutorial" :title="app === 'cnrs1' ? &quot;Guide d'exploration&quot; : 'Exploring the transmedia map'" width="min(80ch, 90vw)">
    <Tuto1 v-if="app === 'cnrs1'" :hasDetectiveMode="hasDetectiveMode" />
    <Tuto2 v-else :hasDetectiveMode="hasDetectiveMode" />
  </el-dialog>
</template>

<script setup>
import { computed } from "vue";
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
