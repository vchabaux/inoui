<template>
  <el-dialog :model-value="open" @close="emit('cancel')">
    <template #header>
      <div class="variant-dash-title">
        <h2>Are you sure ?</h2>
      </div>
    </template>

    <p class="modal-text">When you delete items, they're gone forever</p>

    <div class="flow-row -end">
      <el-button plain @click="emit('cancel')"> Cancel </el-button>
      <el-button class="danger-btn" @click="emit('delete')"> Delete </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
const emit = defineEmits(["cancel", "delete"]);

defineProps({
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
