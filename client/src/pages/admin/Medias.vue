<template>
  <!-- Upload dialog -->
  <Dialog
    v-if="isUploading"
    id="uploadMedia"
    modal
    :open="isUploading"
    @close="isUploading = false"
  >
    <Container variant="dash-title">
      <Text tag="h2">Add files</Text>
    </Container>

    <Container class="upload-forms">
      <FormAssetLocal
        v-if="destination === 'local'"
        @upload="isUploading = false"
      />
      <FormAssetNakala v-else @upload="isUploading = false" />
    </Container>
  </Dialog>

  <Container>
    <!-- Header -->
    <Container flow="row-between" variant="dash-title">
      <h1>Medias {{ destination }}</h1>
      <Button @click="isUploading = true">Add files</Button>
    </Container>

    <Text v-if="!assets.length">Your library is empty</Text>
    <Library
      v-else
      :data="assets"
      :picker="picker"
      :sortable="route.path === '/admin/medias' || sortable"
      :initialMediaType="props.mediaType"
      @delete="handleDelete"
      @select="handleSelect"
    />
  </Container>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Dialog, Container, Button, Text } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import FormAssetLocal from "@/components/forms/FormAssetLocal.vue";
import FormAssetNakala from "@/components/forms/FormAssetNakala.vue";
import Library from "@/components/media/Library.vue";

const nakalaStore = useStore("nakala");
const mediaStore = useStore("media");
const settingsStore = useStore("settings");
const route = useRoute();

const emits = defineEmits(["select"]);

const props = defineProps({
  mediaType: {
    type: String,
    default: "all",
  },
  sortable: {
    type: Boolean,
    default: false,
  },
  picker: {
    type: Boolean,
    default: false,
  },
});

const isUploading = ref(false);

const settings = computed(() => settingsStore.settings);
const destination = computed(() => settings.value.storage.destination);

const nakalaData = computed(() => {
  if (!destination.value === "nakala") return null;
  return nakalaStore.assets;
});

const handleSelect = (value) => {
  emits("select", value);
};

const localData = computed(() => {
  if (!destination.value === "local") return null;
  return mediaStore.list;
});

const assets = computed(() => {
  return destination.value === "nakala" ? nakalaData.value : localData.value;
});

const handleDelete = async (idOrIds) => {
  if (destination.value === "local") {
    await deleteLocally(idOrIds);
  } else {
    await deleteFromNakala(idOrIds);
  }
};

async function deleteLocally(idOrIds) {
  if (Array.isArray(idOrIds)) {
    await Promise.all(idOrIds.map((id) => mediaStore.deleteOne(id)));
  } else {
    await mediaStore.deleteOne(idOrIds);
  }
}

async function deleteFromNakala(idOrIds) {
  try {
    if (Array.isArray(idOrIds)) {
      await Promise.all(idOrIds.map((id) => nakalaStore.deleteOne(id)));
    } else {
      await nakalaStore.deleteOne(idOrIds);
    }
  } catch (err) {
    console.error(err);
  } finally {
  }
}
</script>
