<template></template>

<script setup>
import { ref, inject, watchEffect, onUnmounted } from "vue";
import axios from "axios";

const token = import.meta.env.VITE_APP_MAPBOX_TOKEN;
const mapRef = inject("map");
const computedSteps = ref(null);

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  steps: {
    type: Array,
    required: true,
  },
  profile: {
    type: String,
    default: "mapbox/walking",
  },
  color: {
    type: String,
    default: "#000000",
  },
  line: {
    type: Boolean,
    default: false,
  },
  dashed: {
    type: Boolean,
    default: false,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});
watchEffect(async () => {
  // const layer = { id: props.id, ...formatData(props.steps) }
  // const source = { id: props.id, ...getLayer(props.id, props.color) }

  // pathStore.addLayer(layer);
  // pathStore.addSource(source);

  try {
    if (mapRef.value.getLayer(props.id)) {
      mapRef.value.removeLayer(props.id);
    }
    if (mapRef.value.getSource(props.id)) {
      mapRef.value.removeSource(props.id);
    }

    mapRef.value.addSource(props.id, formatData(props.steps));
    mapRef.value.addLayer(getLayer(props.id, props.color, props.dashed));
  } catch (err) {
    console.warn(err);
  }

  if (!props.line) {
    const coordinates = props.steps
      .map((step) => `${step[0]},${step[1]}`)
      .join(";");

    const { data } = await axios.get(
      `https://api.mapbox.com/directions/v5/${props.profile}/${coordinates}?access_token=${props.token}&steps=true`
    );

    //     try {

    //         if (mapRef.value.getLayer(props.id)) {
    //             mapRef.value.removeLayer(props.id);
    //             mapRef.value.removeSource(props.id);

    //             layers.value = layers.value.filter(id => id !== props.id);
    //             sources.value = sources.value.filter(id => id !== props.id);

    //         }
    //     } catch (e) { }

    const mySteps = data.routes[0].legs.reduce((acc, curr) => {
      return [...acc, ...curr.steps];
    }, []);

    const allCoords = mySteps.reduce((acc, curr) => {
      acc.push(curr.maneuver.location);
      return acc;
    }, []);

    // pathStore.removeLayer()

    //     mapRef.value.addSource(props.id, formatData(allCoords))
    //     mapRef.value.addLayer(getLayer(props.id))

    //     layers.value.push(props.id);
    //     sources.value.push(props.id)

    //     computedSteps.value = data;
    // } else {

    //     try {

    //         if (mapRef.value.getLayer(props.id)) {

    //             mapRef.value.removeLayer(props.id);
    //             mapRef.value.removeSource(props.id);

    //             layers.value = layers.value.filter(id => id !== props.id);
    //             sources.value = sources.value.filter(id => id !== props.id);
    //         }
    //     } catch (e) { }

    //     mapRef.value.addSource(props.id, formatData(props.steps))
    //     mapRef.value.addLayer(getLayer(props.id))

    //     layers.value.push(props.id);
    //     sources.value.push(props.id);
  }
});

function formatData(coordinates) {
  return {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    },
  };
}

function getLayer(id, color, dashed) {
  return {
    id,
    type: "line",
    source: id,
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": color,
      "line-width": 4,
      "line-opacity": props.visible ? 1 : 0,
      ...(dashed && { "line-dasharray": [2, 3] }),
    },
  };
}

onUnmounted(() => {
  if (mapRef.value.getLayer(props.id)) {
    mapRef.value.removeLayer(props.id);
  }

  if (mapRef.value.getSource(props.id)) {
    mapRef.value.removeSource(props.id);
  }
});
</script>
