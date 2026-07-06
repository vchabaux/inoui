<template>
  <header class="flow-row-between stretched" :class="{'-accent' : app === 'cnrs2'}">
    <div class="flow-row stretched">
      <div class="header-title -uppercase flow-row" :class="{ 'img-title': app === 'cnrs2' }">
        <router-link v-if="app === 'cnrs1'" class="header-link link-text" to="/">{{ settings?.name }}</router-link>
        <router-link v-else to="/"><img src="/cnrs2-logo.jpg" alt="São José" width="150" /></router-link>
      </div>

      <nav class="desktop-nav flow-row stretched">
        <ul class="header-nav flow-row stretched">
          <li class="flow-row stretched">
            <router-link class="header-link link-text" active-class="-active" to="/" v-t="'header.map'"></router-link>
          </li>
          <li class="flow-row stretched">
            <router-link class="header-link link-text" active-class="-active" to="/more/about" v-t="'header.about'"></router-link>
          </li>
          <li v-if="app === 'cnrs1'" class="flow-row stretched">
            <router-link class="header-link link-text" active-class="-active" to="/more/musicians">Artistes</router-link>
          </li>
          <li v-if="app === 'cnrs1'" class="flow-row stretched">
            <router-link class="header-link link-text" active-class="-active" to="/more/cards">Fiches pédagogiques</router-link>
          </li>
          <li v-else class="flow-row stretched">
            <router-link class="header-link link-text" active-class="-active" to="/more/itineraries">Itineraries</router-link>
          </li>
        </ul>
      </nav>
    </div>

    <div class="header-extra desktop-extra flow-row stretched">
      <router-link to="/intro" class="link-text"> {{ app === 'cnrs1' ? 'Bande annonce' : 'Intro' }} </router-link>
    </div>

    <div class="mobile-menu flow-row stretched">
      <Button aria-label="open menu" title="open menu" text class="w-full" @click="emit('toggleMenu')">
        <i class="fa-solid fa-bars" />
      </Button>

      <div v-if="open" class="mobile-nav" @keyup.escape="emit('toggleMenu')">
        <ul class="header-nav">
          <li>
            <router-link class="w-full header-link link-text" active-class="-active" to="/" v-t="'header.map'"></router-link>
          </li>
          <li>
            <router-link class="w-full header-link link-text" active-class="-active" to="/more/about" v-t="'header.about'"></router-link>
          </li>
          <li v-if="app === 'cnrs1'">
            <router-link class="w-full header-link link-text" active-class="-active" to="/more/musicians">Artistes</router-link>
          </li>
          <li v-if="app === 'cnrs1'">
            <router-link class="w-full header-link link-text" active-class="-active" to="/more/cards">Fiches pédagogiques</router-link>
          </li>
          <li v-else>
            <router-link class="w-full header-link link-text" active-class="-active" to="/more/itineraries">Itineraries</router-link>
          </li>
        </ul>

        <div class="header-extra flow-row">
          <router-link to="/intro" class="link-text"> {{ app === 'cnrs1' ? 'Bande annonce' : 'Intro' }} </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import Button from "primevue/button";
import { useStore } from "@/stores";

const settingsStore = useStore("settings");
const settings = computed(() => settingsStore.settings);
const app = computed(() => settingsStore.project);
const locales = computed(() => settings.value?.langs.public);
const publicLang = ref(settingsStore.publicLang);

const emit = defineEmits(["toggleMenu"]);

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

function setPublicLang(lang) {
  settingsStore.setPublicLang(lang);
  publicLang.value = lang;
}
</script>

<style scoped>
.-accent {
  font-family: var(--app-font-title);
}

.-uppercase {
  text-transform: uppercase;
}

.img-title {
  padding-inline: var(--size-4);
  background-color: var(--color-full-accent);
  filter: invert();
}

.desktop-nav {
  border-inline-start: var(--app-border, var(--border-1)) solid var(--color-full-accent);
}

.desktop-nav .header-extra:not(:empty) {
  border-inline-start: var(--app-border, var(--border-1)) solid var(--color-full-accent);
}

.mobile-menu {
  position: relative;
  border-inline-start: var(--app-border, var(--border-1)) solid var(--color-full-accent);
}

.mobile-menu > button {
  padding-inline: var(--size-6);
  justify-content: end;
}

.mobile-nav {
  position: absolute;
  inset-block-start: 100%;
  inset-inline-end: 0;
  width: 100vw;
  z-index: 11;
  border-block: var(--app-border, var(--border-1)) solid var(--color-full-accent);
  background-color: var(--color-background-neutral);
  gap: var(--size-4);
}

.header-extra {
  justify-content: center;
}

@media (max-width: 767px) {
  .header-title {
    font-size: var(--size-6);
  }

  .desktop-nav,
  .desktop-extra {
    display: none;
  }

  .header-extra {
    border-block-end: var(--app-border, var(--border-1)) solid var(--color-full-accent);
  }
}

@media (min-width: 768px) {
  .header-title {
    font-size: var(--size-8);
  }

  .mobile-menu {
    display: none;
  }
}
</style>
