<template>
  <!-- Actions -->
  <div class="map-actions flow-row-between">
    <!-- NARRATION : back to entry points -->
    <el-button v-if="controls.back" class="map-back color-btn" :aria-label="$t('controls.back')" :title="$t('controls.back')" @click="emit('back')" text>
      <i class="fa-solid fa-arrow-left" />
    </el-button>

    <!-- CLASSIC : filters -->
    <div v-if="controls.mode === 'classic'" class="map-filter-zone stretched" @keyup.escape="emit('toggleFilters')">
      <el-button
        class="map-filter-toggle color-btn"
        :aria-label="$t('controls.filters')"
        :title="$t('controls.filters')"
        :class="{ '-active': controls.filters }"
        :aria-pressed="controls.filters"
        @click="emit('toggleFilters')" text>
        <i class="fa-solid fa-filter" />
      </el-button>

      <aside class="map-filters" :class="{ invisible: !controls.filters }">
        <!-- MEDIA FILTER -->
        <div class="map-filter">
          <div class="filter-menu flow-row-between">
            <span class="filter-title" v-t="'controls.titletypes'"></span>
            <el-button
              text
              size="small"
              class="reset-btn"
              :aria-label="$t('controls.buttontypes')"
              :title="$t('controls.buttontypes')"
              :disabled="!filterType.length"
              @click="emit('resetFilter', 'type')">
              <i class="fa-solid fa-arrow-rotate-left" />
            </el-button>
          </div>

          <ul class="filter-list stretched">
            <li v-for="(type, i) in types" :key="`type-${i}`">
              <el-button
                size="small"
                round
                class="w-full filter-btn"
                :class="{ '-active': filterType.includes(type) }"
                :text="!filterType.includes(type)"
                :aria-pressed="filterType.includes(type)"
                @click="emit('filter', 'type', type)">
                <i v-if="type === 'image'" class="fa-regular fa-image" />
                <i v-else :class="getIconName(type)" />
                {{ formatType(type) }}
              </el-button>
            </li>
          </ul>
        </div>

        <!-- MUSICIANS FILTER -->
        <div v-if="app === 'cnrs1'" class="map-filter">
          <div class="filter-menu flow-row-between">
            <span class="filter-title" v-t="'controls.titlemusicians'"></span>
            <el-button
              text
              size="small"
              class="reset-btn"
              :aria-label="$t('controls.buttonmusicians')"
              :title="$t('controls.buttonmusicians')"
              :disabled="!filterMus.length"
              @click="emit('resetFilter', 'mus')">
              <i class="fa-solid fa-arrow-rotate-left" />
            </el-button>
          </div>

          <ul class="filter-list stretched">
            <li v-for="(mus, i) in musicians" :key="`mus-${i}`">
              <el-button
                size="small"
                round
                class="w-full filter-btn"
                :class="{ '-active': filterMus.includes(mus._id) }"
                :text="!filterMus.includes(mus._id)"
                :aria-pressed="filterMus.includes(mus._id)"
                @click="emit('filter', 'mus', mus._id)">
                {{ mus.name }}
              </el-button>
            </li>
          </ul>
        </div>

        <!-- CATEGORY FILTER -->
        <div class="map-filter">
          <div class="filter-menu flow-row-between">
            <span class="filter-title" v-t="'controls.titlecategories'"></span>
            <el-button
              text
              size="small"
              class="reset-btn"
              :aria-label="$t('controls.buttoncategories')"
              :title="$t('controls.buttoncategories')"
              :disabled="!filterCat.length"
              @click="emit('resetFilter', 'cat')">
              <i class="fa-solid fa-arrow-rotate-left" />
            </el-button>
          </div>

          <ul class="filter-list flow-row">
            <li v-for="(cat, i) in categories" :key="`cat-${i}`">
              <el-button
                size="small"
                round
                class="filter-btn"
                :class="{ '-active': filterCat.includes(cat._id) }"
                :text="!filterCat.includes(cat._id)"
                :aria-pressed="filterCat.includes(cat._id)"
                @click="emit('filter', 'cat', cat._id)">
                <template #icon><i :class="getTypeClass(cat.attributes?.icon?.type) + ' fa-' + cat.attributes?.icon?.name" /></template>
                {{ cat.name }}
              </el-button>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- HELP -->
    <el-button class="map-help color-btn" :aria-label="$t('controls.help')" :title="$t('controls.help')" @click="emit('help')" text>
      <i class="fa-solid fa-question" />
    </el-button>

    <!-- TOP ACTIONS -->
    <div class="map-top-actions">
      <!-- MODE TOGGLE -->
      <el-button
        class="map-mode-toggle color-btn"
        :aria-label="controls.mode === 'narration' ? $t('controls.free') : $t('controls.itinerary')"
        :title="controls.mode === 'narration' ? $t('controls.free') : $t('controls.itinerary')"
        @click="emit('toggleMode')" text>
        <i :class="controls.mode === 'narration' ? 'fa-solid fa-location-dot' : 'fa-solid fa-route'" class="fa-shake" />
      </el-button>

      <!-- AUDIO TOGGLE -->
      <div class="map-audio">
        <div class="-signal" :class="{ '-visible': controls.mode === 'narration' && !controls.back && !controls.audio }">
          <i
            :aria-label="$t('controls.soundon')"
            :title="$t('controls.soundon')"
            class="fa-solid fa-arrow-down fa-bounce"
            style="
              --fa-bounce-start-scale-x: 1;
              --fa-bounce-start-scale-y: 1;
              --fa-bounce-jump-scale-x: 1;
              --fa-bounce-jump-scale-y: 1;
              --fa-bounce-land-scale-x: 1;
              --fa-bounce-land-scale-y: 1;
            " />
        </div>
        <el-button
          class="map-audio-toggle color-btn"
          :aria-label="$t('controls.sound')"
          :title="$t('controls.sound')"
          :class="{ '-active': controls.audio }"
          :aria-pressed="controls.audio"
          @click="emit('toggleAudio')" text>
          <i :class="'fa-solid' + ' fa-' + (controls.audio ? app === 'cnrs1' ? 'headphones' : 'volume-high' : app === 'cnrs1' ? 'volume-off' : 'volume-xmark')" />
        </el-button>
      </div>

      <!-- DETECTIVE TOGGLE -->
      <el-button
        v-if="hasDetectiveMode && controls.mode === 'narration' && !controls.back"
        class="map-detective-toggle color-btn"
        :aria-label="$t('controls.accessible')"
        :title="$t('controls.accessible')"
        :class="{ '-active': !controls.isDetective }"
        :aria-pressed="!controls.isDetective"
        @click="emit('toggleDetective')" text>
        <i :class="controls.isDetective ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
      </el-button>
    </div>

    <!-- BOTTOM ACTIONS -->
    <div class="map-bottom-actions">
      <el-button class="color-btn" :aria-label="$t('controls.zoomin')" :title="$t('controls.zoomin')" @click="emit('zoom', 'in')" text>
        <i class="fa-solid fa-plus" />
      </el-button>
      <el-button class="color-btn" :aria-label="$t('controls.zoomout')" :title="$t('controls.zoomout')" @click="emit('zoom', 'out')" text>
        <i class="fa-solid fa-minus" />
      </el-button>
      <el-button class="color-btn" :aria-label="$t('controls.center')" :title="$t('controls.center')" @click="emit('center')" text>
        <i class="fa-solid fa-crosshairs" />
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";
import { useCategoryStore } from "@/stores/categories";

const settingsStore = useStore("settings");
const categoriesStores = useCategoryStore();
const musicianStore = useStore("musician");
const app = computed(() => settingsStore.project);

const emit = defineEmits(["back", "help", "toggleMode", "toggleDetective", "toggleFilters", "resetFilter", "filter", "toggleAudio", "zoom", "center"]);

const props = defineProps({
  controls: Object,
  filterType: Array,
  filterCat: Array,
  filterMus: Array,
  hasDetectiveMode: Boolean,
});

const types = computed(() => ["audio", "video", "image", "text"]);

const categories = computed(() => {
  const bundle = [];

  function extract(cat) {
    cat.children.forEach((child) => {
      bundle.push(child);
      child.children.length && extract(child);
    });
  }

  categoriesStores.categories.forEach((cat) => {
    bundle.push(cat);
    cat.children.length && extract(cat);
  });

  return bundle.filter((c) => c.name !== "fiche pédago");
});

const musicians = computed(() => musicianStore.list);

function formatType(value) {
  const formats = {
    audio: "audio",
    video: "vidéo",
    image: "image",
    text: "texte",
  };

  return app.value === "cnrs1" ? formats[value] : value;
}

function getIconName(type) {
  return type === "audio" ? "fa-solid fa-music" : type === "video" ? "fa-solid fa-film" : type === "image" ? "fa-regular fa-image" : "fa-solid fa-font";
}

function getTypeClass(type) {
  const styles = {
    solid: "fa-solid",
    regular: "fa-regular",
  };

  return styles[type] || "fa-solid";
}

categoriesStores.getRoots();
</script>

<style scoped>
.color-btn:not(.-active),
.map-filters {
  border: var(--app-border, var(--border-1)) solid var(--color-full-accent) !important;
  background-color: var(--color-background-neutral);
  color: inherit !important;
}

.map-audio {
  transform: rotate(-90deg);
  position: relative;
}

.map-audio-toggle {
  transform: rotate(90deg);
}

.-signal {
  position: absolute;
  inset-block-end: calc(100% + var(--size-2));
  inset-inline-start: 50%;
  transform: translateX(-50%) !important;
  color: red;
  font-size: var(--size-12);
  transition: all 1s ease-in-out;
  opacity: 1;
  stroke: black;
  stroke-width: 12;
}

.-signal:not(.-visible) {
  opacity: 0;
}

.color-btn:hover {
  background-color: var(--color-element-neutral);
}

.map-back,
.map-help,
.map-filter-zone,
.map-top-actions,
.map-bottom-actions {
  position: absolute;
  z-index: 2;
}

.map-back,
.map-help,
.map-filter-toggle,
.map-mode-toggle,
.map-detective-toggle,
.map-audio-toggle {
  border-radius: var(--radius-5) !important;
}

.map-top-actions {
  gap: var(--size-2) !important;
}

.map-bottom-actions :first-child {
  border-start-start-radius: var(--radius-5) !important;
  border-start-end-radius: var(--radius-5) !important;
  border-block-end: 0 !important;
}

.map-bottom-actions :last-child {
  border-end-start-radius: var(--radius-5) !important;
  border-end-end-radius: var(--radius-5) !important;
  border-block-start: 0 !important;
}

.map-mode-toggle svg {
  animation-duration: 4s !important;
}

.map-audio-toggle:not(.-active),
.map-detective-toggle:not(.-active) {
  color: var(--color-text-fade) !important;
}

.map-filters {
  width: clamp(200px, 95vw, 380px);
  max-height: 75vh;
  border-inline-end: var(--app-border, var(--border-1)) solid var(--color-full-accent);
  border-block-end: var(--app-border, var(--border-1)) solid var(--color-full-accent);
  overflow-y: auto;
  z-index: 13;
}

.map-filters,
.map-filter {
  gap: 0 !important;
}

.filter-title {
  padding-inline: var(--size-6);
}

.filter-list {
  padding: var(--size-2) !important;
  border-block: var(--app-border, var(--border-1)) solid var(--color-full-accent);
  gap: var(--size-2) !important;
}

.map-filter:last-of-type .filter-list {
  border-block-end: 0;
}

.filter-btn {
  padding: var(--size-1) var(--size-4) !important;
  justify-content: flex-start;
}

@media (max-width: 767px) {
  .color-btn {
    font-size: var(--size-5);
    padding: var(--size-3) !important;
  }

  .map-back,
  .map-filter-zone {
    inset-block-start: var(--size-2);
    inset-inline-start: var(--size-2);
  }

  .map-help {
    inset-block-end: var(--size-2);
    inset-inline-start: var(--size-2);
  }

  .map-top-actions {
    inset-block-start: var(--size-2);
    inset-inline-end: var(--size-2);
  }

  .map-bottom-actions {
    inset-block-end: var(--size-2);
    inset-inline-end: var(--size-2);
  }
}

@media (min-width: 768px) {
  .color-btn {
    font-size: var(--size-6);
    padding: var(--size-4) !important;
  }

  .map-back,
  .map-filter-zone {
    inset-block-start: var(--size-4);
    inset-inline-start: var(--size-4);
  }

  .map-help {
    inset-block-end: var(--size-4);
    inset-inline-start: var(--size-4);
  }

  .map-top-actions {
    inset-block-start: var(--size-4);
    inset-inline-end: var(--size-4);
  }

  .map-bottom-actions {
    inset-block-end: var(--size-4);
    inset-inline-end: var(--size-4);
  }
}
</style>
