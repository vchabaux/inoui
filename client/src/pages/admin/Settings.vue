<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteMeta" />

  <!-- Medias dialog -->
  <Dialog v-model:visible="isPicking" modal @hide="isPicking = false">
    <Medias picker @select="selectAudio" mediaType="audio" />
  </Dialog>

  <div class="variant-dash-title flow-row-between">
    <h1>Settings</h1>
  </div>

  <h2>Global settings</h2>
  <section class="variant-surface stretched">
    <label>App name</label>
    <InputText type="text" v-model="appName" />
    <p class="text-sm text-fade">this will be displayed in the dashboard sidebar and in the app header</p>

    <div v-if="app === 'cnrs1'" class="flow-row grid-line">
      <label>app audio</label>
      <InputText type="text" readonly v-model="appAudio" />
      <p class="text-sm text-fade">this is the global ambiance audio</p>
      <Button class="fix0" aria-label="pick a file" title="pick a file" @click="isPicking = true">
        <i class="fa-solid fa-arrow-up-from-bracket"></i>
      </Button>
    </div>

    <div class="flow-row -equal">
      <label>Audio radius (in meters)</label>
      <InputNumber v-model="distanceAudio" />
      <p class="text-sm text-fade">Point audio will play within n meters</p>
      <label>Discovery radius (in meters)</label>
      <InputNumber v-model="distanceMarker" />
      <p class="text-sm text-fade">If hidden, a point will appear within n meters</p>
    </div>
  </section>

  <h2>Map settings</h2>
  <section class="variant-surface stretched">
    <div class="flow-row mix">
      <label>Map style</label>
      <Select :options="mapStyles" optionLabel="name" v-model="_mapStyle" />

      <a href="https://www.mapbox.com/gallery/" target="_blank" class="link-text">
        Preview mapbox styles
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    </div>

    <div class="flow-row -equal">
      <label>latitude</label>
      <InputNumber v-model="mapCenter.lat" />
      <label>longitude</label>
      <InputNumber v-model="mapCenter.lng" />
      <label>Zoom</label>
      <InputNumber v-model="mapZoom" />
    </div>
  </section>

  <h2 v-if="isNakalaStorage">Nakala settings</h2>
  <section v-if="isNakalaStorage" class="variant-surface stretched">
    <label>Api key</label>
    <InputText type="text" v-model="apiKey" />
    <label>Collection ID</label>
    <InputText type="text" v-model="nakalaCollection" />

    <template v-if="vocabLoaded">
      <label>Language</label>
      <Select :options="vocabularies.languages" optionLabel="label" v-model="language" />

      <h3 class="fix2">Licences</h3>
      <template v-if="vocabularies.licenses">
        <label>Add a license</label>
        <Select :options="filteredLicenses" optionLabel="name" v-model="license" @change="addLicense" />
      </template>

      <template v-if="!selectedLicenses.length">
        <p class="license-item">No license yet</p>
      </template>
      <template v-else>
        <template v-for="$value in selectedLicenses" :key="$value.code">
          <div class="flow-row-between">
            <p class="license-item">{{ $value.name }} </p>
            <Button @click="removeLicense($value)">x</Button>
          </div>
        </template>
      </template>

      <div class="flow-row-between">
        <h3>Additional information</h3>
        <Button @click="addMeta">Add a field</Button>
      </div>

      <div v-for="meta in metas" :key="meta.id">
        <Divider />

        <div class="flow-row mix">
          <label>Name</label>
          <InputText type="text" v-model="meta.title" />
          <Button aria-label="delete" title="delete" outlined class="fix3 danger-btn" @click="prepareDelete(meta.id)">
            <i class="fa-solid fa-trash-can"></i>
          </Button>
        </div>
        <div class="flow-row -equal">
          <label>Default value</label>
          <InputText type="text" v-model="meta.defaultValue" />
          <label>Property</label>
          <Select :options="vocabularies.properties" v-model="meta.propertyUri" />
          <label>Type</label>
          <Select :options="vocabularies.metadatatypes" v-model="meta.typeUri" />
        </div>
      </div>
    </template>
  </section>

  <div class="flow-row -end">
    <Button :loading="submitting" @click="submit">Save changes</Button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/stores";
import { mapStyles } from "@/utils/mapStyles";
import FormDelete from "@/components/forms/FormDelete.vue";
import Medias from "@/pages/admin/Medias.vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Divider from "primevue/divider";

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
