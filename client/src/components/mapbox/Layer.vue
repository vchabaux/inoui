<template></template>

<script setup>
import { inject, onUnmounted, watchEffect } from "vue";

const mapRef = inject("map"); // MapBoxGL object to attach to

const props = defineProps({
  points: {
    type: Array,
    default: [],
  }, //Maybe set point label over here instead of just having coordinates
  sourceName: {
    type: String,
    default: "",
  },
  mapLoaded: {
    type: Boolean,
    default: false,
  },
});

watchEffect(
  () => {
    // Instead of destroying the source and the layer in the watch effect, update the current source via sourceName

    if (!props.mapLoaded || !mapRef.value || !props.points.length) return;

    const sourceData = {
      type: "FeatureCollection",
      features: props.points.map((coordinates, index) => {
        return {
          type: "Feature",
          properties: {
            description: index + 1,
          },
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
        };
      }),
    };

    const layerData = {
      id: props.sourceName,
      type: "symbol",
      source: props.sourceName,
      layout: {
        "text-field": ["get", "description"],
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-radial-offset": 1,
        "text-justify": "auto",
        "icon-image": ["get", "icon"],
        "text-size": 20,
      },
    };

    const source = mapRef.value.getSource(props.sourceName);

    if (source) {
      source.setData(sourceData);
    } else {
      mapRef.value.addSource(props.sourceName, {
        type: "geojson",
        data: sourceData,
      });
      mapRef.value.addLayer(layerData);
    }
  },
  { flush: "post" }
);

onUnmounted(() => {
  if (mapRef.value.getLayer(props.sourceName)) {
    mapRef.value.removeLayer(props.sourceName);
  }

  if (mapRef.value.getSource(props.sourceName)) {
    mapRef.value.removeSource(props.sourceName);
  }
});
</script>
