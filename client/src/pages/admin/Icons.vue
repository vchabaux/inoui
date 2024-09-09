<template>
  <h1>Icons manager</h1>
  <IconManager :is-rogue="isSuperAdmin" />
</template>

<script>
export default {
  name: "AdminPageIcon",
};
</script>

<script setup>
import { computed } from "vue";
import { IconManager } from "@owlabio/icon-manager/client";

import { useStore } from "@/stores";
const authStore = useStore("auth");

const isSuperAdmin = computed(() => authStore.isSuperAdmin);
</script>
