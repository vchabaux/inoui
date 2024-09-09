<template>
  <Container class="map-container">
    <Container class="map-layer" tag="aside" aria-label="map side panel" variant="surface">
      <slot name="layer"></slot>
    </Container>

    <div class="map-map">
      <RealMap :mapStyle="mapStyle" :center="center" :zoom="zoom" class="map-object" @loaded="handleMapLoad" />
      <!-- <div id="map" class="map-object"></div> -->
      <slot></slot>
    </div>
  </Container>
</template>

<script setup>
import { provide, watch, shallowRef, ref } from "vue";
import { Container } from "@owlabio/owl-ui";
import RealMap from "./RealMap.vue";

const props = defineProps({
  zoom: {
    type: Number,
    default: 12,
  },
  mapStyle: {
    type: String,
    default: "mapbox://styles/mapbox/streets-v11",
  },
  mousemove: {
    type: Function,
  },
  center: {
    type: Array,
    default: [2.2153, 48.8924], // Nanterre
  },
});

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN;

const emits = defineEmits(["click", "loaded", "mousemove", "drag"]);

const mapRef = shallowRef(null);
const markers = ref([]);
const layers = ref([]);
const sources = ref([]);
const mapLoaded = ref(false);

provide("map", mapRef);
provide("layers", layers);
provide("sources", sources);
provide("markers", markers);

function handleMapLoad(map) {
  mapRef.value = map;
  mapRef.value.on("click", (event) => {
    /**
     * Only respond to the event of a map click.
     * Otherwise clicking on markers will trigger a map click event.
     * Tried event.stopPropagation() on the marker but the actual marker click event
     * comes from a map click event (so after the map was clicked)
     */
    if (event.originalEvent.target !== mapRef.value.getCanvas()) return;
    else {
      emits("click", event);
    }
  });

  mapRef.value.on("mousemove", function (e) {
    emits("mousemove", e);
  });

  mapRef.value.on("drag", function (e) {
    emits("drag", e);
  });

  mapRef.value.on("load", () => {
    mapLoaded.value = true;
    emits("loaded", mapLoaded.value, mapRef.value);
  });

  mapRef.value.on("styledata", () => {});
}

watch(
  () => props.center,
  (currentCenter, prevCenter) => {
    mapRef.value.flyTo({
      center: currentCenter,
    });
  }
);

watch(
  () => props.zoom,
  (currentZoom, prevZoom) => {
    mapRef.value.flyTo({
      zoom: currentZoom,
    });
  }
);

watch(
  () => props.mapStyle,
  () => {
    mapRef.value.setStyle(props.mapStyle);
    mapRef.value.triggerRepaint();
  }
);

// watchEffect(() => {
//   if (!mapRef.value) return;

//   mapRef.value.flyTo({
//     center: props.center
//   });
// })
</script>

<style scoped>
.map-container {
  display: grid !important;
  grid-template-columns: max(35%, 30ch) 1fr !important;
  gap: 0 !important;
  border: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  border-radius: var(--app-radius, var(--radius-2));
  max-height: 95vh;
  overflow: hidden;
}

.map-layer:empty {
  padding: 0;
  border: 0;
}

.map-layer:not(:empty) {
  padding: var(--size-4);
  box-shadow: var(--box-shadow-5);
  border-radius: 0;
  border-block: 0;
  border-inline-start: 0;
  height: 100%;
  overflow-y: auto;
  z-index: 2;
}

.map-map {
  width: 100%;
  overflow: hidden;
  position: relative;
  height: max(85vh, 100%);
}

.map-object {
  width: 100%;
  height: 100%;
}
</style>
