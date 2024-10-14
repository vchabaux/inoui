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
    <Button wide class="upload-btn" :pending="isSubmitting" @click="upload">
      {{ isUpdate ? "Save" : "Add to nakala library" }}
    </Button>
  </Container>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { Container, Button, Field, Text } from "@owlabio/owl-ui";
import Voice from "@/components/Voice.vue";
import AssetDetails from "../media/AssetDetails.vue";
import { useStore } from "@/stores";
import AsyncSearch from "@/components/AsyncSearch.vue";
import { handleError } from "@/utils";

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
  let totalSize = 0;

  if (!event.target.files) return;
  for (const file of event.target.files) {
    totalSize += file.size;
  }
/*
  if (totalSize >= 524288000) {
    alert("La taille maximum autorisée est de 500MB");
    event.target.value = "";

    images.value = "";
  }
*/
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

    await nakalaStore.create(images.value, data);

    emits("upload");
    fileField.value.fileRef.clearFiles();
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
