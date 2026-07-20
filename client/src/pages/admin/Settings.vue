<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteMeta" />

  <!-- Medias dialog -->
  <el-dialog :model-value="isPicking" @close="isPicking = false">
    <Medias picker @select="selectAudio" mediaType="audio" />
  </el-dialog>

  <div class="variant-dash-title flow-row-between" style="width: 100%">
    <h1>Settings</h1>
  </div>

  <div class="page-content">
    <h2>Global settings</h2>
    <section class="variant-surface stretched">
      <el-form label-position="top">
        <el-form-item label="App name">
          <el-input v-model="appName" />
        </el-form-item>
        <p class="text-sm text-fade">this will be displayed in the dashboard sidebar and in the app header</p>

        <div v-if="app === 'cnrs1'" class="grid-line">
          <div>
            <el-form-item label="app audio">
              <el-input readonly v-model="appAudio" />
            </el-form-item>
            <p class="text-sm text-fade">this is the global ambiance audio</p>
          </div>
          <el-button class="fix0" aria-label="pick a file" title="pick a file" @click="isPicking = true">
            <i class="fa-solid fa-arrow-up-from-bracket"></i>
          </el-button>
        </div>

        <div class="-equal">
          <div>
            <el-form-item label="Audio radius (in meters)">
              <el-input-number v-model="distanceAudio" />
            </el-form-item>
            <p class="text-sm text-fade">Point audio will play within n meters</p>
          </div>
          <div>
            <el-form-item label="Discovery radius (in meters)">
              <el-input-number v-model="distanceMarker" />
            </el-form-item>
            <p class="text-sm text-fade">If hidden, a point will appear within n meters</p>
          </div>
        </div>
      </el-form>
    </section>

    <h2>Map settings</h2>
    <section class="variant-surface stretched">
      <el-form label-position="top">
        <div class="mix">
          <el-form-item label="Map style">
            <el-select v-model="_mapStyle" value-key="uri" style="width: 100%">
              <el-option v-for="style in mapStyles" :key="style.uri" :label="style.name" :value="style" />
            </el-select>
          </el-form-item>
          <a href="https://www.mapbox.com/gallery/" target="_blank" class="link-text">
            Preview mapbox styles
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>

        <div class="-equal">
          <el-form-item label="latitude">
            <el-input-number v-model="mapCenter.lat" />
          </el-form-item>
          <el-form-item label="longitude">
            <el-input-number v-model="mapCenter.lng" />
          </el-form-item>
          <el-form-item label="Zoom">
            <el-input-number v-model="mapZoom" />
          </el-form-item>
        </div>
      </el-form>
    </section>

    <h2 v-if="isNakalaStorage">Nakala settings</h2>
    <section v-if="isNakalaStorage" class="variant-surface stretched">
      <el-form label-position="top">
        <el-form-item label="Api key">
          <el-input v-model="apiKey" />
        </el-form-item>
        <el-form-item label="Collection ID">
          <el-input v-model="nakalaCollection" />
        </el-form-item>

        <template v-if="vocabLoaded">
          <el-form-item label="Language">
            <el-select v-model="language" value-key="code" style="width: 100%">
              <el-option v-for="lang in vocabularies.languages" :key="lang.code" :label="lang.label" :value="lang" />
            </el-select>
          </el-form-item>

          <h3 class="fix2">Licences</h3>

          <template v-if="vocabularies.licenses">
            <el-form-item label="Add a license">
              <el-select v-model="license" value-key="code" style="width: 100%" @change="addLicense">
                <el-option v-for="lic in filteredLicenses" :key="lic.code" :label="lic.name" :value="lic" />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="!selectedLicenses.length">
            <p class="license-item">No license yet</p>
          </template>
          <template v-else>
            <template v-for="$value in selectedLicenses" :key="$value.code">
              <div class="flow-row-between">
                <p class="license-item">{{ $value.name }}</p>
                <el-button @click="removeLicense($value)" text>x</el-button>
              </div>
            </template>
          </template>

          <div class="flow-row-between">
            <h3>Additional information</h3>
            <el-button @click="addMeta">Add a field</el-button>
          </div>

          <div v-for="meta in metas" :key="meta.id">
            <el-divider />

            <div class="mix">
              <el-form-item label="Name">
                <el-input v-model="meta.title" />
              </el-form-item>
              <el-button aria-label="delete" title="delete" class="fix3 danger-btn" @click="prepareDelete(meta.id)">
                <i class="fa-solid fa-trash-can"></i>
              </el-button>
            </div>
            <div class="-equal">
              <el-form-item label="Default value">
                <el-input v-model="meta.defaultValue" />
              </el-form-item>
              <el-form-item label="Property">
                <el-select v-model="meta.propertyUri" style="width: 100%">
                  <el-option v-for="prop in vocabularies.properties" :key="prop" :label="prop.split('/').pop()" :value="prop" />
                </el-select>
              </el-form-item>
              <el-form-item label="Type">
                <el-select v-model="meta.typeUri" style="width: 100%">
                  <el-option v-for="typ in vocabularies.metadatatypes" :key="typ" :label="typ.split('/').pop()" :value="typ" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </template>
      </el-form>
    </section>

    <div class="flow-row -end">
      <el-button :loading="submitting" type="primary" @click="submit">Save changes</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
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
const license = ref(null);
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

function addLicense(value) {
  if (value) {
    selectedLicenses.value.push(value);
    license.value = null;
  }
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
.page-content {
  display: grid;
  gap: var(--size-8);
  align-content: flex-start;
  justify-items: stretch;
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

.-equal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.fix0 {
  margin-block-start: 25px;
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
