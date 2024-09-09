<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteTrack" />

  <!-- Header -->
  <Container flow="row-between" variant="dash-title">
    <h1>Tracks</h1>
    <Link path="/admin/tracks/new">New track</Link>
  </Container>

  <!-- Filters -->
  <Container flow="row" class="tracks-filters">
    <Field class="tracks-filter" label="status" type="select" v-model="filter.status" placeholder="-" :options="['all', 'draft', 'pending', 'published']" />
  </Container>

  <!-- List -->
  <DaTable expandable class="fix-table" :data="filtered" layout="1fr 0.5fr 0.5fr 0.5fr" :columns="columnsTracks">
    <template #row-controls="{ item }">
      <Link aria-label="edit" title="edit" v-if="getPermission(item)" variant="outline" size="s" :path="`/admin/tracks/${item._id}`">
        <Icon name="pen" />
      </Link>
      <Button v-if="getPermission(item)" class="danger-btn" aria-label="delete" title="delete" variant="outline" size="s" @click="prepareDelete(item._id)">
        <Icon name="trash-can" />
      </Button>
    </template>

    <template #details="{ item }">
      <Container>
        <Text tag="h2" class="tracks-details-title">Track information</Text>
        <div>
          <Text class="small-text"> Created by: {{ item.attributes.author?.email }} </Text>
          <Text class="small-text">Created on {{ new Date(item.createdAt).toLocaleDateString() }}</Text>
          <Text class="small-text">Updated on {{ new Date(item.updatedAt).toLocaleDateString() }}</Text>
        </div>

        <Text tag="h2" class="tracks-details-title">Track points</Text>

        <Text v-if="!item.children.length">Nothing for now</Text>
        <ul>
          <li v-for="point in item.children">
            <Text class="small-text"> {{ point.name }} - "{{ point.attributes?.notice?.title }}"</Text>
          </li>
        </ul>
      </Container>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
import { Link, Container, Button, Text, Icon, Field } from "@owlabio/owl-ui";
import DaTable from "@owlabio/da-table";
import { columnsTracks } from "@/utils/columns";
import { useStore } from "@/stores";
import FormDelete from "@/components/forms/FormDelete.vue";

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
