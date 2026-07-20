<template>
  <!-- Upload dialog -->
  <el-dialog
    v-if="isUploading"
    :model-value="isUploading"
    @close="isUploading = false"
  >
    <template #header>
      <div class="variant-dash-title">
        <h2>Add files</h2>
      </div>
    </template>

    <div class="upload-forms">
      <FormAssetLocal
        v-if="destination === 'local'"
        @upload="isUploading = false"
      />
      <FormAssetNakala v-else @upload="isUploading = false" />
    </div>
  </el-dialog>

  <div>
    <!-- Header -->
    <div class="flow-row-between variant-dash-title">
      <h1>Medias {{ destination }}</h1>
      <el-button @click="isUploading = true">Add files</el-button>
    </div>

    <p v-if="!assets.length">Your library is empty</p>
    <Library
      v-else
      :data="assets"
      :picker="picker"
      :sortable="route.path === '/admin/medias' || sortable"
      :initialMediaType="props.mediaType"
      @delete="handleDelete"
      @select="handleSelect"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
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

onMounted(() => {
  if (destination.value === "nakala") {
    nakalaStore.initialize();
  }
});

const settings = computed(() => settingsStore.settings);
const destination = computed(() => settings.value.storage.destination);

const nakalaData = computed(() => {
  if (destination.value !== "nakala") return null;
  return nakalaStore.assets;
});

const handleSelect = (value) => {
  emits("select", value);
};

const localData = computed(() => {
  if (destination.value !== "local") return null;
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
