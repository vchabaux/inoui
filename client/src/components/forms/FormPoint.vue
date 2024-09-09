<template>
  <!-- Delete dialog -->
  <FormDelete
    :open="isDeleting"
    @cancel="isDeleting = false"
    @delete="deleteDetour"
  />

  <!-- Form -->
  <Container class="form-container">
    <Container v-if="isSaving" class="-saving">
      <Icon name="check" />
    </Container>

    <!-- Information -->
    <Container stretched class="form-header">
      <Container flow="row-between">
        <Button
          aria-label="go back"
          title="go back"
          variant="text"
          size="s"
          @click="goBack"
        >
          <template #start><Icon name="arrow-left" /></template>
          Go back
        </Button>
      </Container>

      <Text tag="h2">Point information</Text>
      <Separator />
      <Container v-if="error" width="s" stretched centered>
        <Voice
          :message="error.message"
          :type="error.type"
          closable
          @close="error = null"
        />
      </Container>

      <Field
        type="text"
        label="name"
        v-model="currentPoint.name"
        @change="savePoint"
      />
      <Search
        label="address"
        @select="updatePoint"
        :defaultValue="currentPoint.attributes.placeName"
      />
      <Field
        label="notice"
        type="select"
        :options="[{ _id: '', title: '-' }, ...notices]"
        :formatter="(v) => v.title"
        v-model="currentPoint.attributes.notice"
        @change="savePoint"
      />
    </Container>

    <!-- Content -->
    <Container v-if="depth < 4" stretched class="form-list">
      <Text tag="h2">Point detours</Text>
      <Separator />

      <!-- Detours -->
      <Field
        style="flex: 1"
        type="text"
        label="detour name"
        v-model="newDetour"
        @keyup.enter="addDetour"
      />

      <Text v-if="!currentPoint?.children?.length">No detour yet</Text>
      <Each
        v-else
        :data="currentPoint.children"
        :isRecursive="false"
        v-slot="{ $key, $value }"
      >
        <Container flow="row" class="list-item">
          <Text :lines="1">{{ $value?.name }} </Text>

          <Container flow="row" class="list-actions">
            <Button
              aria-label="edit"
              title="edit"
              variant="outline"
              size="s"
              icon
              @click="editDetour($value)"
            >
              <Icon name="pen" />
            </Button>

            <Button
              class="danger-btn"
              aria-label="delete"
              title="delete"
              variant="outline"
              size="s"
              icon
              @click="prepareDelete($value._id)"
            >
              <Icon name="trash-can" />
            </Button>
          </Container>
        </Container>
      </Each>
    </Container>
  </Container>
</template>

<script setup>
import { ref, watchEffect, computed } from "vue";
import {
  Container,
  Field,
  Button,
  Icon,
  Text,
  Separator,
} from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import { Each } from "@owlabio/each-vue";
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
