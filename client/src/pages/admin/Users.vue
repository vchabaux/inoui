<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="isDeleting = false" @delete="deleteUser" />

  <Container flow="row-between" variant="dash-title">
    <h1>Users</h1>
    <Link path="/admin/users/new">New user</Link>
  </Container>

  <DaTable class="fix-table" :data="users" :columns="columnsUsers" layout="2fr 1fr 1fr 1fr">
    <template #row-controls="{ item }">
      <Link aria-label="edit" title="edit" variant="outline" size="s" :path="`/admin/users/${item._id}`">
        <Icon name="pen" />
      </Link>
      <Button class="danger-btn" aria-label="delete" title="delete" variant="outline" size="s" @click="prepareDelete(item._id)">
        <Icon name="trash-can" />
      </Button>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
import { Link, Container, Button, Icon } from "@owlabio/owl-ui";
import DaTable from "@owlabio/da-table";
import { columnsUsers } from "@/utils/columns";
import { useStore } from "@/stores";
import FormDelete from "@/components/forms/FormDelete.vue";

const userStore = useStore("user");
const users = computed(() => userStore.list);

const isDeleting = ref(false);
const selectedItem = ref(null);

function prepareDelete(item) {
  isDeleting.value = true;
  selectedItem.value = item;
}

async function deleteUser() {
  await userStore.delete(selectedItem.value);
  isDeleting.value = false;
  selectedItem.value = null;
}
</script>

<style scoped></style>
