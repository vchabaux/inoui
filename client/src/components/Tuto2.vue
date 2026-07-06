<template>
  <p>
    This map provides a series of sensory itineraries. These are composed of sounds, images, texts, and videos that trace various human experiences in São José. You can
    switch between two navigation modes at the top of the map
    <i class="fa-solid fa-route" /> / <i class="fa-solid fa-location-dot" />
  </p>

  <h3>1. <i class="fa-solid fa-route" /> Itinerary mode (default)</h3>

  <p>
    In this mode, you will navigate through a series of suggested itineraries. The entry point of each itinerary is shown on the map. You will see all the entry points by
    clicking this icon
    <i class="fa-solid fa-arrow-left" />
  </p>

  <p v-if="hasDetectiveMode">
    Be careful : some entry points are hidden! Enable audio to find them. If you can't play audio or just want to show all entry points, click on the
    <i class="fa-solid fa-eye-slash" /> / <i class="fa-solid fa-eye" /> <span class="emphasis-text">Accessible Mode</span> button.
  </p>

  <h3>2. <i class="fa-solid fa-location-dot" /> Free navigation mode</h3>

  <p
    >Every point on the map is displayed. In this mode, you can freely move from one point to another following the filtered categories available at the sidebar at the
    top of the map <i class="fa-solid fa-filter"
  /></p>

  <p>To enable the sounds on the map, click the icon <i class="fa-solid fa-volume-xmark" /> / <i class="fa-solid fa-volume-high" /></p>

  <p>Enjoy your trip!</p>
</template>

<script setup>
const props = defineProps({
  hasDetectiveMode: Boolean,
});
</script>

<style scoped>
p {
  color: var(--color-text-fade) !important;
}

p:not(h3 ~ p)::first-letter,
h3 {
  padding-left: var(--size-8);
}
</style>
