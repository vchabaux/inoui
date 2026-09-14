<template>
  <div class="form-shell">
    <div class="form-page -floating">
      <slot />
    </div>
  </div>
</template>

<style>
/* Reproduction du LayoutColumn owl-ui : shell accent + carte flottante
   de largeur "small" (min(50ch,100%)) centrée, comme l'ancienne app. */
.form-shell {
  min-height: 100vh;
  width: 100%;
  display: grid;
  justify-items: center;
  align-content: center;
  background-color: var(--color-surface-accent);
}

.form-page {
  width: min(50ch, 100%);
  margin: var(--size-8);
  background-color: var(--color-background-neutral);
  border: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  border-radius: var(--app-radius, var(--radius-2));
  box-shadow: var(--box-shadow-5);
  padding: var(--size-6) var(--size-8);
  display: grid;
  gap: var(--size-8);
  align-content: flex-start;
  justify-items: stretch;
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

label {
  font-size: var(--size-3-5);
  color: var(--color-text-fade);
}
</style>
