<template>
  <component v-if="layout" :is="layout">
    <slot />
  </component>
</template>

<script setup>
import { shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import LayoutDashboard from "@/layouts/LayoutDashboard.vue";

const layout = shallowRef(null);
const route = useRoute();

watch(
  () => route.meta,
  async (meta) => {
    if (!route.meta.layout) return;
    try {
      const component = await import(`../layouts/${meta.layout}.vue`);
      layout.value = component?.default || LayoutDashboard;
    } catch (e) {}
  },
  { immediate: true }
);
</script>
