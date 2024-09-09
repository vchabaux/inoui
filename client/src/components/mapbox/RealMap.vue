<template>
  <div ref="myMap" id="map"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const emits = defineEmits(["loaded"]);

const props = defineProps({
  zoom: {
    type: Number,
    default: 13,
  },
  mapStyle: {
    type: String,
    default: "mapbox://styles/mapbox/streets-v11",
  },
  center: {
    type: Array,
    default: [2.2153, 48.8924], // Nanterre
  },
});

const myMap = ref(null);

onMounted(() => {
  const map = new mapboxgl.Map({
    container: myMap.value,
    style: props.mapStyle,
    center: props.center, // starting position [lng, lat]
    zoom: props.zoom,
    // maxZoom: 19,
    // minZoom: 16,
  });

  emits("loaded", map);
});
</script>
