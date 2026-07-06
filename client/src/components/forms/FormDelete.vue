<template>
  <Dialog v-model:visible="open" modal @hide="emit('cancel')">
    <template #header>
      <div class="variant-dash-title">
        <h2>Are you sure ?</h2>
      </div>
    </template>

    <p class="modal-text">When you delete items, they're gone forever</p>

    <div class="flow-row -end">
      <Button outlined @click="emit('cancel', $event)"> Cancel </Button>
      <Button class="danger-btn" @click="emit('delete', $event)"> Delete </Button>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";

const emit = defineEmits(["cancel", "delete"]);
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.modal-text {
  margin-block: var(--size-8);
}
</style>
