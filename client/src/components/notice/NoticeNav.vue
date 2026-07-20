<template>
  <div class="notice-nav">
    <div class="notice-prev">
      <el-button v-if="navigation?.prevTrack && app === 'cnrs2'" class="w-full nav-track" text @click="emit('navigate', 'track', navigation?.prevTrack)">
        <i class="fa-solid fa-route" />
        {{ navigation?.prevTrack?.name }}
      </el-button>
      <el-button
        v-if="navigation?.prevPoint"
        class="w-full nav-point"
        text
        @click="emit('navigate', 'point', navigation?.prevPoint)"
        :aria-label="$t('noticenav.prevpoint')"
        :title="$t('noticenav.prevpoint')">
        <i class="fa-solid fa-backward-step" />
      </el-button>
      <el-button
        v-if="navigation?.prevDetour"
        class="w-full nav-detour"
        text
        @click="emit('navigate', 'point', navigation?.prevDetour)"
        :aria-label="$t('noticenav.prevdetour')"
        :title="$t('noticenav.prevdetour')">
        <i class="fa-solid fa-backward" />
      </el-button>
    </div>

    <div class="notice-next">
      <router-link v-if="navigation?.finish && app === 'cnrs2'" class="w-full nav-track link-text" to="/more/about">
        <i class="fa-solid fa-link" />
        {{$t('noticenav.about')}}
      </router-link>
      <el-button class="w-full nav-track" v-if="navigation?.nextTrack && app === 'cnrs2'" text @click="emit('navigate', 'track', navigation?.nextTrack)">
        <i class="fa-solid fa-route" />
        {{ navigation?.nextTrack?.name }}
      </el-button>
      <el-button
        class="w-full nav-point"
        v-if="navigation?.nextPoint"
        text
        @click="emit('navigate', 'point', navigation?.nextPoint)"
        :aria-label="$t('noticenav.nextpoint')"
        :title="$t('noticenav.nextpoint')">
        <i class="fa-solid fa-forward-step" />
      </el-button>
      <el-button
        class="w-full nav-detour"
        v-if="navigation?.nextDetour"
        text
        @click="emit('navigate', 'point', navigation?.nextDetour)"
        :aria-label="$t('noticenav.nextdetour')"
        :title="$t('noticenav.nextdetour')">
        <i class="fa-solid fa-forward" />
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
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

.notice-prev .el-button,
.notice-prev .link-text {
  justify-self: start !important;
  width: max-content;
}

.notice-next .el-button,
.notice-next .link-text {
  justify-self: end !important;
  width: max-content;
}
</style>
