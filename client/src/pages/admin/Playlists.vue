<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deletePlaylist" />

  <!-- Header -->
  <div class="flow-row-between variant-dash-title">
    <h1>Playlists</h1>
    <router-link to="/admin/playlists/new" class="link-text">New playlist</router-link>
  </div>

  <!-- List -->
  <Datable :data="playlists" :columns="columnsPlaylists" selectionKey="_id" layout="2fr 1fr 1fr">
    <template #row-controls="{ item }">
      <Button
        :variant="currentPlaylist === item._id ? 'plain' : 'outline'"
        aria-label="make this playlist the one used in the app"
        title="make this playlist the one used in the app"
        size="small"
        @click="usePlaylist(item)">
        <i class="fa-solid fa-star" />
      </Button>
      <router-link aria-label="edit" title="edit" class="link-outline text-sm" :to="`/admin/playlists/${item._id}`">
        <i class="fa-solid fa-pen" />
      </router-link>
      <Button
        aria-label="delete"
        title="delete"
        size="small"
        outlined
        class="danger-btn"
        :loading="isSubmitting"
        @click="openDialogDelete(item._id)">
        <i class="fa-solid fa-trash-can" />
      </Button>
    </template>
  </Datable>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "@/stores";
import Button from "primevue/button";
import Datable from "@/components/DaTable.vue";
import {columnsPlaylists} from "@/utils/columns";
import FormDelete from "@/components/forms/FormDelete.vue";

const playlistStore = useStore("playlist");
const settingsStore = useStore("settings");
const playlists = computed(() => playlistStore.list);
const settings = computed(() => settingsStore.settings);
const selectedPlaylist = ref(null);

const isDeleting = ref(false);
const isSubmitting = ref(false);
const currentPlaylist = computed(() => settings.value.playlist);

function openDialogDelete(playlistId) {
  selectedPlaylist.value = playlistId;
  isDeleting.value = true;
}

function clearThings() {
  selectedPlaylist.value = null;
  isDeleting.value = false;
}

async function usePlaylist(playlist) {
  await await settingsStore.update({ playlist: playlist._id });
}

async function deletePlaylist() {
  isSubmitting.value = true;

  try {
    await playlistStore.deleteOne(selectedPlaylist.value);
  } catch (err) {
    console.err(err);
  } finally {
    isSubmitting.value = false;
    clearThings();
  }
}
</script>
