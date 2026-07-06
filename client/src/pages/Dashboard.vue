<template>
  <router-view />
  <template v-if="route.path === '/admin'">
    <div class="flow-row-between variant-dash-title">
      <h1>Dashboard</h1>
    </div>

    <p>
      The app is in beta: if you encounter a bug, please report to the dev team
    </p>

    <div class="flow-row variant-surface">
      <div v-if="playlists && app === 'cnrs2'" class="card">
        <span class="count">{{ playlists.length }}</span>
        <p>playlists</p>
      </div>
      <div v-if="musicians && app === 'cnrs1'" class="card">
        <span class="count">{{ musicians.length }}</span>
        <p>artists</p>
      </div>
      <div v-if="tracks" class="card">
        <span class="count">{{ tracks.length }}</span>
        <p>tracks</p>
      </div>
      <div v-if="notices" class="card">
        <span class="count">{{ notices.length }}</span>
        <p>notices</p>
      </div>
      <div v-if="users" class="card">
        <span class="count">{{ users.length }}</span>
        <p>users</p>
      </div>
      <div v-if="medias" class="card">
        <span class="count">{{ medias.length }}</span>
        <p>assets</p>
      </div>
    </div>
  </template>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";
import { useRoute } from "vue-router";

const route = useRoute();
const mediaStore = useStore("media");
const trackStore = useStore("track");
const noticeStore = useStore("notice");
const userStore = useStore("user");
const playlistStore = useStore("playlist");
const musicianStore = useStore("musician");
const settingsStore = useStore("settings");

const tracks = computed(() => trackStore.list);
const notices = computed(() => noticeStore.list);
const users = computed(() => userStore.list);
const medias = computed(() => mediaStore.list);
const playlists = computed(() => playlistStore.list);
const musicians = computed(() => musicianStore.list);
const app = computed(() => settingsStore.project);

mediaStore.initialize();
</script>

<style scoped>
p {
  max-width: 65ch;
}

.card {
  width: 150px;
  display: grid;
  justify-items: center;
  text-align: center;
  border-radius: var(--app-radius, var(--radius-2));
  background-color: var(--color-background-neutral);
  padding: var(--size-4);
  box-shadow: var(--box-shadow-2);
}

.count {
  font-size: var(--size-12);
}
</style>
