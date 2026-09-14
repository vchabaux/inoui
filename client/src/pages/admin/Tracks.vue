<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteTrack" />

  <!-- Header -->
  <div class="variant-dash-title flow-row-between">
    <h1>Tracks</h1>
    <router-link to="/admin/tracks/new" class="link-plain">New track</router-link>
  </div>

  <!-- Filters -->
  <div class="flow-row tracks-filters">
    <label>status</label>
    <el-select class="tracks-filter" v-model="filter.status" placeholder="-">
      <el-option value="all" label="all" />
      <el-option value="draft" label="draft" />
      <el-option value="pending" label="pending" />
      <el-option value="published" label="published" />
    </el-select>
  </div>

  <!-- List -->
  <el-table :data="filtered" class="fix-table" stripe style="width: 100%">
    <el-table-column type="expand">
      <template #default="{ row }">
        <div>
          <h2 class="tracks-details-title">Track information</h2>
          <div>
            <p class="small-text"> Created by: {{ row.attributes.author?.email }} </p>
            <p class="small-text">Created on {{ new Date(row.createdAt).toLocaleDateString() }}</p>
            <p class="small-text">Updated on {{ new Date(row.updatedAt).toLocaleDateString() }}</p>
          </div>

          <h2 class="tracks-details-title">Track points</h2>

          <p v-if="!row.children.length">Nothing for now</p>
          <ul>
            <li v-for="point in row.children" :key="point._id">
              <p class="small-text"> {{ point.name }} - "{{ point.attributes?.notice?.title }}"</p>
            </li>
          </ul>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="name" label="Name" sortable />
    <el-table-column label="Author" sortable>
      <template #default="{ row }">
        {{ row.attributes.author?.email }}
      </template>
    </el-table-column>
    <el-table-column label="Created" sortable width="140">
      <template #default="{ row }">
        {{ formatDateShort(row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column label="Last updated" sortable width="140">
      <template #default="{ row }">
        {{ formatDateShort(row.updatedAt) }}
      </template>
    </el-table-column>

    <el-table-column label="" width="190" class-name="row-controls-cell">
      <template #default="{ row }">
        <router-link
          v-if="getPermission(row)"
          :to="`/admin/tracks/${row._id}`"
          class="link-outline text-sm"
          aria-label="edit"
          title="edit"
        >
          <i class="fa-solid fa-pen"></i>
        </router-link>
        <el-button
          v-if="getPermission(row)"
          size="small"
          type="danger"
          plain
          aria-label="delete"
          title="delete"
          @click="prepareDelete(row._id)"
        >
          <i class="fa-solid fa-trash-can"></i>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, computed } from "vue";
import { formatDateShort } from "@/utils/time";
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
  gap: var(--size-2);
}

.tracks-filter {
  flex: 1;
  min-width: 300px;
}

.tracks-details-title {
  font-size: var(--size-4);
  font-weight: bold;
}
</style>
