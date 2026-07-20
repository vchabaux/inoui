<template>
  <el-form @submit.prevent label-position="top" class="width-s stretched">
    <Voice
      v-if="error"
      :message="error.message"
      :type="error.type"
      :closable="true"
      @close="error = null"
    />

    <el-form-item
      v-for="meta in assetMetas"
      :key="meta.title"
      :label="meta.title"
    >
      <el-input v-model="meta.defaultValue" />
    </el-form-item>

    <el-form-item label="name">
      <el-input v-model="title" />
    </el-form-item>

    <el-form-item label="License">
      <el-select v-model="selectedLicense" placeholder="License" style="width: 100%">
        <el-option
          v-for="lic in licenses"
          :key="lic.code"
          :label="lic.name"
          :value="lic.code"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Description">
      <el-input
        type="textarea"
        :rows="3"
        v-model="description"
      />
    </el-form-item>

    <el-form-item label="Files">
      <input
        ref="fileInputRef"
        type="file"
        multiple
        style="display: none"
        @change="onFileSelect"
      />
      <el-button @click="fileInputRef?.click()" type="default">
        Choose files
      </el-button>
    </el-form-item>

    <!-- TEMP UPLOAD: files are pushed to the server on selection -->
    <div
      v-if="fileStatuses.length"
      class="flow-column temp-upload"
    >
      <div
        v-if="uploadingFiles || uploadProgress > 0"
        class="temp-upload__progress"
      >
        <div
          class="temp-upload__bar"
          :style="{ width: uploadProgress + '%' }"
        />
      </div>

      <ul class="flow-column temp-upload__list">
        <li
          class="flow-row temp-upload__item"
          v-for="(file, i) in fileStatuses"
          :key="file.name + i"
        >
          <i
            v-if="file.status === 'uploading' || file.status === 'pending'"
            class="fa-solid fa-spinner fa-spin"
          />
          <i v-else-if="file.status === 'done'" class="fa-solid fa-check" />
          <i v-else-if="file.status === 'error'" class="fa-solid fa-xmark" />

          <span class="temp-upload__name">{{ file.name }}</span>

          <el-button
            v-if="file.status === 'error'"
            size="small"
            class="temp-upload__retry"
            @click="retryFile(i)"
          >
            Réessayer
          </el-button>
        </li>
      </ul>
    </div>

    <el-checkbox v-model="withAuthor" label="this file has an author" />

    <template v-if="withAuthor">
      <el-form-item label="Author name">
        <el-input v-model="author.name" />
      </el-form-item>
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
    <ul>
      <li class="flow-row" v-for="(word, i) in keywords" :key="i">
        {{ word["@label"] }} <el-button @click="removeKeyword(i)" size="small">X</el-button>
      </li>
    </ul>

    <!-- ASSETS -->
    <AssetDetails
      v-if="isMulti"
      v-for="assetId in assets"
      :key="assetId"
      :file="getFile(assetId)"
    />

    <!-- VALIDATION -->
    <span v-if="showUploadWaiting" class="temp-upload__waiting">
      Upload en cours, veuillez patienter...
    </span>

    <el-button class="w-full upload-btn" :loading="isSubmitting" @click="upload">
      {{ isUpdate ? "Save" : "Add to nakala library" }}
    </el-button>
  </el-form>
</template>

<script setup>
import { ref, computed, watch } from "vue";
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
  assets: {
    type: Array,
    default: null,
  },
});

const nakalaStore = useStore("nakala");
const settingsStore = useStore("settings");

const isUpdate = computed(() => !!props.dataId);

const isSubmitting = ref(false);
const fileInputRef = ref(null);
const withAuthor = ref(false);
const error = ref(null);
const keywords = ref([]);
const assetMetas = ref([]);
const images = ref(null);
// Temp upload state — files are pushed to the server on selection (prompt 2a).
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB per file (configurable)
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

const excludedMetas = [
  "title",
  "created",
  "creator",
  "license",
  "description",
  "type",
  "subject",
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
      typeUri: meta.typeUri,
      propertyUri: meta.propertyUri,
    };
  });
}

function onFileSelect(event) {
  checkUploadSize(event);
}

function checkUploadSize(event) {
  const fileList = event.target.files;
  if (!fileList || !fileList.length) return;

  const files = Array.from(fileList);

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
      propertyUri,
      typeUri: typeUri,
      value: word["@label"],
    };
  });

  return formattedKeywords;
}

const emits = defineEmits(["upload"]);

const upload = async () => {
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
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
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
  background: var(--color-element-neutral, #e5e7eb);
  overflow: hidden;
}

.temp-upload__bar {
  height: 100%;
  border-radius: 999px;
  background: var(--color-full-accent, #3b82f6);
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
