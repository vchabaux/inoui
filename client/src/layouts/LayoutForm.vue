<template>
  <LayoutColumn width="small" floating>
    <slot />
  </LayoutColumn>
</template>

<script setup>
import { LayoutColumn } from "@owlabio/owl-ui";
</script>

<style scoped>
:deep(.page-content) {
  justify-items: stretch;
}
</style>
