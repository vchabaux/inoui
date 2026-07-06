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
        <Button
          aria-label="go back"
          title="go back"
          text
          size="small"
          @click="goBack"
        >
          <i class="fa-solid fa-arrow-left" />
          Go back
        </Button>
      </div>

      <h2>Point information</h2>
      <Divider />
      <div v-if="error" class="width-s stretched centered">
        <Voice
          :message="error.message"
          :type="error.type"
          closable
          @close="error = null"
        />
      </div>

      <InputText
        type="text"
        placeholder="name"
        v-model="currentPoint.name"
        @change="savePoint"
      />
      <Search
        label="address"
        @select="updatePoint"
        :defaultValue="currentPoint.attributes.placeName"
      />
      <Select
        label="notice"
        :options="[{ _id: '', title: '-' }, ...notices]"
        optionLabel="title"
        optionValue="_id"
        v-model="currentPoint.attributes.notice"
        @change="savePoint"
      />
    </div>

    <!-- Content -->
    <div v-if="depth < 4" class="stretched form-list">
      <h2>Point detours</h2>
      <Divider />

      <!-- Detours -->
      <InputText
        style="flex: 1"
        type="text"
        placeholder="detour name"
        v-model="newDetour"
        @keyup.enter="addDetour"
      />

      <span v-if="!currentPoint?.children?.length">No detour yet</span>
      <template v-for="($value, $key) in currentPoint.children" :key="$key">
        <div class="flow-row list-item">
          <span class="line-clamp-1">{{ $value?.name }} </span>

          <div class="flow-row list-actions">
            <Button
              aria-label="edit"
              title="edit"
              outlined
              size="small"
              @click="editDetour($value)"
            >
              <i class="fa-solid fa-pen" />
            </Button>

            <Button
              class="danger-btn"
              aria-label="delete"
              title="delete"
              outlined
              size="small"
              @click="prepareDelete($value._id)"
            >
              <i class="fa-solid fa-trash-can" />
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Divider from "primevue/divider";
import { useStore } from "@/stores";
import { Search } from "@/components/mapbox";
import FormDelete from "@/components/forms/FormDelete.vue";
import Voice from "@/components/Voice.vue";
import { handleError } from "@/utils";

const noticeStore = useStore("notice");
const trackStore = useStore("track");
const currentPoint = computed(() => trackStore.findOne(props.node._id));
const notices = computed(() => {
  const allNotices = noticeStore.list;
  const usedNotices = trackStore.notices;

  return allNotices.filter((n) => !usedNotices.includes(n._id));
});

const emit = defineEmits(["go-back", "save", "edit"]);
const props = defineProps({ node: Object });

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

    if (currentPoint.value?.attributes.notice) {
      if (currentPoint.value.attributes.notice.title === "Aucune") {
        currentPoint.value.attributes.notice = {
          title: "",
        };

        delete pointToUpdate.attributes.notice;
      } else {
        pointToUpdate.attributes.notice = {
          ref: "Notice",
          value: currentPoint.value?.attributes.notice._id,
        };
      }
    }

    await trackStore.updateNode(currentPoint.value?._id, pointToUpdate);

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
  gap: 0;
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
