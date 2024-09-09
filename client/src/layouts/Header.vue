<template>
  <Container tag="header" flow="row-between" stretched :class="{'-accent' : app === 'cnrs2'}">
    <Container flow="row" stretched>
      <Container class="header-title -uppercase" :class="{ 'img-title': app === 'cnrs2' }" flow="row">
        <Link v-if="app === 'cnrs1'" variant="text" class="header-link" path="/">{{ settings?.name }}</Link>
        <RouterLink v-else to="/"><Image src="/cnrs2-logo.jpg" alt="São José" width="150" /></RouterLink>
      </Container>

      <Container class="desktop-nav" tag="nav" flow="row" stretched>
        <Container class="header-nav" tag="ul" flow="row" stretched>
          <Container flow="row" tag="li" stretched>
            <Link variant="text" class="header-link" active-class="-active" path="/" v-t="'header.map'"></Link>
          </Container>
          <Container flow="row" tag="li" stretched>
            <Link variant="text" class="header-link" active-class="-active" path="/more/about" v-t="'header.about'"></Link>
          </Container>
          <Container v-if="app === 'cnrs1'" flow="row" tag="li" stretched>
            <Link variant="text" class="header-link" active-class="-active" path="/more/musicians">Artistes</Link>
          </Container>
          <Container v-if="app === 'cnrs1'" flow="row" tag="li" stretched>
            <Link variant="text" class="header-link" active-class="-active" path="/more/cards">Fiches pédagogiques (test)</Link>
          </Container>
          <Container v-else flow="row" tag="li" stretched>
            <Link variant="text" class="header-link" active-class="-active" path="/more/itineraries">Itineraries</Link>
          </Container>
        </Container>
      </Container>
    </Container>

    <Container class="header-extra desktop-extra" flow="row" stretched>
      <Link path="/intro" variant="text"> {{ app === 'cnrs1' ? 'Bande annonce' : 'Intro' }} </Link>
    </Container>

    <Container class="mobile-menu" flow="row" stretched>
      <Button aria-label="open menu" title="open menu" variant="text" wide @click="emit('toggleMenu')">
        <Icon name="bars" />
      </Button>

      <Container v-if="open" class="mobile-nav" @keyup.escape="emit('toggleMenu')">
        <Container class="header-nav" tag="ul">
          <Container tag="li">
            <Link wide variant="text" class="header-link" active-class="-active" path="/" v-t="'header.map'"></Link>
          </Container>
          <Container tag="li">
            <Link wide variant="text" class="header-link" active-class="-active" path="/more/about" v-t="'header.about'"></Link>
          </Container>
          <Container v-if="app === 'cnrs1'" tag="li">
            <Link wide variant="text" class="header-link" active-class="-active" path="/more/musicians">Artistes</Link>
          </Container>
          <Container v-if="app === 'cnrs1'" tag="li">
            <Link wide variant="text" class="header-link" active-class="-active" path="/more/cards">Fiches pédagogiques</Link>
          </Container>
          <Container v-else tag="li">
            <Link wide variant="text" class="header-link" active-class="-active" path="/more/itineraries">Itineraries</Link>
          </Container>
        </Container>

        <Container class="header-extra" flow="row">
          <Link path="/intro" variant="text"> {{ app === 'cnrs1' ? 'Bande annonce' : 'Intro' }} </Link>
        </Container>
      </Container>
    </Container>
  </Container>
</template>

<script setup>
import { ref, computed } from "vue";
import { Container, Button, Link, Icon, Image } from "@owlabio/owl-ui";
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
:deep(.owl-container) {
  gap: 0;
}

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
