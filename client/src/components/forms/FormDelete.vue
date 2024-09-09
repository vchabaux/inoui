<template>
  <Dialog modal id="delete-modal" :open="open" @close="emit('cancel')">
    <Container variant="dash-title">
      <Text tag="h2">Are you sure ?</Text>
    </Container>

    <Text class="modal-text">When you delete items, they're gone forever</Text>

    <Container flow="row" class="-end">
      <Button variant="outline" @click="emit('cancel', $event)"> Cancel </Button>
      <Button class="danger-btn" @click="emit('delete', $event)"> Delete </Button>
    </Container>
  </Dialog>
</template>

<script setup>
import { Dialog, Container, Text, Button } from "@owlabio/owl-ui";

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
