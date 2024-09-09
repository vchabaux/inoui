<template></template>

<script setup>
/** TO READ
  * Having the marker as a seperate component allows us seperate concerns.
  * You can get the map's reference through inject("map") provided by the map.
  * To avoid any provide/inject name clashing we could transform the inject key into a symbol and export it from the map component.
  * The marker component could take way more properties such as color, different image to use as svg etc...

  * The MapBox marker does not have an onClick event that we can listen to by default so we have to use this hack for now.
  * Found in github/maxboxgl issues thanks to the comment section over here
  * https://github.com/mapbox/mapbox-gl-js/issues/7793
  * Thanks to @bart => https://github.com/bart
*/

import {
  inject,
  ref,
  onUnmounted,
  watchEffect,
  watch,
  computed,
  onUpdated,
} from "vue";
import { useStore } from "@/stores";

const settingsStore = useStore("settings");
const app = computed(() => settingsStore.project);

const mapRef = inject("map");
const markers = inject("markers");
const markerRef = ref(null);
const emits = defineEmits(["click", "mouseleave", "mouseenter", "dragend"]);

const props = defineProps({
  lng: Number,
  lat: Number,
  color: String,
  offset: Array,
  icon: Object,
  first: Boolean,
  current: Boolean,
  faded: Boolean,
  emphasis: Boolean,
  revealed: Boolean,
  invisible: Boolean,
  draggable: Boolean,
  isSelected: Boolean,
});

class ClickableMarker extends mapboxgl.Marker {
  // new method onClick, sets _handleClick to a function you pass in
  onClick(handleClick) {
    this._handleClick = handleClick;
    return this;
  }

  // the existing _onMapClick was there to trigger a popup
  // but we are hijacking it to run a function we define
  _onMapClick(e) {
    const targetElement = e.originalEvent.target;
    const element = this._element;

    if (
      this._handleClick &&
      (targetElement === element || element.contains(targetElement))
    ) {
      this._handleClick();
    }
  }
}

const getFrontColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128 ? "var(--color-99)" : "var(--color-1)";
};

watchEffect(() => {
  if (!mapRef.value) return;

  const markerStyles = `
    --app-border: var(--border-${app.value === "cnrs1" ? "2" : "1"});
    --color-text-neutral: ${
      app.value === "cnrs1" ? "#e5e5e5" : "black"
    } !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size-${props.first ? "8" : "6"});
    height: var(--size-${props.first ? "8" : "6"});
    background: ${props.color} !important;
    color: ${getFrontColor(props.color)} !important;
    border: var(--app-border, var(--border-1)) solid var(--color-text-neutral) !important;
    border-radius: 50%;
    font-size: var(--size-${props.first ? "4" : "3-5"});
    line-height: 1;
    cursor: ${props.draggable ? "grab" : "pointer"};
    outline: ${
      props.current ? "var(--border-2)" : "0"
    } solid var(--color-text-neutral) !important;
    outline-offset: var(--size-1);
    opacity: ${
      props.invisible && !props.revealed ? "0" : props.faded ? "0.5" : "1"
    };
    animation: ${props.emphasis ? "wave 1s infinite" : "none"};
    transition: opacity 1s ease-in-out;
  `;

  if (markerRef.value) {
    markerRef.value?.setLngLat([props.lng, props.lat]);
    const element = markerRef.value?.getElement();
    element.style.cssText = markerStyles;
    return;
  }

  const el = document.createElement("button");

  el.innerHTML = `<i class='fa-${props.icon?.style} fa-${props.icon?.name}'></i>`;
  // el.innerHTML = `<i class='fa-solid fa-xmark'></i>`;
  el.className = "map-marker";

  el.style.cssText = markerStyles;

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  const marker = new ClickableMarker({
    element: el,
    draggable: props.draggable,
    offset: props.isSelected ? undefined : props.offset,
  })
    .setLngLat([props.lng, props.lat])
    .addTo(mapRef.value);

  marker.on("dragend", (event) => {
    const lngLat = marker.getLngLat();
    emits("dragend", { lat: lngLat.lat, lng: lngLat.lng });
  });

  marker.getElement().addEventListener("mouseenter", () => emits("mouseenter"));
  marker.getElement().addEventListener("mouseleave", () => emits("mouseleave"));
  marker.getElement().addEventListener("focus", () => emits("focus"));
  marker.getElement().addEventListener("blur", () => emits("blur"));
  marker.getElement().addEventListener("click", () => emits("click"));

  markers.value.push(marker);
  markerRef.value = marker;
});

// watch(
//   () => props.isSelected,
//   (newValue, oldValue) => {
//     // markerRef.value.set
//   }
// );

onUpdated(() => {
  if (!markerRef.value) return;

  markerRef.value.getElement().innerHTML = `<i class='fa-${props.icon?.style} fa-${props.icon?.name}'></i>`;
});

onUnmounted(() => markerRef.value && markerRef.value.remove());
</script>

<style>
@keyframes wave {
  0% {
    width: var(--size-8);
    height: var(--size-8);
  }
  50% {
    width: var(--size-10);
    height: var(--size-10);
  }
  100% {
    width: var(--size-8);
    height: var(--size-8);
  }
}
</style>
