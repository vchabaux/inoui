<template>
  <!-- Medias dialog -->
  <Dialog
    v-if="isMediaLibOpen"
    id="assets"
    :open="isMediaLibOpen"
    modal
    @close="isMediaLibOpen = false"
  >
    <Medias picker @select="addMedia" :mediaType="currentUploadType" />
  </Dialog>

  <Container flow="row-between" variant="dash-title">
    <h1>{{ currentPage?.slug }}</h1>
  </Container>

  <Container width="m" centered>
    <Container
      v-if="route.params.slug === 'intro'"
      tag="form"
      stretched
      @submit.prevent
    >
      <Container stretched>
        <Text tag="h2">Title screen</Text>
        <Container flow="row" class="intro-media">
          <Field
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
            <Icon name="arrow-up-from-bracket" />
          </Button>
        </Container>
        <Field type="text" label="title" v-model="page.title" />
        <Field
          type="textarea"
          :rows="3"
          label="sub-title"
          v-model="page.subtitle"
        />
      </Container>

      <Separator v-if="app === 'cnrs2'" />

      <Container stretched v-if="app === 'cnrs2'">
        <Text tag="h2">Text screen</Text>
        <Container flow="row" class="intro-media">
          <Field
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
            <Icon name="arrow-up-from-bracket" />
          </Button>
        </Container>
        <Field
          v-for="slot in textSlots"
          type="textarea"
          :rows="5"
          :label="`text ${slot > 1 ? '(slide ' + slot + ')' : ''}`"
          v-model="page.content[slot - 1]"
        />

        <Container class="-centered" flow="row">
          <Button variant="outline" size="s" @click="textSlots++"
            ><Icon name="plus"
          /></Button>
          <Button
            class="danger-btn"
            variant="outline"
            size="s"
            @click="textSlots--"
            ><Icon name="minus"
          /></Button>
        </Container>
      </Container>
    </Container>

    <Container
      v-else-if="route.params.slug === 'credits'"
      tag="form"
      stretched
      @submit.prevent
    >
      <Editor
        label="Credits content"
        hint="this will be displayed in the website footer"
        v-model="page.content"
      />
    </Container>

    <Container v-else tag="form" stretched @submit.prevent>
      <Field type="text" label="Page title" v-model="page.title" />
      <Editor
        label="Page content"
        v-model="page.content"
        ref="editorRef"
        mediaManagement="custom"
        @upload="openLibrary"
      />
    </Container>

    <Container flow="row" class="-end save-btn">
      <Button @click="save">Save changes</Button>
    </Container>
  </Container>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Dialog,
  Container,
  Field,
  Editor,
  Button,
  Text,
  Icon,
  Separator,
} from "@owlabio/owl-ui";
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
  /**
   * Instead of having it hardcoded
   * Can extract keys for the editorRef addX functions
   * lowercase and remove the "add" in order to make it dynamic
   * This is assuming editorRef will follow the addX pattern
   */

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
