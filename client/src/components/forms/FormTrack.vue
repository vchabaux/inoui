<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="isDeleting = false" @delete="deletePoint" />

  <!-- Form -->
  <Container class="form-container">
    <Container v-if="isSaving" class="-saving">
      <Icon name="check" />
    </Container>

    <!-- Information -->
    <Container stretched class="form-header">
      <Container v-if="isDetour" flow="row-between">
        <Button aria-label="go back" title="go back" variant="text" size="s" @click="goBack">
          <template #start><Icon name="arrow-left" /></template>
          Go back
        </Button>
      </Container>

      <template v-if="isDetour">
        <Text tag="h2">Detour information</Text>
        <Separator />
        <Field type="text" label="name" v-model="currentTrack.name" @change="saveTrack" />
      </template>

      <Voice v-if="error" :message="error.data.message" type="error" is-closable @close="error = null" />
    </Container>

    <!-- Content -->
    <Container tag="form" stretched @submit.prevent>
      <Text tag="h2">{{ isDetour ? "Detour points" : "Track points" }}</Text>
      <Separator />

      <!-- Points -->
      <Search label="Add a point" @select="addPoint" defaultValue="" hint="you can also click on the map" />

      <Text v-if="!currentTrack?.children?.length"> No point yet </Text>
      <Each v-else :data="currentTrack.children" :isRecursive="false" v-slot="{ $key, $value }">
        <div class="list-item">
          <Text :lines="1">{{ $key + 1 }} - {{ $value?.name }} </Text>

          <Container flow="row" class="list-actions">
            <Button aria-label="move up" title="move up" @click="movePoint('up', $key)" class="caret-up" variant="text" size="s" :class="{ hidden: $key <= 0 }">
              <Icon name="chevron-up" type="fas" />
            </Button>

            <Button aria-label="move down" title="move down" @click="movePoint('down', $key)" class="caret-down" :class="{ hidden: $key === currentTrack.children.length - 1 }" variant="text" size="s">
              <Icon name="chevron-down" type="fas" />
            </Button>

            <Button aria-label="edit" title="edit" variant="outline" size="s" @click="editPoint($value)">
              <Icon name="pen" type="fas" />
            </Button>

            <Button aria-label="delete" title="delete" class="danger-btn" variant="outline" size="s" @click="prepareDelete($value._id)">
              <Icon name="trash-can" type="fas" />
            </Button>
          </Container>
        </div>
      </Each>
    </Container>
  </Container>
</template>

<script setup>
import { ref, computed } from "vue";
import { Container, Field, Button, Icon, Text, Separator } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import { Each } from "@owlabio/each-vue";
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
