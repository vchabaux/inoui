<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="isDeleting = false" @delete="deletePoint" />

  <!-- Form -->
  <div class="form-container">
    <div v-if="isSaving" class="-saving">
      <i class="fa-solid fa-check" />
    </div>

    <!-- Information -->
    <div class="stretched form-header">
      <div v-if="isDetour" class="flow-row-between">
        <Button aria-label="go back" title="go back" text size="small" @click="goBack">
          <i class="fa-solid fa-arrow-left" />
          Go back
        </Button>
      </div>

      <template v-if="isDetour">
        <h2>Detour information</h2>
        <Divider />
        <InputText type="text" placeholder="name" v-model="currentTrack.name" @change="saveTrack" />
      </template>

      <Voice v-if="error" :message="error.data.message" type="error" is-closable @close="error = null" />
    </div>

    <!-- Content -->
    <form class="stretched" @submit.prevent>
      <h2>{{ isDetour ? "Detour points" : "Track points" }}</h2>
      <Divider />

      <!-- Points -->
      <Search label="Add a point" @select="addPoint" defaultValue="" hint="you can also click on the map" />

      <span v-if="!currentTrack?.children?.length"> No point yet </span>
      <template v-for="($value, $key) in currentTrack.children" :key="$key">
        <div class="list-item">
          <span class="line-clamp-1">{{ $key + 1 }} - {{ $value?.name }} </span>

          <div class="flow-row list-actions">
            <Button aria-label="move up" title="move up" @click="movePoint('up', $key)" class="caret-up" text size="small" :class="{ hidden: $key <= 0 }">
              <i class="fa-solid fa-chevron-up" />
            </Button>

            <Button aria-label="move down" title="move down" @click="movePoint('down', $key)" class="caret-down" :class="{ hidden: $key === currentTrack.children.length - 1 }" text size="small">
              <i class="fa-solid fa-chevron-down" />
            </Button>

            <Button aria-label="edit" title="edit" outlined size="small" @click="editPoint($value)">
              <i class="fa-solid fa-pen" />
            </Button>

            <Button aria-label="delete" title="delete" class="danger-btn" outlined size="small" @click="prepareDelete($value._id)">
              <i class="fa-solid fa-trash-can" />
            </Button>
          </div>
        </div>
      </template>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Divider from "primevue/divider";
import { useStore } from "@/stores";
import { Search } from "@/components/mapbox";
import FormDelete from "@/components/forms/FormDelete.vue";
import Voice from "@/components/Voice.vue";

const trackStore = useStore("track");
const currentTrack = computed(() => trackStore.findOne(props.node._id));

const emit = defineEmits(["go-back", "save", "edit"]);
const props = defineProps({ node: Object });

const isSaving = ref(false);
const isDeleting = ref(false);
const isDetour = computed(() => !!currentTrack.value.parent);
const selectedItem = ref(null);
const error = ref(null);

function goBack() {
  emit("go-back", currentTrack.value.parent);
}

function save() {
  isSaving.value = true;
  emit("save");

  setTimeout(() => (isSaving.value = false), 1500);
}

async function saveTrack() {
  await trackStore.updateNode(currentTrack.value._id, currentTrack.value);

  save();
}

async function addPoint(place) {
  const newPoint = {
    name: `Point # ${currentTrack.value.children.length + 1}`,
    attributes: {
      placeName: place.place_name,
      coordinates: place.geometry.coordinates,
    },
  };

  await trackStore.createPoint(currentTrack.value._id, newPoint);
  currentTrack.value = trackStore.findOne(currentTrack.value._id);

  save();
}

async function movePoint(direction, index) {
  let currentItem = currentTrack.value.children[index];
  let newItem = direction === "up" ? currentTrack.value.children[index - 1] : currentTrack.value.children[index + 1];

  await trackStore.swapChildren(newItem._id, currentItem._id);

  save();
}

function editPoint(point) {
  emit("edit", point);
}

function prepareDelete(id) {
  isDeleting.value = true;
  selectedItem.value = id;
}

async function deletePoint() {
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-2);
}

.caret-up {
  grid-column: 1;
}

.caret-down {
  grid-column: 2;
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

.hidden {
  visibility: hidden;
}
</style>
