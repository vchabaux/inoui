import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "@/api/axios";
import { useStore } from "@/stores";
import axios from "axios";

const suggestionEndPoint = "https://api.isidore.science/vocabulary/suggest";

const vocabulariesEndPoints = [
  "licenses",
  "datatypes",
  "properties",
  "metadatatypes",
  // "languages",
];

function getKeywords(metas) {
  return metas.filter(
    (m) => m.propertyUri === "http://purl.org/dc/terms/subject"
  );
}

function formatTags(keywords) {
  return keywords.map((w) => w.value);
}

function formatDatas(datas) {
  return datas.map((data) => ({
    ...data,
    name: data.metas[0].value,
    files: formatDataFiles(data),
  }));
}

function formatDataFiles(data) {
  return data.files.map((file) => formatSingleAsset(data, file));
}

export function formatSingleAsset(data, file) {
  // Creation date: API system field, falling back to the required `terms#created` meta
  const created =
    data.created ??
    data.metas?.find(
      (m) => m.propertyUri === "http://nakala.fr/terms#created"
    )?.value;

  return {
    _id: file.sha1,
    metas: data.metas,
    keywords: getKeywords(data.metas),
    tags: formatTags(getKeywords(data.metas)),
    identifier: data.identifier,
    mimetype: file.mime_type,
    mediaType:
      file.extension === "mp3" || file.extension === "mp4"
        ? "audio"
        : file.mime_type.split("/")[0],
    originalname: file.name,
    url: `${import.meta.env.VITE_NAKALA_API_BASE || "https://api.nakala.fr"}/data/${data.identifier}/${file.sha1}`,
    created,
    ...file,
  };
}

export const useNakalaStore = defineStore("nakala", () => {
  const collection = ref(null);
  const datas = ref([]);
  const loaded = ref(false);
  const loading = ref(true);
  const vocabLoaded = ref(false);

  // ── Async publish state (prompt 2b async) ─────────────────────
  const publishStatus = ref("idle"); // idle|uploading|hashing|creating|done|error
  const publishPhase = ref(null);
  const publishProgress = ref(null); // 0-100 or null
  const publishMessage = ref(null);
  const publishError = ref(null);
  const publishJobId = ref(null);

  const vocabularies = ref({
    languages: [
      { id: "fr", label: "French" },
      { id: "en", label: "English" },
      { id: "de", label: "German" },
    ],
  });

  const settings = computed(() => {
    const settingsStore = useStore("settings");
    return settingsStore.settings;
  });

  const assets = computed(() => {
    return datas.value.reduce((acc, currentValue) => {
      return [...acc, ...currentValue.files];
    }, []);
  });

  function getLicense(code) {
    return vocabularies.value.licenses.find((l) => {
      return l.code === code;
    });
  }

  async function initVocabularies() {
    try {
      const promises = vocabulariesEndPoints.map(async (resource) => {
        const { data } = await api.get(
          `/nakala/vocabularies/${resource}?limit=100`
        );
        vocabularies.value[resource] = data;
      });

      await Promise.all(promises);
    } catch (err) {
      console.error(err);
    } finally {
      vocabLoaded.value = true;
    }
  }

  async function upload(files) {
    try {
      const formData = new FormData();

      files.forEach((f) =>
        formData.append("images", f, f.name || "Humanum Logo")
      );

      const { data } = await api.post("/nakala/datas/uploads", formData);

      return data;
    } catch (err) {
      console.error(err);
    }
  }

  function format(postData) {
    const { title, description, language, metas, license, keywords, ...rest } =
      postData;

    console.log(title);
    console.log(postData);

    return {
      ...rest,
      metas: [
        // REQUIRED -  TITLE
        {
          value: title,
          lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#string",
          propertyUri: "http://nakala.fr/terms#title",
        },
        // REQUIRED - LICENSE
        {
          // value: "CC-BY-4.0", // LICENSE CODE AND NOT URL
          value: typeof license === "string" ? license : license?.code,
          //lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#string", // ?? Default
          propertyUri: "http://nakala.fr/terms#license",
        },
        // REQUIRED - TYPE Required for Medias
        {
          value: "http://purl.org/coar/resource_type/c_c513",
          //lang: language, // defaults France
          typeUri: "http://www.w3.org/2001/XMLSchema#anyURI",
          propertyUri: "http://nakala.fr/terms#type",
        },
        // REQUIRED - CREATOR
        {
          value: null,
          lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#Name",
          propertyUri: "http://nakala.fr/terms#creator",
        },
        // CREATED
        {
          value: null,
          //lang: language,
          typeUri: null,
          propertyUri: "http://nakala.fr/terms#created",
        },
        // Recommended, description
        {
          value: description,
          lang: language,
          typeUri: "http://www.w3.org/2001/XMLSchema#string",
          propertyUri: "http://purl.org/dc/terms/description",
        },
        ...metas, // Rest comes from form
        ...keywords, // Keywords
      ],
    };
  }

  async function create(files, postData, tempIds = []) {
    const settingsStore = useStore("settings");
    const collectionID = settingsStore.settings.nakala.collection;

    const {
      title,
      description,
      language,
      license,
      metas,
      keywords = [],
    } = postData;

    // ── TUS publish path (prompt 2b async): files already on server via temp-upload ──
    if (tempIds && tempIds.length > 0) {
      // Reset publish state
      publishStatus.value = "uploading";
      publishPhase.value = null;
      publishProgress.value = null;
      publishError.value = null;
      publishJobId.value = null;

      const { data } = await api.post("/nakala/publish", {
        tempIds,
        collectionId: collectionID,
        title,
        description,
        language,
        license,
        metas,
        keywords,
      });

      const jobId = data.jobId;
      publishJobId.value = jobId;

      // Wrap the EventSource in a Promise: resolves on done, rejects on error
      return new Promise((resolve, reject) => {
        const es = new EventSource("/api/nakala/publish/" + jobId + "/stream");

        es.addEventListener("progress", (event) => {
          const payload = JSON.parse(event.data);
          publishPhase.value = payload.phase;
          if (payload.percent != null) {
            publishProgress.value = payload.percent;
          }
          publishStatus.value = payload.phase; // uploading|hashing|creating
        });

        es.addEventListener("done", async (event) => {
          es.close();
          publishStatus.value = "done";
          await getAll();
          resolve(data);
        });

        es.addEventListener("error", (event) => {
          // Only handle server-sent error events (with data), not connection errors
          if (event.data) {
            es.close();
            const payload = JSON.parse(event.data);
            publishStatus.value = "error";
            publishError.value = payload.message;
            reject(new Error(payload.message));
          }
          // Ignore connection errors: the server closes the stream after
          // done/error, which triggers a transient EventSource error.
        });
      });
    }

    // ── Legacy path: upload files then create data ──────────────────────────
    const status = "published";
    const authors = null;

    const uploadedFiles = await upload(files);

    try {
      const data = {
        files: uploadedFiles.map((f) => {
          const { title, ...rest } = f;
          rest.description = description;
          return rest;
        }),
        status,
        collectionIds: [collectionID],

        metas: [
          // REQUIRED -  TITLE
          {
            value: title,
            lang: language,
            typeUri: "http://www.w3.org/2001/XMLSchema#string",
            propertyUri: "http://nakala.fr/terms#title",
          },
          // REQUIRED - LICENSE
          {
            value: typeof license === "string" ? license : license?.code,
            typeUri: "http://www.w3.org/2001/XMLSchema#string",
            propertyUri: "http://nakala.fr/terms#license",
          },
          // REQUIRED - TYPE Required for Medias
          {
            value: "http://purl.org/coar/resource_type/c_c513",
            typeUri: "http://www.w3.org/2001/XMLSchema#anyURI",
            propertyUri: "http://nakala.fr/terms#type",
          },
          // REQUIRED - CREATOR
          {
            value: null,
            lang: language,
            typeUri: "http://www.w3.org/2001/XMLSchema#Name",
            propertyUri: "http://nakala.fr/terms#creator",
          },
          // CREATED
          {
            value: null,
            typeUri: null,
            propertyUri: "http://nakala.fr/terms#created",
          },
          // Recommended, description
          {
            value: description,
            lang: language,
            typeUri: "http://www.w3.org/2001/XMLSchema#string",
            propertyUri: "http://purl.org/dc/terms/description",
          },
          ...metas, // Rest comes from form
          ...keywords, // Keywords
        ],
      };

      const dataResponse = await api.post("/nakala/datas", data);

      const datas = [dataResponse.data.payload.id];

      const collectionResponse = await api.post(
        `/nakala/collections/${collectionID}/datas`,
        datas // Post as array, not as object
      );

      await getAll();
      return collectionResponse.data;
    } catch (err) {
      /**
       * Remove the images that are in the pending space
       */
      const promises =
        uploadedFiles &&
        uploadedFiles.map((f) => {
          return api.delete(`/nakala/datas/uploads/${f.sha1}`);
        });

      await Promise.all(promises);

      throw err;
    }
  }

  async function getAll() {
    const collectionId = settings.value.nakala.collection;

    const limit = 20;
    const url = `/nakala/collections/${collectionId}/datas?limit=${limit}`;

    let allDatas = [];

    const { data } = await api.get(url);

    allDatas = [...allDatas, ...data.data];

    let currentPage = data.currentPage;
    let lastPage = data.lastPage;

    while (currentPage < lastPage) {
      currentPage++;
      const newUrl = `/nakala/collections/${collectionId}/datas?page=${currentPage}&limit=${limit}`;
      const { data: newData } = await api.get(newUrl);
      allDatas = [...allDatas, ...newData.data];
    }
    datas.value = formatDatas(allDatas).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async function initialize() {
    if (loaded.value) return;
    loaded.value = true;
    await getAll();
    loading.value = false;
  }

  async function refresh() {
    await getAll();
  }

  function getById(identifier) {
    return datas.value.find((data) => data.identifier === identifier);
  }

  async function updateFiles(data, newFiles = []) {
    try {
      const uploadedFiles = newFiles ? await upload(newFiles) : [];

      const formattedData = format(data);
      console.log("this is data", data);

      const dataToSend = {
        ...formattedData,
        files: [
          ...data.files.map((f) => {
            return {
              description: f.description,
              sha1: f.sha1,
              name: f.name,
            };
          }),
          ...uploadedFiles.map((f) => {
            return {
              ...f,
              description: formattedData.description,
            };
          }),
        ],
      };

      await api.put(`/nakala/datas/${data.identifier}`, dataToSend);

      await getAll();
    } catch (err) {
      throw err;
    }
  }

  async function deleteFile(data, filesha1) {
    try {
      if (data.files.length === 1) {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_URL}/static/humanum.png`,
          { responseType: "blob" }
        );

        const uploadedFiles = await upload([response.data]);

        const dataToSend = {
          ...data,
          files: uploadedFiles,
        };

        await api.put(`/nakala/datas/${data.identifier}`, dataToSend);
      } else {
        console.log("In delete");
        await api.delete(`/nakala/datas/${data.identifier}/files/${filesha1}`);
      }
      await getAll();
    } catch (err) {
      throw err;
    }
  }

  return {
    collection,
    loading,
    assets,
    vocabularies,
    vocabLoaded,
    datas,

    // Async publish state
    publishStatus,
    publishPhase,
    publishProgress,
    publishMessage,
    publishError,
    publishJobId,

    getLicense,
    initialize,
    refresh,
    create,
    getById,
    deleteFile,
    initVocabularies,
    updateFiles,
  };
});
