<template>
  <!-- Delete dialog -->
  <FormDelete
    :open="isDeleting"
    @cancel="isDeleting = false"
    @delete="deleteDetour"
  />

  <!-- Form -->
  <div class="form-container">
    <div v-if="isSaving" class="-saving">
      <i class="fa-solid fa-check" />
    </div>

    <!-- Information -->
    <div class="stretched form-header">
      <div class="flow-row-between">
        <el-button
          text
          size="small"
          @click="goBack"
        >
          <i class="fa-solid fa-arrow-left" />
          Go back
        </el-button>
      </div>

      <h2>Point information</h2>
      <el-divider />
      <div v-if="error" class="width-s stretched centered">
        <Voice
          :message="error.message"
          :type="error.type"
          closable
          @close="error = null"
        />
      </div>

      <el-form label-position="top">
        <el-form-item label="name">
          <el-input
            v-model="currentPoint.name"
            @change="savePoint"
          />
        </el-form-item>
        <el-form-item label="address">
          <Search
            label=""
            @select="updatePoint"
            :defaultValue="currentPoint.attributes.placeName"
          />
        </el-form-item>
        <el-form-item label="notice">
          <el-select
            v-model="selectedNoticeId"
            @change="savePoint"
          >
            <el-option label="-" value="" />
            <el-option v-for="n in notices" :key="n._id" :label="n.title" :value="n._id" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- Content -->
    <div v-if="depth < 4" class="stretched form-list">
      <h2>Point detours</h2>
      <el-divider />

      <!-- Detours -->
      <el-form label-position="top">
        <el-form-item label="detour name">
          <el-input
            style="flex: 1"
            v-model="newDetour"
            @keyup.enter="addDetour"
          />
        </el-form-item>
      </el-form>

      <span v-if="!currentPoint?.children?.length">No detour yet</span>
      <template v-for="($value, $key) in currentPoint.children" :key="$key">
        <div class="flow-row list-item">
          <span class="line-clamp-1">{{ $value?.name }} </span>

          <div class="flow-row list-actions">
            <el-button
              plain
              size="small"
              @click="editDetour($value)"
            >
              <i class="fa-solid fa-pen" />
            </el-button>

            <el-button
              class="danger-btn"
              plain
              size="small"
              @click="prepareDelete($value._id)"
            >
              <i class="fa-solid fa-trash-can" />
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, computed } from "vue";
import { useStore } from "@/stores";
import { Search } from "@/components/mapbox";
import FormDelete from "@/components/forms/FormDelete.vue";
import Voice from "@/components/Voice.vue";
import { handleError } from "@/utils";

const emit = defineEmits(["go-back", "save", "edit"]);
const props = defineProps({ node: Object });

const noticeStore = useStore("notice");
const trackStore = useStore("track");
const currentPoint = computed(() => trackStore.findOne(props.node._id));

// Local ref for the selected notice ID (string), decoupled from the reactive store
const selectedNoticeId = ref("");

// Initialiser la ref locale depuis le store une fois le composant monté
// (à ce moment-là les données Pinia sont chargées)
onMounted(() => {
  const notice = currentPoint.value?.attributes?.notice;
  if (notice && typeof notice === "object" && notice._id) {
    selectedNoticeId.value = String(notice._id);
  } else if (notice && typeof notice === "string") {
    selectedNoticeId.value = String(notice);
  } else {
    selectedNoticeId.value = "";
  }
});

// Synchro réactive quand l'utilisateur change de point (ou après re-fetch)
watchEffect(() => {
  let notice;
  try {
    notice = currentPoint.value?.attributes?.notice;
  } catch {
    notice = undefined;
  }
  if (notice && typeof notice === "object" && notice._id) {
    selectedNoticeId.value = String(notice._id);
  } else if (notice && typeof notice === "string") {
    selectedNoticeId.value = String(notice);
  } else {
    selectedNoticeId.value = "";
  }
});

  // Notices list: shows all notices not already used, plus the current one
const notices = computed(() => {
  const allNotices = noticeStore.list;
  const usedNotices = trackStore.notices;
  const currentId = selectedNoticeId.value;

  const filtered = allNotices.filter(
    (n) => !usedNotices.includes(n._id) || n._id === currentId
  );
  if (currentId && !filtered.find((n) => n._id === currentId)) {
    const current = allNotices.find((n) => n._id === currentId);
    if (current) filtered.push(current);
  }
  return filtered;
});

const isSaving = ref(false);
const isDeleting = ref(false);
const error = ref(null);
const depth = computed(() => currentPoint.value.path.split("/").length - 1);
const selectedItem = ref(null);
const newDetour = ref("");

function goBack() {
  emit("go-back", currentPoint.value.parent);
}

function save() {
  isSaving.value = true;
  emit("save");
  setTimeout(() => (isSaving.value = false), 1500);
}

async function savePoint() {
  try {
    error.value = null;
    const pointToUpdate = currentPoint.value
      ? {
          ...currentPoint.value,
          attributes: {
            ...currentPoint.value?.attributes,
            coordinates: currentPoint.value?.attributes.coordinates,
          },
        }
      : {
          name: currentPoint.value?.name,
          context: currentPoint.value?.context,
          attributes: {
            ...currentPoint.value?.attributes,
            coordinates: currentPoint.value?.attributes.coordinates,
          },
        };

    if (selectedNoticeId.value) {
      pointToUpdate.attributes.notice = {
        ref: "Notice",
        value: String(selectedNoticeId.value),
      };
    } else {
      delete pointToUpdate.attributes.notice;
    }


    await trackStore.updateNode(currentPoint.value?._id, pointToUpdate);

    // Re-sync selectedNoticeId from the fresh store data after save
    const freshNotice = currentPoint.value?.attributes?.notice;
    if (freshNotice && typeof freshNotice === "object" && freshNotice._id) {
      selectedNoticeId.value = String(freshNotice._id);
    } else if (freshNotice && typeof freshNotice === "string") {
      selectedNoticeId.value = String(freshNotice);
    } else {
      selectedNoticeId.value = "";
    }


    save();
  } catch (err) {
    error.value = handleError(err);
  }
}

async function updatePoint(place) {
  const pointToUpdate = {
    attributes: {
      ...currentPoint.value?.attributes,
      placeName: place.place_name,
      coordinates: place.geometry.coordinates,
    },
  };

  await trackStore.updateNode(currentPoint.value._id, pointToUpdate);

  save();
}

async function addDetour() {
  await trackStore.createTrack(newDetour.value, currentPoint.value._id);
  currentPoint.value = trackStore.findOne(props.node._id);

  newDetour.value = "";

  save();
}

function editDetour(detour) {
  emit("edit", detour);
}

function prepareDelete(id) {
  selectedItem.value = id;
  isDeleting.value = true;
}

async function deleteDetour() {
  await trackStore.deleteOne(selectedItem.value);
  isDeleting.value = false;
  selectedItem.value = null;

  save();
}
</script>

<style scoped>
.form-container {
  position: relative;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--size-8);
  padding: var(--size-6) var(--size-8);
}

.form-header:not(:empty),
.form-list {
  margin-block-end: var(--size-4);
}

.list-item {
  display: grid;
  grid-template-columns: 1fr auto;
  padding-block: var(--size-1);
  font-size: var(--size-3-5);
}

.list-actions {
  gap: var(--size-2);
}

.-saving {
  position: absolute;
  width: max-content;
  inset-block-start: 0;
  inset-inline-end: 0;
  padding: var(--size-2);
  border-radius: var(--app-radius, var(--radius-2));
  background: seagreen;
  color: var(--color-background-neutral);
  font-size: var(--size-4);
}
</style>
