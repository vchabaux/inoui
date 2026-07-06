<template>
  <div class="layout-column">
    <slot />
  </div>
</template>

<style scoped>
.layout-column {
  max-width: 600px;
  margin-inline: auto;
}

:deep(.page-content) {
  justify-items: stretch;
}
</style>
