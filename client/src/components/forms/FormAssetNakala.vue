<template>
  <Container tag="form" @submit.prevent width="s" stretched>
    <Voice
      v-if="error"
      :message="error.message"
      :type="error.type"
      :closable="true"
      @close="error = null"
    />

    <Field
      v-for="meta in assetMetas"
      :key="meta.title"
      v-model="meta.defaultValue"
      :label="meta.title"
      type="text"
    />

    <Field type="text" label="name" v-model="title" />

    <Field
      type="select"
      label="License"
      v-model="selectedLicense"
      :options="licenses"
      :formatter="(v) => v.name"
    />

    <Field
      type="textarea"
      :rows="3"
      label="Description"
      name="description"
      v-model="description"
    />

    <Field
      ref="fileField"
      type="file"
      label="Files"
      @change="checkUploadSize"
      multiple
      preview
      v-model="images"
    />

    <!-- TEMP UPLOAD: files are pushed to the server on selection -->
    <Container
      v-if="fileStatuses.length"
      tag="div"
      flow="column"
      class="temp-upload"
    >
      <Container
        v-if="uploadingFiles || uploadProgress > 0"
        tag="div"
        class="temp-upload__progress"
      >
        <div
          class="temp-upload__bar"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </Container>

      <Container tag="ul" flow="column" class="temp-upload__list">
        <Container
          tag="li"
          flow="row"
          class="temp-upload__item"
          v-for="(file, i) in fileStatuses"
          :key="file.name + i"
        >
          <Icon
            v-if="file.status === 'uploading' || file.status === 'pending'"
            name="spinner"
            spin
          />
          <Icon v-else-if="file.status === 'done'" name="check" />
          <Icon v-else-if="file.status === 'error'" name="xmark" />

          <span class="temp-upload__name">{{ file.name }}</span>

          <Button
            v-if="file.status === 'error'"
            class="temp-upload__retry"
            @click="retryFile(i)"
          >
            Réessayer
          </Button>
        </Container>
      </Container>
    </Container>

    <Field
      type="checkbox"
      label="this file has an author"
      name="author"
      v-model="withAuthor"
    />

    <template v-if="withAuthor">
      <Field
        type="text"
        label="Author name"
        name="authorName"
        v-model="author.name"
      />
    </template>

    <AsyncSearch
      label="keywords"
      :maxItems="20"
      endPoint="https://api.isidore.science/vocabulary/suggest?output=json&replies=20"
      resultLocation="data.response.replies.reply"
      :formatResult="(v) => v['@label']"
      @select="handleSelect"
    />

    <!-- SELECTED KEYWORDS -->
    <Container tag="ul">
      <Container tag="li" flow="row" v-for="(word, i) in keywords">
        {{ word["@label"] }} <Button @click="removeKeyword(i)">X</Button>
      </Container>
    </Container>

    <!-- ASSETS -->
    <AssetDetails
      v-if="isMulti"
      v-for="assetId in assets"
      :file="getFile(assetId)"
    />

    <!-- VALIDATION -->
    <Text v-if="showUploadWaiting" class="temp-upload__waiting">
      Upload en cours, veuillez patienter...
    </Text>

    <Button wide class="upload-btn" :pending="isSubmitting" @click="upload">
      {{ isUpdate ? "Save" : "Add to nakala library" }}
    </Button>
  </Container>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Container, Button, Field, Text, Icon } from "@owlabio/owl-ui";
import Voice from "@/components/Voice.vue";
import AssetDetails from "../media/AssetDetails.vue";
import { useStore } from "@/stores";
import AsyncSearch from "@/components/AsyncSearch.vue";
import { handleError } from "@/utils";
import { api } from "@/api/axios";

const props = defineProps({
  dataId: {
    type: String,
    default: null,
  },
});

const nakalaStore = useStore("nakala");
const settingsStore = useStore("settings");

const isUpdate = computed(() => !!props.dataId);

const isSubmitting = ref(false);
const fileField = ref(null);
const withAuthor = ref(false);
const error = ref(null);
const keywords = ref([]);
const assetMetas = ref([]);
const images = ref(null);
// Temp upload state — files are pushed to the server on selection (prompt 2a).
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB per file (configurable)
const uploadedFiles = ref([]); // server responses { tempId, originalname, size, mimetype }
const fileStatuses = ref([]); // per-file UI status { name, size, status, progress }
const selectedFiles = ref([]); // raw File objects, kept for retry
const uploadingFiles = ref(false); // any temp upload in flight
const uploadProgress = ref(0); // overall 0-100
const pendingUploads = ref([]); // live in-flight upload promises
const showUploadWaiting = ref(false);
const title = ref("");
const description = ref("");
const author = ref({
  name: "",
});
const selectedLicense = ref("");

const isMulti = computed(() => Array.isArray(props.assets));

nakalaStore.initVocabularies();

// const assetMetas = computed(() => {
//   return settingsStore.settings.nakala.assetMetas;
// });

const excludedMetas = [
  "title", // Required
  "created", // Required - hidden
  "creator", // Required -hidden
  "license", // Required - hidden
  "description", // The description (optional)
  "type", // If it's media or anything
  "subject", // This is for keywords
];

watch(
  () => props.dataId,
  (identifier) => {
    if (!identifier) {
      assetMetas.value = settingsStore.settings.nakala.assetMetas.map(
        (meta) => ({ ...meta })
      );
      title.value = "";
      selectedLicense.value = "";
      author.value = {
        name: "",
      };
      description.value = "";
      images.value = null;
      resetTempUpload();
      return;
    }

    const foundData = nakalaStore.getById(identifier);

    const foundLicense = foundData.metas.find((m) =>
      m.propertyUri.includes("license")
    );
    const foundTitle = foundData.metas.find((m) =>
      m.propertyUri.includes("title")
    );

    const foundDescription = foundData.metas.find((m) =>
      m.propertyUri.includes("description")
    );

    const filteredMetas = foundData.metas.filter((meta) => {
      const isHash = meta.propertyUri.includes("#");

      let propertyName = isHash
        ? meta.propertyUri.split("#")[1]
        : meta.propertyUri.split("/").pop();

      return !excludedMetas.includes(propertyName);
    });

    filteredMetas.forEach((meta) => {
      const foundAssociation = settingsStore.settings.nakala.assetMetas.find(
        (m) => {
          return (
            m.propertyUri === meta.propertyUri && m.typeUri === meta.typeUri
          );
        }
      );

      meta.title = foundAssociation.title;
      meta.defaultValue = meta.value;
    });

    assetMetas.value = filteredMetas;

    description.value = foundDescription?.value;

    title.value = foundTitle?.value;

    const normalizedLicense = nakalaStore.getLicense(foundLicense.value);

    selectedLicense.value = normalizedLicense;
  },
  {
    immediate: true,
  }
);

const licenses = computed(() => settingsStore.settings.nakala.licenses);
const language = computed(() => settingsStore.settings.nakala.language);

function formatMetas(metas, lang) {
  return metas.map((meta) => {
    return {
      value: meta.defaultValue,
      // lang: lang,
      typeUri: meta.typeUri,
      propertyUri: meta.propertyUri,
    };
  });
}

function checkUploadSize(event) {
  const fileList = event.target.files;
  if (!fileList || !fileList.length) return;

  const files = Array.from(fileList);

  // Alert on any file above the configured limit (default 2 GB).
  const oversized = files.filter((file) => file.size > MAX_FILE_SIZE);
  if (oversized.length) {
    const limitGb = Math.round((MAX_FILE_SIZE / 1024 / 1024 / 1024) * 10) / 10;
    alert(
      `La taille maximum autorisée est de ${limitGb} GB par fichier (${
        oversized.length
      } fichier(s) ignoré(s)).`
    );
  }

  const valid = files.filter((file) => file.size <= MAX_FILE_SIZE);
  if (valid.length) startTempUpload(valid);
}

// Overall progress = bytes uploaded across every file in the batch.
function computeOverallProgress() {
  const statuses = fileStatuses.value;
  if (!statuses.length) {
    uploadProgress.value = 0;
    return;
  }
  const total = statuses.reduce((sum, file) => sum + (file.size || 0), 0);
  const uploaded = statuses.reduce(
    (sum, file) => sum + ((file.size || 0) * (file.progress || 0)) / 100,
    0
  );
  uploadProgress.value = total ? Math.round((uploaded / total) * 100) : 0;
}

// Track an in-flight upload so the submit handler can wait for it.
function track(promise) {
  pendingUploads.value.push(promise);
  uploadingFiles.value = true;
  promise.finally(() => {
    pendingUploads.value = pendingUploads.value.filter((p) => p !== promise);
    if (!pendingUploads.value.length) uploadingFiles.value = false;
  });
  return promise;
}

async function uploadSingleFile(file, index) {
  const status = fileStatuses.value[index];
  status.status = "uploading";
  status.progress = 0;

  const formData = new FormData();
  formData.append("images", file, file.name);

  try {
    const { data } = await api.post("/nakala/temp-upload", formData, {
      onUploadProgress: (event) => {
        if (event.total) {
          status.progress = Math.round((event.loaded / event.total) * 100);
          computeOverallProgress();
        }
      },
    });

    status.status = "done";
    status.progress = 100;

    // Server returns one entry per file, all sharing the same tempId.
    const entry = Array.isArray(data) && data.length ? data[0] : data;
    if (entry) uploadedFiles.value.push(entry);
  } catch (err) {
    console.error("Temp upload failed:", err);
    status.status = "error";
  } finally {
    computeOverallProgress();
  }
}

function startTempUpload(files) {
  selectedFiles.value = files;
  fileStatuses.value = files.map((file) => ({
    name: file.name,
    size: file.size,
    status: "pending",
    progress: 0,
  }));
  uploadedFiles.value = [];
  computeOverallProgress();

  // Upload each file independently so they can be retried one by one.
  const promises = files.map((file, index) =>
    track(uploadSingleFile(file, index))
  );
  return Promise.allSettled(promises);
}

function retryFile(index) {
  const file = selectedFiles.value[index];
  if (!file) return;
  track(uploadSingleFile(file, index));
}

function resetTempUpload() {
  fileStatuses.value = [];
  uploadedFiles.value = [];
  selectedFiles.value = [];
  pendingUploads.value = [];
  uploadingFiles.value = false;
  uploadProgress.value = 0;
}

function formatKeywords(keywords, lang) {
  const propertyUri = "http://purl.org/dc/terms/subject";
  const uri = "http://purl.org/dc/terms/LCC";

  const formattedKeywords = keywords.map((word) => {
    const type = word.option[1]["@value"];

    const typeUri =
      type === "lcc" || type === "lcsh"
        ? `http://purl.org/dc/terms/${type.toUpperCase()}`
        : uri;

    return {
      // lang,
      propertyUri,
      typeUri: typeUri,
      value: word["@label"],
    };
  });

  return formattedKeywords;
}

const emits = defineEmits(["upload"]);

const upload = async () => {
  // Don't block the button, but let any temp upload still in flight finish
  // before publishing (the publish step relies on the files being on disk).
  if (pendingUploads.value.length) {
    showUploadWaiting.value = true;
    await Promise.allSettled(pendingUploads.value);
    showUploadWaiting.value = false;
  }

  if (!isUpdate.value) return createData();
  else updateData();
};

async function updateData() {
  try {
    const foundData = nakalaStore.getById(props.dataId);

    const currentData = {
      ...foundData,
      metas: formatMetas(assetMetas.value, language.value.id),
      language: language.value.id,
      license: selectedLicense.value,
      title: title.value,
      description: description.value,
      keywords: formatKeywords(keywords.value, language.value.id),
    };

    await nakalaStore.updateFiles(currentData, images.value);
    emits("upload");
  } catch (err) {
    console.log(err);
  }
}

async function createData() {
  try {
    isSubmitting.value = true;

    const data = {
      metas: formatMetas(assetMetas.value, language.value.id),
      license: selectedLicense.value,
      description: description.value,
      language: language.value.id,
      title: title.value,
      keywords: formatKeywords(keywords.value, language.value.id),
    };

    const tempIds = uploadedFiles.value.map((f) => f.tempId);
    await nakalaStore.create(images.value, data, tempIds);

    emits("upload");
    fileField.value.fileRef.clearFiles();
    resetTempUpload();
  } catch (err) {
    if (err.response && err.response.data) {
      error.value = {
        message: formatNakalError(err.response.data),
        type: "error",
      };
    } else {
      error.value = handleError(err);
    }
  } finally {
    isSubmitting.value = false;
  }
}

function formatNakalError(responseErr) {
  const { message, code, payload } = responseErr;

  if (code !== 422) return message;

  const errors = payload.validationErrors;

  if (!errors) return message;

  let lis = "";

  errors.forEach((e) => (lis += `<li>${e}</li>`));

  return `<div>
      <p>${message}</p>
      <ul>
         ${lis}
        </ul>
      </div>
    `;
}

function removeKeyword(index) {
  keywords.value = keywords.value.filter((_, i) => i !== index);
}

function getFile(id) {
  return nakalaStore.getById(id);
}

function handleSelect(value) {
  keywords.value.push(value);
}
</script>

<style scoped>
.temp-upload {
  gap: 0.5rem;
}

.temp-upload__progress {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--owl-surface-border, #e5e7eb);
  overflow: hidden;
}

.temp-upload__bar {
  height: 100%;
  border-radius: 999px;
  background: var(--owl-color-primary, #3b82f6);
  transition: width 0.2s ease;
}

.temp-upload__list {
  gap: 0.25rem;
}

.temp-upload__item {
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
}

.temp-upload__name {
  flex: 1;
  word-break: break-word;
}

.temp-upload__retry {
  flex-shrink: 0;
}

.temp-upload__waiting {
  font-size: 0.875rem;
  opacity: 0.8;
}
</style>
