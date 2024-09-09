<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteMeta" />

  <!-- Medias dialog -->
  <Dialog id="assets" :open="isPicking" modal @close="isPicking = false">
    <Medias picker @select="selectAudio" mediaType="audio" />
  </Dialog>

  <Container variant="dash-title" flow="row-between">
    <h1>Settings</h1>
  </Container>

  <h2>Global settings</h2>
  <Container tag="section" variant="surface" stretched>
    <Field
      type="text"
      label="App name"
      v-model="appName"
      hint="this will be displayed in the dashboard sidebar and in the app header"
    />

    <Container v-if="app === 'cnrs1'" flow="row" class="grid-line">
      <Field
        type="text"
        label="app audio"
        readonly
        hint="this is the global ambiance audio"
        v-model="appAudio"
      />
      <Button
        class="fix0"
        aria-label="pick a file"
        title="pick a file"
        @click="isPicking = true"
      >
        <Icon name="arrow-up-from-bracket" />
      </Button>
    </Container>

    <Container flow="row" class="-equal">
      <Field
        type="number"
        label="Audio radius (in meters)"
        hint="Point audio will play within n meters"
        v-model="distanceAudio"
      />
      <Field
        type="number"
        label="Discovery radius (in meters)"
        hint="If hidden, a point will appear within n meters"
        v-model="distanceMarker"
      />
    </Container>
  </Container>

  <h2>Map settings</h2>
  <Container tag="section" variant="surface" stretched>
    <Container flow="row" class="mix">
      <Field
        type="select"
        label="Map style"
        :options="mapStyles"
        :formatter="(v) => v.name"
        v-model="_mapStyle"
      />

      <Link variant="text" external path="https://www.mapbox.com/gallery/">
        <template #end><Icon name="arrow-up-right-from-square" /></template>
        Preview mapbox styles
      </Link>
    </Container>

    <Container flow="row" class="-equal">
      <Field type="number" label="latitude" v-model="mapCenter.lat" />
      <Field type="number" label="longitude" v-model="mapCenter.lng" />
      <Field type="number" label="Zoom" v-model="mapZoom" />
    </Container>
  </Container>

  <h2 v-if="isNakalaStorage">Nakala settings</h2>
  <Container v-if="isNakalaStorage" tag="section" variant="surface" stretched>
    <Field type="text" label="Api key" v-model="apiKey" />
    <Field type="text" label="Collection ID" v-model="nakalaCollection" />

    <template v-if="vocabLoaded">
      <Field
        label="Language"
        type="select"
        :options="vocabularies.languages"
        :formatter="(v) => v.label"
        v-model="language"
      />

      <h3 class="fix2">Licences</h3>
      <Field
        v-if="vocabularies.licenses"
        type="select"
        label="Add a license"
        :options="filteredLicenses"
        :formatter="(v) => v.name"
        v-model="license"
        @change="addLicense"
      />

      <Text v-if="!selectedLicenses.length" class="license-item"
        >No license yet</Text
      >
      <Each v-else :data="selectedLicenses" v-slot="{ $value }">
        <Container flow="row-between">
          <Text class="license-item">{{ $value.name }} </Text>
          <Button @click="removeLicense($value)">x</Button>
        </Container>
      </Each>

      <Container flow="row-between">
        <h3>Additional information</h3>
        <Button @click="addMeta">Add a field</Button>
      </Container>

      <Container v-for="meta in metas" :key="meta.id">
        <Separator />

        <Container flow="row" class="mix">
          <Field label="Name" type="text" v-model="meta.title" />
          <Button
            aria-label="delete"
            title="delete"
            variant="outline"
            class="fix3 danger-btn"
            @click="prepareDelete(meta.id)"
            ><Icon name="trash-can"
          /></Button>
        </Container>
        <Container flow="row" class="-equal">
          <Field
            type="text"
            label="Default value"
            v-model="meta.defaultValue"
          />
          <Field
            type="select"
            label="Property"
            :options="vocabularies.properties"
            :formatter="(v) => v.split('/').pop()"
            v-model="meta.propertyUri"
          />
          <Field
            type="select"
            label="Type"
            :options="vocabularies.metadatatypes"
            :formatter="(v) => v.split('/').pop()"
            v-model="meta.typeUri"
          />
        </Container>
      </Container>
    </template>
  </Container>

  <Container flow="row" class="-end">
    <Button :pending="submitting" @click="submit">Save changes</Button>
  </Container>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  Dialog,
  Field,
  Button,
  Container,
  Text,
  Link,
  Icon,
  Separator,
} from "@owlabio/owl-ui";
import { v4 as uuidv4 } from "uuid";
import { Each } from "@owlabio/each-vue";
import { useStore } from "@/stores";
import { mapStyles } from "@/utils/mapStyles";
import FormDelete from "@/components/forms/FormDelete.vue";
import Medias from "@/pages/admin/Medias.vue";

const settingsStore = useStore("settings");
const nakalaStore = useStore("nakala");

const vocabularies = computed(() => nakalaStore.vocabularies);
const vocabLoaded = computed(() => nakalaStore.vocabLoaded);
const settings = computed(() => settingsStore.settings);
const app = computed(() => settingsStore.project);

const _mapStyle = ref("");
const appName = ref("");
const appAudio = ref("");
const distanceAudio = ref(500);
const distanceMarker = ref(200);
const nakalaCollection = ref("");
const isNakalaStorage = ref(false);
const submitting = ref(false);
const mapCenter = ref({ lat: 0, lng: 0 });
const mapZoom = ref(10);
const metas = ref([]);
const language = ref(null);
const license = ref("");
const selectedLicenses = ref([]);
const isDeleting = ref(false);
const selectedItem = ref(null);
const isPicking = ref(false);
const apiKey = ref("");

const filteredLicenses = computed(() => {
  if (!vocabularies.value.licenses) return [];
  const filtered = [];

  for (const license of vocabularies.value.licenses) {
    const found = selectedLicenses.value.find((l) => l.code === license.code);
    if (!found) filtered.push(license);
  }

  return filtered;
});

function addMeta() {
  metas.value.push({
    title: "",
    id: uuidv4(),
    propertyUri: "",
    typeUri: "",
    defaultValue: "",
  });
}

async function deleteMeta() {
  metas.value = metas.value.filter((meta) => meta.id !== selectedItem.value);
  await submit();
  isDeleting.value = false;
}

function addLicense(_, value) {
  selectedLicenses.value.push(value);
  license.value = "";
}

function prepareDelete(id) {
  selectedItem.value = id;
  isDeleting.value = true;
}

function clearThings() {
  selectedItem.value = null;
  isDeleting.value = false;
}

function selectAudio(file) {
  appAudio.value = file.url;
  isPicking.value = false;
}

watch(
  () => settings.value,
  (value) => {
    if (value.storage.destination === "nakala") {
      nakalaStore.initVocabularies();
    }
  },
  { immediate: true }
);

watch(
  () => settings.value.nakala,
  (newValue) => {
    metas.value = newValue.assetMetas ? newValue.assetMetas : [];
    selectedLicenses.value = newValue.licenses ? newValue.licenses : [];
    language.value = newValue.language ? newValue.language : "";
  },
  { immediate: true }
);

watch(
  settings,
  () => {
    _mapStyle.value = mapStyles.find(
      (style) => style.uri === settings.value?.map?.mapStyle
    );

    appAudio.value = settings.value.map.appAudio;
    distanceAudio.value = settings.value.map.distanceAudio;
    distanceMarker.value = settings.value.map.distanceMarker;

    mapCenter.value = {
      lat: settings.value.map.center[0],
      lng: settings.value.map.center[1],
    };

    mapZoom.value = settings.value.map.zoom;

    appName.value = settings.value.name;
    isNakalaStorage.value = settings.value.storage.destination === "nakala";

    nakalaCollection.value = settings.value.nakala?.collection;

    apiKey.value = settings.value.nakala?.apiKey;
  },
  { immediate: true }
);

function removeLicense(license) {
  selectedLicenses.value = selectedLicenses.value.filter(
    (l) => l.name !== license.name
  );
}

const submit = async () => {
  try {
    submitting.value = true;

    const data = {
      name: appName.value,
      storage: { destination: isNakalaStorage.value ? "nakala" : "local" },
      map: {
        mapStyle: _mapStyle.value.uri,
        center: [mapCenter.value.lat, mapCenter.value.lng],
        zoom: mapZoom.value,
        appAudio: appAudio.value,
        distanceAudio: distanceAudio.value,
        distanceMarker: distanceMarker.value,
      },
    };

    data.nakala = !isNakalaStorage.value
      ? { collection: "" }
      : {
          apiKey: apiKey.value,
          collection: nakalaCollection.value,
          assetMetas: metas.value,
          language: language.value,
          licenses: selectedLicenses.value,
        };

    await settingsStore.update(data);
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => (submitting.value = false), 1000);
  }
};
</script>

<style scoped>
.row {
  align-items: flex-start;
}

.grid-line {
  display: grid;
  grid-template-columns: 1fr auto;
}

.mix {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-end;
}

.-start {
  align-items: flex-start;
}

.-equal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.url-row {
  align-items: flex-end;
}

.url-row :first-child {
  flex: 1;
}

.fix0 {
  margin-block-start: 25px;
}

.fix1 {
  align-self: flex-start;
  margin-block-start: 35px;
}

.fix2 {
  margin-block-start: var(--size-3);
}

.fix3 {
  margin-block-start: 25px;
}

.license-item {
  padding-block: var(--size-1) !important;
}
</style>
