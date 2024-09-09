<template>
  <Text>
    This map provides a series of sensory itineraries. These are composed of sounds, images, texts, and videos that trace various human experiences in São José. You can
    switch between two navigation modes at the top of the map
    <Icon name="route" /> / <Icon name="location-dot" />
  </Text>

  <Text tag="h3">1. <Icon name="route" /> Itinerary mode (default)</Text>

  <Text>
    In this mode, you will navigate through a series of suggested itineraries. The entry point of each itinerary is shown on the map. You will see all the entry points by
    clicking this icon
    <Icon name="arrow-left" />
  </Text>

  <Text v-if="hasDetectiveMode">
    Be careful : some entry points are hidden! Enable audio to find them. If you can't play audio or just want to show all entry points, click on the
    <Icon name="eye-slash" /> / <Icon name="eye" /> <span class="emphasis-text">Accessible Mode</span> button.
  </Text>

  <Text tag="h3">2. <Icon name="location-dot" /> Free navigation mode</Text>

  <Text
    >Every point on the map is displayed. In this mode, you can freely move from one point to another following the filtered categories available at the sidebar at the
    top of the map <Icon name="filter"
  /></Text>

  <Text>To enable the sounds on the map, click the icon <Icon name="volume-xmark" /> / <Icon name="volume-high" /></Text>

  <Text>Enjoy your trip!</Text>
</template>

<script setup>
import { Text, Icon } from "@owlabio/owl-ui";

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
