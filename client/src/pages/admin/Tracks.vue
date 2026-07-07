<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteTrack" />

  <!-- Header -->
  <div class="variant-dash-title flow-row-between">
    <h1>Tracks</h1>
    <router-link to="/admin/tracks/new">New track</router-link>
  </div>

  <!-- Filters -->
  <div class="flow-row tracks-filters">
    <label>status</label>
    <Select class="tracks-filter" v-model="filter.status" :options="['all', 'draft', 'pending', 'published']" placeholder="-" />
  </div>

  <!-- List -->
  <DaTable expandable class="fix-table" :data="filtered" layout="1fr 0.5fr 0.5fr 0.5fr" :columns="columnsTracks">
    <template #row-controls="{ item }">
      <router-link :to="`/admin/tracks/${item._id}`" class="link-outline text-sm" aria-label="edit" title="edit" v-if="getPermission(item)">
        <i class="fa-solid fa-pen"></i>
      </router-link>
      <Button v-if="getPermission(item)" class="danger-btn" aria-label="delete" title="delete" outlined size="small" @click="prepareDelete(item._id)">
        <i class="fa-solid fa-trash-can"></i>
      </Button>
    </template>

    <template #details="{ item }">
      <div>
        <h2 class="tracks-details-title">Track information</h2>
        <div>
          <p class="small-text"> Created by: {{ item.attributes.author?.email }} </p>
          <p class="small-text">Created on {{ new Date(item.createdAt).toLocaleDateString() }}</p>
          <p class="small-text">Updated on {{ new Date(item.updatedAt).toLocaleDateString() }}</p>
        </div>

        <h2 class="tracks-details-title">Track points</h2>

        <p v-if="!item.children.length">Nothing for now</p>
        <ul>
          <li v-for="point in item.children">
            <p class="small-text"> {{ point.name }} - "{{ point.attributes?.notice?.title }}"</p>
          </li>
        </ul>
      </div>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
import DaTable from "@/components/DaTable.vue";
import { columnsTracks } from "@/utils/columns";
import { useStore } from "@/stores";
import FormDelete from "@/components/forms/FormDelete.vue";
import Button from "primevue/button";
import Select from "primevue/select";

const trackStore = useStore("track");
const playlistStore = useStore("playlist");
const authStore = useStore("auth");

const tracks = computed(() => trackStore.list);
const playlists = computed(() => playlistStore.list);
const isDeleting = ref(false);
const isSubmitting = ref(false);
const selectedItem = ref(null);

const filter = ref({ status: "all" });
const filtered = computed(() => tracks.value?.filter((n) => filter.value.status === "all" || n.attributes.status === filter.value.status));

const currentUser = computed(() => authStore.currentUser);

function getPermission(item) {
  const isAuthor = item.attributes?.creator === currentUser.value._id;
  const isAdmin = computed(() => currentUser.value.role.includes("admin"));

  return isAuthor || isAdmin;
}

function prepareDelete(item) {
  isDeleting.value = true;
  selectedItem.value = item;
}

function clearThings() {
  selectedItem.value = null;
  isDeleting.value = false;
}

async function deleteTrack() {
  isSubmitting.value = true;

  try {
    const extras = playlists.value.filter((playlist) => playlist.tracks.includes(selectedItem.value));

    await extras.forEach((patient) => {
      patient.tracks = patient.tracks.filter((c) => c !== selectedItem.value);
      playlistStore.updateOne(patient._id, patient);
    });

    await trackStore.deleteOne(selectedItem.value);
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
    clearThings();
  }
}
</script>

<style scoped>
.tracks-filters {
  display: grid;
}

.track-filter {
  flex: 1;
  min-width: 300px;
}

.tracks-details-title {
  font-size: var(--size-4);
  font-weight: bold;
}
</style>
