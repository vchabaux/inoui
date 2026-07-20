<template>
  <!-- Medias dialog -->
  <el-dialog
    v-if="isMediaLibOpen"
    :model-value="isMediaLibOpen"
    @close="isMediaLibOpen = false"
  >
    <Medias picker @select="addMedia" :mediaType="currentUploadType" />
  </el-dialog>

  <div class="flow-row-between variant-dash-title" style="width: 100%">
    <h1>{{ currentPage?.slug }}</h1>
  </div>

  <div class="page-content">
    <!-- Intro form -->
    <el-form
      v-if="route.params.slug === 'intro'"
      label-position="top"
      @submit.prevent
    >
      <h2>Title screen</h2>

      <div class="intro-media">
        <el-form-item label="video">
          <el-input
            :model-value="page.video.split('/')[page.video.split('/').length - 1]"
            readonly
          />
        </el-form-item>
        <el-button
          aria-label="upload"
          title="upload"
          @click="openLibrary('video')"
        >
          <i class="fa-solid fa-arrow-up-from-bracket" />
        </el-button>
      </div>

      <el-form-item label="title">
        <el-input v-model="page.title" />
      </el-form-item>

      <el-form-item label="sub-title">
        <el-input type="textarea" :rows="3" v-model="page.subtitle" />
      </el-form-item>

      <el-divider v-if="app === 'cnrs2'" />

      <template v-if="app === 'cnrs2'">
        <h2>Text screen</h2>

        <div class="intro-media">
          <el-form-item label="audio">
            <el-input
              :model-value="page.audio.split('/')[page.audio.split('/').length - 1]"
              readonly
            />
          </el-form-item>
          <el-button
            aria-label="upload"
            title="upload"
            @click="openLibrary('audio')"
          >
            <i class="fa-solid fa-arrow-up-from-bracket" />
          </el-button>
        </div>

        <el-form-item
          v-for="slot in textSlots"
          :key="slot"
          :label="`text ${slot > 1 ? '(slide ' + slot + ')' : ''}`"
        >
          <el-input type="textarea" :rows="5" v-model="page.content[slot - 1]" />
        </el-form-item>

        <div class="-centered flow-row">
          <el-button size="small" @click="textSlots++">
            <i class="fa-solid fa-plus" />
          </el-button>
          <el-button size="small" class="danger-btn" @click="textSlots--">
            <i class="fa-solid fa-minus" />
          </el-button>
        </div>
      </template>
    </el-form>

    <!-- Credits form -->
    <el-form
      v-else-if="route.params.slug === 'credits'"
      label-position="top"
      @submit.prevent
    >
      <el-form-item label="Credits content">
        <el-input type="textarea" :rows="15" v-model="page.content" />
      </el-form-item>
      <p class="hint-text">this will be displayed in the website footer</p>
    </el-form>

    <!-- Other pages form -->
    <el-form v-else label-position="top" @submit.prevent>
      <el-form-item label="Page title">
        <el-input v-model="page.title" />
      </el-form-item>
      <el-form-item label="Page content">
        <el-input type="textarea" :rows="15" v-model="page.content" />
      </el-form-item>
    </el-form>

    <div class="flow-row -end save-btn">
      <el-button @click="save">Save changes</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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

  currentUploadType.value === "video"
    ? (page.value.video = value.url)
    : (page.value.audio = value.url);

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

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--size-8);
  max-width: 800px;
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

.hint-text {
  font-size: 0.85em;
  color: var(--el-text-color-secondary);
  margin: -0.5em 0 0;
}
</style>
