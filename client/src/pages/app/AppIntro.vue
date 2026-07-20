<template>
  <AppSplash v-if="isSplash" @complete="isSplash = false" />

  <template v-else>
    <div v-if="step === 'title'" class="intro-container">
      <video class="title-video" autoplay loop muted playsinline :src="content?.video" aria-hidden="true" />
      <h1 class="-first content" v-html="content.title"></h1>
      <h2 class="-second content" v-html="content.subtitle"></h2>

      <el-button text :aria-label="$t('intro.next')" :title="$t('intro.next')" class="-third content intro-btn" @click="goForward">
        <i class="fa-solid fa-forward"></i>
      </el-button>
    </div>

    <div v-else-if="app === 'cnrs2'" class="intro-container text-container">
      <audio v-if="hasAudio" autoplay :src="content?.audio" />
      <h1 class="-first content invisible" v-html="content.title"></h1>

      <div class="buttons flow-row-between width-l centered stretched">
        <el-button :disabled="currentIndex === 0" text :aria-label="$t('intro.previous')" :title="$t('intro.previous')" class="content -second intro-btn" @click="goBackward">
          <i class="fa-solid fa-backward"></i>
        </el-button>
        <el-button
          text
          :aria-label="$t('intro.audio')"
          :title="$t('intro.audio')"
          class="content intro-btn"
          :aria-pressed="hasAudio"
          @click="hasAudio = !hasAudio">
          <i :class="hasAudio ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'"></i>
        </el-button>
        <el-button text :aria-label="$t('intro.next')" :title="$t('intro.next')" class="content -second intro-btn" @click="goForward">
          <i class="fa-solid fa-forward"></i>
        </el-button>
      </div>

      <p class="-first content text-content text-inverted text-center" v-html="content?.content?.[currentIndex]"></p>
    </div>
  </template>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/stores";
import AppSplash from "@/pages/app/AppSplash.vue";

const router = useRouter();
const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);
const isSplash = ref(app.value === "cnrs1");

const step = ref("title");
const hasAudio = ref(false);

const pageStore = useStore("page");
const pages = computed(() => pageStore.list);
const content = computed(() => pages.value.find((p) => p.slug === "intro"));
const currentIndex = ref(0);

function goBackward() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}

function goForward() {
  if (app.value === 'cnrs2' && step.value === "title") {
    step.value = "text";
  } else {
    if (app.value === 'cnrs2' && currentIndex.value < content.value.content.length - 1) {
      currentIndex.value++;
    } else {
      router.push("/");
      window.localStorage.setItem("hasOnboarded", "true");
    }
  }
}
</script>

<style scoped>
.intro-container {
  display: grid;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #111111;
}

.title-video {
  position: absolute;
  inset: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.content {
  padding: var(--size-1) var(--size-4);
  background-color: rgba(17, 17, 17, 0.75);
  max-width: 65ch;
  margin-inline: auto;
  color: #e5e5e5 !important;
}

.intro-container:not(.text-container) {
  align-content: center;
}

.text-container {
  grid-template-rows: auto 1fr;
  overflow-y: auto;
  white-space: pre-wrap;
}

.buttons {
  position: sticky;
  inset-block-start: 0;
  background-color: #111111;
  z-index: 2;
  padding-block-end: var(--size-4);
  width: min(90ch, 100vw) !important;
}

.intro-btn {
  margin-block-start: var(--size-8);
  font-size: var(--size-6);
  color: inherit;
}

/* Fade in */

.title-video,
.content {
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
}

.-first {
  animation-delay: 2s;
}

.-second {
  animation-delay: 4s;
}

.-third {
  animation-delay: 5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
