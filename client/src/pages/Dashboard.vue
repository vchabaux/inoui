<template>
  <router-view />
  <template v-if="route.path === '/admin'">
    <Container flow="row-between" variant="dash-title">
      <h1>Dashboard</h1>
    </Container>

    <Text>
      The app is in beta: if you encounter a bug, please report to the dev team
    </Text>

    <Container flow="row" variant="surface">
      <Container v-if="playlists && app === 'cnrs2'" class="card">
        <Text class="count">{{ playlists.length }}</Text>
        <Text>playlists</Text>
      </Container>
      <Container v-if="musicians && app === 'cnrs1'" class="card">
        <Text class="count">{{ musicians.length }}</Text>
        <Text>artists</Text>
      </Container>
      <Container v-if="tracks" class="card">
        <Text class="count">{{ tracks.length }}</Text>
        <Text>tracks</Text>
      </Container>
      <Container v-if="notices" class="card">
        <Text class="count">{{ notices.length }}</Text>
        <Text>notices</Text>
      </Container>
      <Container v-if="users" class="card">
        <Text class="count">{{ users.length }}</Text>
        <Text>users</Text>
      </Container>
      <Container v-if="medias" class="card">
        <Text class="count">{{ medias.length }}</Text>
        <Text>assets</Text>
      </Container>
    </Container>
  </template>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";
import { useRoute } from "vue-router";
import { Container, Text } from "@owlabio/owl-ui";

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
