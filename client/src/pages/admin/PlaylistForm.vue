<template>
  <Container flow="row-between" variant="dash-title">
    <h1>{{ isUpdate ? currentPlaylist?.name : "New playlist" }}</h1>
  </Container>

  <Container tag="form" width="s" stretched centered>
    <h2>Playlist information</h2>
    <Field type="text" name="name" label="Name" v-model="playlist.name" required />

    <h2>Playlist tracks</h2>
    <Container variant="surface" stretched>
      <Text v-if="!tracksSelected.length">No track selected yet</Text>
      <Each v-else :data="tracksSelected" v-slot="{ $value }" :is-recursive="false">
        <Container class="row-selected">
          <Text :lines="1">{{ $value.name }}</Text>
          <Button aria-label="move up" title="move up" variant="text" size="s" :class="{ hidden: checkSwap('first', $value._id) }" @click="swapTrackUp($value._id)">
            <Icon name="chevron-up" />
          </Button>
          <Button aria-label="move down" title="move down" variant="text" size="s" :class="{ hidden: checkSwap('down', $value._id) }" @click="swapTrackDown($value._id)">
            <Icon name="chevron-down" />
          </Button>
          <Button aria-label="remove from playlist" title="remove from playlist" variant="outline" size="s" @click="removeTrack($value._id)">
            <Icon name="xmark" />
          </Button>
        </Container>
      </Each>
    </Container>

    <h2>Available tracks</h2>
    <Container variant="surface" stretched>
      <Text v-if="!tracksAvailable.length">Every published track is already in the playlist</Text>
      <Each :data="tracksAvailable" v-slot="{ $value }" :is-recursive="false">
        <Container class="row-available">
          <Text :lines="1">{{ $value.name }}</Text>
          <Button aria-label="add to playlist" title="add to playlist" size="s" @click="addTrack($value._id)">
            <Icon name="plus" />
          </Button>
        </Container>
      </Each>
    </Container>
  </Container>

  <Container width="s" centered>
    <Button wide @click="savePlaylist" :pending="isSubmitting"> Save changes </Button>
  </Container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores";
import { Container, Field, Button, Icon, Text } from "@owlabio/owl-ui";
import { Each } from "@owlabio/each-vue";

const playlistStore = useStore("playlist");
const trackStore = useStore("track");
const router = useRouter();
const route = useRoute();

const isUpdate = computed(() => !!route.params.id);
const isSubmitting = ref(false);

const currentPlaylist = computed(() => playlistStore.findOne(route.params.id));
const playlist = ref({
  name: currentPlaylist.value?.name || "",
  tracks: currentPlaylist.value?.tracks || [],
});

const tracks = computed(() => trackStore.list);
const tracksAvailable = computed(() => tracks.value.filter((track) => !playlist.value?.tracks.includes(track._id) && track.attributes?.status === "published"));
const tracksSelected = computed(() => playlist.value.tracks.map((id) => tracks.value.find((track) => track._id === id)));

function addTrack(id) {
  playlist.value.tracks.push(id);
}

function removeTrack(id) {
  playlist.value.tracks = playlist.value.tracks.filter((el) => el !== id);
}

function checkSwap(position, id) {
  const index = playlist.value.tracks.indexOf(id);
  return position === "first" ? index === 0 : index === playlist.value.tracks.length - 1;
}

function swapTrackDown(id) {
  const index = playlist.value.tracks.indexOf(id);
  const temp = playlist.value.tracks[index];
  playlist.value.tracks[index] = playlist.value.tracks[index + 1];
  playlist.value.tracks[index + 1] = temp;
}

function swapTrackUp(id) {
  const index = playlist.value.tracks.indexOf(id);
  const temp = playlist.value.tracks[index];
  playlist.value.tracks[index] = playlist.value.tracks[index - 1];
  playlist.value.tracks[index - 1] = temp;
}

async function savePlaylist() {
  playlist.value.name === "" && (playlist.value.name = "Untitled");

  try {
    isSubmitting.value = true;
    if (isUpdate.value) {
      await playlistStore.updateOne(route.params.id, playlist.value);
    } else {
      await playlistStore.create(playlist.value);
    }
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
    router.push("/admin/playlists");
  }
}
</script>

<style scoped>
.each {
  display: grid;
  gap: var(--size-2);
}

.row-available,
.row-selected {
  display: grid;
  align-items: center;
}

.row-available {
  grid-template-columns: 1fr auto;
}

.row-selected {
  grid-template-columns: 1fr auto auto auto;
}

.hidden {
  visibility: hidden;
}
</style>
