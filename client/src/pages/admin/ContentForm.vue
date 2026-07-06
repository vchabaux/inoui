<template>
  <!-- Medias dialog -->
  <Dialog
    v-if="isMediaLibOpen"
    v-model:visible="isMediaLibOpen"
    modal
    @hide="isMediaLibOpen = false"
  >
    <Medias picker @select="addMedia" :mediaType="currentUploadType" />
  </Dialog>

  <div class="flow-row-between variant-dash-title">
    <h1>{{ currentPage?.slug }}</h1>
  </div>

  <div class="width-m centered">
    <div
      v-if="route.params.slug === 'intro'"
      tag="form"
      class="stretched"
      @submit.prevent
    >
      <div class="stretched">
        <h2>Title screen</h2>
        <div class="flow-row intro-media">
          <InputText
            type="text"
            label="video"
            readonly
            v-model="page.video.split('/')[page.video.split('/').length - 1]"
          />
          <Button
            aria-label="upload"
            title="upload"
            @click="openLibrary('video')"
          >
            <i class="fa-solid fa-arrow-up-from-bracket" />
          </Button>
        </div>
        <InputText type="text" label="title" v-model="page.title" />
        <Textarea
          :rows="3"
          label="sub-title"
          v-model="page.subtitle"
        />
      </div>

      <Divider v-if="app === 'cnrs2'" />

      <div class="stretched" v-if="app === 'cnrs2'">
        <h2>Text screen</h2>
        <div class="flow-row intro-media">
          <InputText
            type="text"
            label="audio"
            readonly
            v-model="page.audio.split('/')[page.audio.split('/').length - 1]"
          />
          <Button
            aria-label="upload"
            title="upload"
            @click="openLibrary('audio')"
          >
            <i class="fa-solid fa-arrow-up-from-bracket" />
          </Button>
        </div>
        <Textarea
          v-for="slot in textSlots"
          :rows="5"
          :label="`text ${slot > 1 ? '(slide ' + slot + ')' : ''}`"
          v-model="page.content[slot - 1]"
        />

        <div class="-centered flow-row">
          <Button outlined size="small" @click="textSlots++"
            ><i class="fa-solid fa-plus"
          /></Button>
          <Button
            class="danger-btn"
            outlined
            size="small"
            @click="textSlots--"
            ><i class="fa-solid fa-minus"
          /></Button>
        </div>
      </div>
    </div>

    <div
      v-else-if="route.params.slug === 'credits'"
      tag="form"
      class="stretched"
      @submit.prevent
    >
      <Editor
        v-model="page.content"
      />
    </div>

    <div v-else tag="form" class="stretched" @submit.prevent>
      <InputText type="text" label="Page title" v-model="page.title" />
      <Editor
        v-model="page.content"
        ref="editorRef"
      />
    </div>

    <div class="flow-row -end save-btn">
      <Button @click="save">Save changes</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Editor from "primevue/editor";
import Button from "primevue/button";
import Divider from "primevue/divider";
import Medias from "@/pages/admin/Medias.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores";

const route = useRoute();
const router = useRouter();

const pageStore = useStore("page");
const settingsStore = useStore("settings");

const app = computed(() => settingsStore.project);
const isMediaLibOpen = ref(false);
const currentUploadType = ref(null);
const editorRef = ref(null);

const currentPage = computed(() =>
  pageStore.list.find((page) => page.slug === route.params.slug)
);

const page = ref({
  title: currentPage.value.title || "",
  subtitle: currentPage.value.subtitle || "",
  content:
    currentPage.value.content ||
    (currentPage.value?.slug === "intro" ? [""] : ""),
  video: currentPage.value.video || "",
  audio: currentPage.value.audio || "",
});

const textSlots = ref(page.value?.content?.length);

const openLibrary = (type) => {
  currentUploadType.value = type;
  isMediaLibOpen.value = true;
};

function addMedia(value) {
  const addFunctions = {
    image: "addImage",
    video: "addVideo",
    audio: "addAudio",
  };

  const addFunctionName = addFunctions[currentUploadType.value];

  if (editorRef.value) {
    editorRef.value[addFunctionName](value.url);
  } else {
    currentUploadType.value === "video"
      ? (page.value.video = value.url)
      : (page.value.audio = value.url);
  }

  isMediaLibOpen.value = false;
  currentUploadType.value = null;
}

function save() {
  pageStore.update(currentPage.value._id, page.value);
  router.push("/admin/content");
}
</script>

<style scoped>
h1 {
  text-transform: capitalize;
}

form {
  gap: var(--size-8) !important;
}

.intro-media {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-end;
}

.-centered {
  width: max-content;
  margin-inline: auto;
}

.save-btn {
  margin-block-start: var(--size-4);
}
</style>
