<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="isDeleting = false" @delete="deleteUser" />

  <div class="variant-dash-title flow-row-between">
    <h1>Users</h1>
    <router-link to="/admin/users/new">New user</router-link>
  </div>

  <DaTable class="fix-table" :data="users" :columns="columnsUsers" layout="2fr 1fr 1fr 1fr">
    <template #row-controls="{ item }">
      <router-link :to="`/admin/users/${item._id}`" class="link-outline text-sm" aria-label="edit" title="edit">
        <i class="fa-solid fa-pen"></i>
      </router-link>
      <Button class="danger-btn" aria-label="delete" title="delete" outlined size="small" @click="prepareDelete(item._id)">
        <i class="fa-solid fa-trash-can"></i>
      </Button>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
import DaTable from "@owlabio/da-table";
import { columnsUsers } from "@/utils/columns";
import { useStore } from "@/stores";
import FormDelete from "@/components/forms/FormDelete.vue";
import Button from "primevue/button";

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
