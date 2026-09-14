<template>
  <!-- Delete dialog -->
  <FormDelete
    :open="isDeleting"
    @cancel="isDeleting = false"
    @delete="deleteItem"
  />

  <!-- Edit dialog -->
  <el-dialog
    v-if="isEditForm"
    v-model="isEditForm"
    @close="isEditForm = false"
  >
    <template #header>
      <div class="variant-dash-title">
        <h2>Edit files</h2>
      </div>
    </template>

    <div class="edit-form">
      <FormAssetNakala v-if="isNakala" :assets="selectedItems" />
      <FormAssetLocal v-else :assets="selectedItems" />
    </div>
  </el-dialog>

  <!-- Library container -->
  <div class="library">
    <!-- Header -->
    <div class="flow-row library-header">
      <el-input type="text" placeholder="Search" v-model="search" />
      <el-select
        v-if="sortable"
        placeholder="Type"
        v-model="fileType"
        value-key="value"
      >
        <el-option
          v-for="t in types"
          :key="t.value"
          :label="t.name"
          :value="t"
        />
      </el-select>

      <div class="flow-row" v-if="selectedItems.length">
        <el-button
          aria-label="download selection"
          title="download selection"
          @click="downloadSelection"
        >
          <i class="fa-solid fa-download" />
        </el-button>
        <el-button
          aria-label="edit selection"
          title="edit selection"
          @click="openEditForm"
        >
          <i class="fa-solid fa-pen" />
        </el-button>
        <el-button
          aria-label="delete selection"
          title="delete selection"
          v-if="canDelete"
          class="danger-btn"
          @click="isDeleting = true"
        >
          <i class="fa-solid fa-trash-can" />
        </el-button>
      </div>
    </div>

    <!-- List -->
    <div class="flow-row library-list">
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
    </div>

    <!-- Preview -->
    <aside
      aria-label="preview panel"
      v-if="previewedItem"
      class="variant-surface library-preview"
      stretched
    >
      <div class="preview-title flow-row variant-dash-title">
        <el-button
          aria-label="close"
          title="close"
          text
          @click="previewedItem = null"
          size="small"
        >
          <i class="fa-solid fa-xmark" />
        </el-button>
        <h2 class="line-clamp-1">{{ previewedItem.originalname }} </h2>
      </div>

      <FormAssetNakala v-if="isNakala" :assets="[previewedItem._id]" />
      <FormAssetLocal v-else :assets="[previewedItem._id]" />
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
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
  return userStore.findOne(id);
};

watch(
  () => props.initialMediaType,
  () => {
    fileType.value = types.find((t) => t.value === props.initialMediaType);
  },
  { immediate: true }
);

// Full-text search on name, file name and tags
// (case- and accent-insensitive substring match; every whitespace-separated term must be found)
function filterByText(asset) {
  const terms = search.value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return true;

  // On a nakala asset `name` is the file name (from the API file object);
  // the data title lives in the metas (`terms#title`, always metas[0]).
  const title = asset.metas?.find(
    (m) => m.propertyUri === "http://nakala.fr/terms#title"
  )?.value;

  const haystack = [
    asset.originalname,
    asset.name,
    title,
    ...(asset.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  return terms.every((term) => haystack.includes(term));
}

function filterByMimeType(asset) {
  const currentType = asset.mimetype.split("/")[0];
  return currentType === fileType.value.value;
}

const currentAssets = computed(() => {
  const data =
    fileType.value.value === "all"
      ? props.data
      : props.data.filter(filterByMimeType);

  // Most recent first. Local assets arrive sorted from the API; nakala assets
  // carry `created` (from the terms#created meta). Assets without a date keep
  // their order (stable sort).
  return data
    .filter(filterByText)
    .sort((a, b) => new Date(b.created ?? 0) - new Date(a.created ?? 0));
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
  align-items: start;
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
