<template>
  <div class="layout-column">
    <slot />
  </div>
</template>

<style scoped>
.layout-column {
  max-width: 600px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: var(--size-4);
  gap: var(--size-6);
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

/* Inputs full width dans les formulaires */
:deep(input) {
  width: 100%;
  box-sizing: border-box;
}

label {
  font-size: var(--size-3-5);
  color: var(--color-text-fade);
}
</style>
