<template>
  <!-- Actions -->
  <Container class="map-actions" flow="row-between">
    <!-- NARRATION : back to entry points -->
    <Button v-if="controls.back" class="map-back color-btn" :aria-label="$t('controls.back')" :title="$t('controls.back')" @click="emit('back')">
      <Icon name="arrow-left" />
    </Button>

    <!-- CLASSIC : filters -->
    <Container v-if="controls.mode === 'classic'" class="map-filter-zone" stretched @keyup.escape="emit('toggleFilters')">
      <Button
        class="map-filter-toggle color-btn"
        :aria-label="$t('controls.filters')"
        :title="$t('controls.filters')"
        :class="{ '-active': controls.filters }"
        :aria-pressed="controls.filters"
        @click="emit('toggleFilters')">
        <Icon name="filter" />
      </Button>

      <Container tag="aside" class="map-filters" :class="{ invisible: !controls.filters }">
        <!-- MEDIA FILTER -->
        <Container class="map-filter">
          <Container class="filter-menu" flow="row-between">
            <Text class="filter-title" v-t="'controls.titletypes'"></Text>
            <Button
              variant="text"
              size="nested"
              class="reset-btn"
              :aria-label="$t('controls.buttontypes')"
              :title="$t('controls.buttontypes')"
              :disabled="!filterType.length"
              @click="emit('resetFilter', 'type')">
              <Icon name="arrow-rotate-left" />
            </Button>
          </Container>

          <Container tag="ul" class="filter-list" stretched>
            <li v-for="(type, i) in types" :key="`type-${i}`">
              <Button
                size="s"
                wide
                pill
                class="filter-btn"
                :class="{ '-active': filterType.includes(type) }"
                :variant="filterType.includes(type) ? 'plain' : 'text'"
                :aria-pressed="filterType.includes(type)"
                @click="emit('filter', 'type', type)">
                <template #start><Icon :type="type === 'image' ? 'far' : null" :name="getIconName(type)" /></template>
                {{ formatType(type) }}
              </Button>
            </li>
          </Container>
        </Container>

        <!-- MUSICIANS FILTER -->
        <Container v-if="app === 'cnrs1'" class="map-filter">
          <Container class="filter-menu" flow="row-between">
            <Text class="filter-title" v-t="'controls.titlemusicians'"></Text>
            <Button
              variant="text"
              size="nested"
              class="reset-btn"
              :aria-label="$t('controls.buttonmusicians')"
              :title="$t('controls.buttonmusicians')"
              :disabled="!filterMus.length"
              @click="emit('resetFilter', 'mus')">
              <Icon name="arrow-rotate-left" />
            </Button>
          </Container>

          <Container tag="ul" class="filter-list" stretched>
            <li v-for="(mus, i) in musicians" :key="`mus-${i}`">
              <Button
                size="s"
                wide
                pill
                class="filter-btn"
                :class="{ '-active': filterMus.includes(mus._id) }"
                :variant="filterMus.includes(mus._id) ? 'plain' : 'text'"
                :aria-pressed="filterMus.includes(mus._id)"
                @click="emit('filter', 'mus', mus._id)">
                {{ mus.name }}
              </Button>
            </li>
          </Container>
        </Container>

        <!-- CATEGORY FILTER -->
        <Container class="map-filter">
          <Container class="filter-menu" flow="row-between">
            <Text class="filter-title" v-t="'controls.titlecategories'"></Text>
            <Button
              variant="text"
              size="nested"
              class="reset-btn"
              :aria-label="$t('controls.buttoncategories')"
              :title="$t('controls.buttoncategories')"
              :disabled="!filterCat.length"
              @click="emit('resetFilter', 'cat')">
              <Icon name="arrow-rotate-left" />
            </Button>
          </Container>

          <Container tag="ul" class="filter-list" flow="row">
            <li v-for="(cat, i) in categories" :key="`cat-${i}`">
              <Button
                size="s"
                pill
                class="filter-btn"
                :class="{ '-active': filterCat.includes(cat._id) }"
                :variant="filterCat.includes(cat._id) ? 'plain' : 'text'"
                :aria-pressed="filterCat.includes(cat._id)"
                @click="emit('filter', 'cat', cat._id)">
                <template v-if="cat.attributes?.icon" #start><Icon :type="getType(type)" :name="cat.attributes?.icon?.name" /></template>
                {{ cat.name }}
              </Button>
            </li>
          </Container>
        </Container>
      </Container>
    </Container>

    <!-- HELP -->
    <Button class="map-help color-btn" :aria-label="$t('controls.help')" :title="$t('controls.help')" @click="emit('help')">
      <Icon name="question" />
    </Button>

    <!-- TOP ACTIONS -->
    <Container class="map-top-actions">
      <!-- MODE TOGGLE -->
      <Button
        class="map-mode-toggle color-btn"
        :aria-label="controls.mode === 'narration' ? $t('controls.free') : $t('controls.itinerary')"
        :title="controls.mode === 'narration' ? $t('controls.free') : $t('controls.itinerary')"
        @click="emit('toggleMode')">
        <Icon :name="controls.mode === 'narration' ? 'location-dot' : 'route'" shake />
      </Button>

      <!-- AUDIO TOGGLE -->
      <div class="map-audio">
        <div class="-signal" :class="{ '-visible': controls.mode === 'narration' && !controls.back && !controls.audio }">
          <Icon
            :aria-label="$t('controls.soundon')"
            :title="$t('controls.soundon')"
            name="arrow-down"
            bounce
            style="
              --fa-bounce-start-scale-x: 1;
              --fa-bounce-start-scale-y: 1;
              --fa-bounce-jump-scale-x: 1;
              --fa-bounce-jump-scale-y: 1;
              --fa-bounce-land-scale-x: 1;
              --fa-bounce-land-scale-y: 1;
            " />
        </div>
        <Button
          class="map-audio-toggle color-btn"
          :aria-label="$t('controls.sound')"
          :title="$t('controls.sound')"
          :class="{ '-active': controls.audio }"
          :aria-pressed="controls.audio"
          @click="emit('toggleAudio')">
          <Icon :type="app === 'cnrs1' ? 'far' : 'fas'" :name="controls.audio ? app === 'cnrs1' ? 'ear' : 'volume-high' : app === 'cnrs1' ? 'ear-deaf' : 'volume-xmark'" />
        </Button>
      </div>

      <!-- DETECTIVE TOGGLE -->
      <Button
        v-if="hasDetectiveMode && controls.mode === 'narration' && !controls.back"
        class="map-detective-toggle color-btn"
        :aria-label="$t('controls.accessible')"
        :title="$t('controls.accessible')"
        :class="{ '-active': !controls.isDetective }"
        :aria-pressed="!controls.isDetective"
        @click="emit('toggleDetective')">
        <Icon :name="controls.isDetective ? 'eye-slash' : 'eye'" />
      </Button>
    </Container>

    <!-- BOTTOM ACTIONS -->
    <div class="map-bottom-actions">
      <Button class="color-btn" :aria-label="$t('controls.zoomin')" :title="$t('controls.zoomin')" @click="emit('zoom', 'in')">
        <Icon name="plus" />
      </Button>
      <Button class="color-btn" :aria-label="$t('controls.zoomout')" :title="$t('controls.zoomout')" @click="emit('zoom', 'out')">
        <Icon name="minus" />
      </Button>
      <Button class="color-btn" :aria-label="$t('controls.center')" :title="$t('controls.center')" @click="emit('center')">
        <Icon name="crosshairs" />
      </Button>
    </div>
  </Container>
</template>

<script setup>
import { computed } from "vue";
import { Container, Button, Text, Icon } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import { useStoreCategory } from "@owlabio/category-manager";

const settingsStore = useStore("settings");
const categoriesStores = useStoreCategory();
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
  return type === "audio" ? "music" : type === "video" ? "film" : type === "image" ? "image" : "font";
}

function getType(value) {
  const styles = {
    solid: "fas",
    regular: "far",
    light: "fal",
    duotone: "fad",
    brand: "fab",
    thin: "fat",
  };

  return styles[value];
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
