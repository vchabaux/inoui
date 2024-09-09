<template>
  <Container class="notice-nav">
    <Container class="notice-prev">
      <Button v-if="navigation?.prevTrack && app === 'cnrs2'" wide class="nav-track" variant="text" @click="emit('navigate', 'track', navigation?.prevTrack)">
        <template #start><Icon name="route" /></template>
        {{ navigation?.prevTrack?.name }}
      </Button>
      <Button
        v-if="navigation?.prevPoint"
        wide
        class="nav-point"
        variant="text"
        @click="emit('navigate', 'point', navigation?.prevPoint)"
        :aria-label="$t('noticenav.prevpoint')"
        :title="$t('noticenav.prevpoint')">
        <Icon name="backward-step" />
      </Button>
      <Button
        v-if="navigation?.prevDetour"
        wide
        class="nav-detour"
        variant="text"
        @click="emit('navigate', 'point', navigation?.prevDetour)"
        :aria-label="$t('noticenav.prevdetour')"
        :title="$t('noticenav.prevdetour')">
        <Icon name="backward" />
      </Button>
    </Container>

    <Container class="notice-next">
      <Link wide v-if="navigation?.finish && app === 'cnrs2'" class="nav-track" variant="text" path="/more/about">
        <template #end><Icon name="link" /></template>
        {{$t('noticenav.about')}}
      </Link>
      <Button wide v-if="navigation?.nextTrack && app === 'cnrs2'" class="nav-track" variant="text" @click="emit('navigate', 'track', navigation?.nextTrack)">
        <template #end><Icon name="route" /></template>
        {{ navigation?.nextTrack?.name }}
      </Button>
      <Button
        wide
        v-if="navigation?.nextPoint"
        class="nav-point"
        variant="text"
        @click="emit('navigate', 'point', navigation?.nextPoint)"
        :aria-label="$t('noticenav.nextpoint')"
        :title="$t('noticenav.nextpoint')"
        point>
        <Icon name="forward-step" />
      </Button>
      <Button
        wide
        v-if="navigation?.nextDetour"
        class="nav-detour"
        variant="text"
        @click="emit('navigate', 'point', navigation?.nextDetour)"
        :aria-label="$t('noticenav.nextdetour')"
        :title="$t('noticenav.nextdetour')">
        <Icon name="forward" />
      </Button>
    </Container>
  </Container>
</template>

<script setup>
import { computed } from "vue";
import { Container, Text, Button, Link, Icon } from "@owlabio/owl-ui";
import { useStore } from "@/stores";

const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);

const emit = defineEmits(["navigate"]);

const props = defineProps({
  navigation: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.notice-nav {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  font-family: var(--app-font-title);
}

.notice-prev,
.notice-next {
  display: grid !important;
  grid-template-rows: 1fr 1fr;
  gap: var(--size-1) !important;
}

.nav-point {
  border: var(--app-border, var(--border-1)) solid var(--color-full-accent) !important;
}

.nav-detour {
  border: var(--app-border, var(--border-1)) dashed var(--color-full-accent) !important;
}

.notice-prev :deep(.owl-button),
.notice-prev :deep(.owl-link) {
  justify-self: start !important;
  width: max-content;
}

.notice-next :deep(.owl-button),
.notice-next :deep(.owl-link) {
  justify-self: end !important;
  width: max-content;
}
</style>
