<template>
  <!-- Delete dialog -->
  <FormDelete
    :open="isDeleting"
    @cancel="isDeleting = false"
    @delete="deleteItem"
  />

  <!-- Edit dialog -->
  <Dialog
    v-if="isEditForm"
    id="edit-medias"
    modal
    :open="isEditForm"
    @close="isEditForm = false"
  >
    <Container variant="dash-title">
      <Text tag="h2">Edit files</Text>
    </Container>

    <Container class="edit-form">
      <FormAssetNakala v-if="isNakala" :assets="selectedItems" />
      <FormAssetLocal v-else :assets="selectedItems" />
    </Container>
  </Dialog>

  <!-- Library container -->
  <Container class="library">
    <!-- Header -->
    <Container flow="row" class="library-header">
      <Field type="text" label="Tag" v-model="search" />
      <Field
        v-if="sortable"
        label="Type"
        type="select"
        :options="types"
        :formatter="(v) => v.name"
        v-model="fileType"
      />

      <Container flow="row" v-if="selectedItems.length">
        <Button
          aria-label="download selection"
          title="download selection"
          variant="outline"
          @click="downloadSelection"
        >
          <Icon name="download" />
        </Button>
        <Button
          aria-label="edit selection"
          title="edit selection"
          variant="outline"
          @click="openEditForm"
        >
          <Icon name="pen" />
        </Button>
        <Button
          aria-label="delete selection"
          title="delete selection"
          v-if="canDelete"
          class="danger-btn"
          variant="outline"
          @click="isDeleting = true"
        >
          <Icon name="trash-can" />
        </Button>
      </Container>
    </Container>

    <!-- List -->
    <Container flow="row" class="library-list">
      <AssetCard
        v-for="asset in currentAssets"
        variant="contain"
        size="m"
        :picker="picker"
        :file="asset"
        :selected="selectedItems.includes(asset._id)"
        @delete="prepareDelete(asset._id)"
        @preview="previewItem"
        @copy="copyLink"
        @select="selectItem"
      />
    </Container>

    <!-- Preview -->
    <Container
      tag="aside"
      aria-label="preview panel"
      v-if="previewedItem"
      variant="surface"
      class="library-preview"
      stretched
    >
      <Container class="preview-title" flow="row" variant="dash-title">
        <Button
          aria-label="close"
          title="close"
          variant="text"
          @click="previewedItem = null"
          icon
          size="s"
        >
          <Icon name="xmark" />
        </Button>
        <Text :lines="1" tag="h2">{{ previewedItem.originalname }} </Text>
      </Container>

      <FormAssetNakala v-if="isNakala" :assets="[previewedItem._id]" />
      <FormAssetLocal v-else :assets="[previewedItem._id]" />
    </Container>
  </Container>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Container, Button, Text, Field, Icon, Dialog } from "@owlabio/owl-ui";
import AssetCard from "@/components/media/AssetCard.vue";
import { useStore } from "@/stores";
import FormAssetLocal from "@/components/forms/FormAssetLocal.vue";
import FormAssetNakala from "@/components/forms/FormAssetNakala.vue";
import FormDelete from "@/components/forms/FormDelete.vue";

const types = [
  {
    name: "all",
    value: "all",
  },
  {
    name: "image",
    value: "image",
  },
  {
    name: "audio",
    value: "audio",
  },
  {
    name: "video",
    value: "video",
  },
  {
    name: "document",
    value: "application",
  },
];

const props = defineProps({
  data: {
    type: Array,
    default() {
      return [];
    },
  },
  initialMediaType: {
    type: String,
    default: "all",
    validator: (v) => ["all", "audio", "video", "image"].includes(v),
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

const userStore = useStore("user");
const authStore = useStore("auth");
const mediaStore = useStore("media");
const settingsStore = useStore("settings");
const nakalaStore = useStore("nakala");

const fileType = ref(types[0]);
const isDeleting = ref(false);

const search = ref("");
const isEditForm = ref(false);
const selectedItems = ref([]);
const previewedItem = ref(null);

const emits = defineEmits(["delete", "select"]);
const hasSelected = computed(() => !!selectedItems.value.length);
const canDelete = computed(() => authStore.isAdmin && !props.picker);

const isNakala = computed(() => {
  return settingsStore.settings.storage.destination === "nakala";
});

const getAuthor = (id) => {
  /**
   * Maybe this isnt needed
   * Populate in the MediaService and format for Nakala.
   */
  return userStore.findOne(id);
};

watch(
  () => props.initialMediaType,
  () => {
    fileType.value = types.find((t) => t.value === props.initialMediaType);
  },
  { immediate: true }
);

function filterByTags(asset) {
  if (!search.value) return true;

  for (const tag of asset.tags) {
    if (tag.startsWith(search.value)) return true;
  }

  return false;
}

function filterByMimeType(asset) {
  const currentType = asset.mimetype.split("/")[0];
  return currentType === fileType.value.value;
}

const currentAssets = computed(() => {
  if (fileType.value.value === "all") return props.data.filter(filterByTags);
  else return props.data.filter(filterByMimeType).filter(filterByTags);
});

function prepareDelete(id) {
  selectedItems.value = [id];
  isDeleting.value = true;
}

function deleteItem(event, item) {
  event.stopPropagation();
  emits(
    "delete",
    selectedItems.value.length ? selectedItems.value : item._id,
    event
  );

  selectedItems.value = [];
  isDeleting.value = false;
}

const downloadSelection = () => {
  selectedItems.value.forEach(async (id) => {
    const item = mediaStore.findOne(id);

    const image = await fetch(item.url);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement("a");

    link.href = imageURL;
    link.download = item.originalname;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

const openEditForm = () => {
  isEditForm.value = !isEditForm.value;
};

function previewItem(item) {
  previewedItem.value = item;
  emits("select", item);
}

function copyLink(item) {
  navigator.clipboard.writeText(item.url);
}

function selectItem(item) {
  if (props.picker) {
    emits("select", item);
  } else {
    selectedItems.value.includes(item._id)
      ? selectedItems.value.splice(selectedItems.value.indexOf(item._id), 1)
      : selectedItems.value.push(item._id);
  }
}
</script>

<style scoped>
.edit-form {
  margin-block-start: var(--size-8);
}

.library {
  position: relative;
  min-height: 80vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--size-8);
}

.library-header {
  display: grid;
  grid-template-columns: v-bind(picker ? "1fr": "1fr 1fr 1fr");
  align-items: flex-end;
}

.library-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, 177px);
}

.library-preview {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;
  width: min(35ch, 100vw);
  box-shadow: var(--box-shadow-5);
}

.tab {
  width: 100%;
}

.preview-title {
  display: grid;
  grid-template-columns: auto 1fr;
}
</style>
