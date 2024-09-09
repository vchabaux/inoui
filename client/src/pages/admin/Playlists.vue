<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deletePlaylist" />

  <!-- Header -->
  <Container flow="row-between" variant="dash-title">
    <h1>Playlists</h1>
    <Link path="/admin/playlists/new">New playlist</Link>
  </Container>

  <!-- List -->
  <Datable :data="playlists" :columns="columnsPlaylists" selectionKey="_id" layout="2fr 1fr 1fr">
    <template #row-controls="{ item }">
      <Button
        :variant="currentPlaylist === item._id ? 'plain' : 'outline'"
        aria-label="make this playlist the one used in the app"
        title="make this playlist the one used in the app"
        size="s"
        @click="usePlaylist(item)">
        <Icon name="star" />
      </Button>
      <Link aria-label="edit" title="edit" size="s" variant="outline" :path="`/admin/playlists/${item._id}`">
        <Icon name="pen" />
      </Link>
      <Button
        aria-label="delete"
        title="delete"
        size="s"
        variant="outline"
        class="danger-btn"
        :pending="isSubmitting"
        @click="openDialogDelete(item._id)">
        <Icon name="trash-can" />
      </Button>
    </template>
  </Datable>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "@/stores";
import { Container, Button, Link, Icon } from "@owlabio/owl-ui";
import Datable from "@owlabio/da-table";
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
