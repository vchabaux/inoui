<template>
  <Container width="l" class="app-page">
    <Text tag="h1" class="color-title">Artistes</Text>

    <Container class="musicians">
      <Container class="musician-container" v-for="mus in musiciansList">
        <Container
          class="musician-title"
          :style="{ '--color': mus.color ? mus.color : '#888888' }"
        >
          <div class="musician-color" />
          <Text tag="h2">{{ mus.name }}</Text>
          <div class="musician-color" />
        </Container>

        <Container class="musician-image">
          <Image
            :src="mus.pictures?.main"
            :alt="mus.name"
            fluid
            @mouseover="updateImg($event, mus.pictures?.secondary)"
            @mouseleave="updateImg($event, mus.pictures?.main)"
          />
        </Container>

        <Container>
          <Text class="musician-description" v-html="mus.description" />

          <Container class="musician-details" flow="row-between">
            <Container>
              <Text v-if="mus.contact?.email">{{ mus.contact?.email }}</Text>
              <Text v-if="mus.contact?.phone">{{ mus.contact?.phone }}</Text>
            </Container>

            <Container>
              <Link variant="outline" :path="`/?musician=${mus._id}`"
                >Explorer son parcours</Link
              >
            </Container>
          </Container>
        </Container>
      </Container>
    </Container>
  </Container>
</template>

<script setup>
import { computed } from "vue";
import { Container, Image, Text, Link } from "@owlabio/owl-ui";
import { useStore } from "@/stores";

const musicianStore = useStore("musician");
const trackStore = useStore("track");
const musicians = computed(() => musicianStore.list);

const musiciansList = computed(() =>
  musicians.value
    .map((mus) => {
      return {
        ...mus,
        color: trackStore.list.find((t) => t.attributes.musician === mus._id)?.attributes?.color,
      };
    })
    .sort(() => Math.random() - 0.5)
);

function updateImg(event, img) {
  event.target.src = img;
}
</script>

<style scoped>
:global(main) {
  overflow-y: auto;
}

.musicians {
  gap: var(--size-12);
}

.musician-container {
  display: grid;
}

.musician-title {
  display: grid;
  grid-template-columns: var(--size-4) auto 1fr;
  align-items: center;
  gap: var(--size-2);
  margin-block-end: var(--size-4);
}

.musician-color {
  position: relative;
  background-color: var(--color);
  height: 0.75rem;
}

.musician-image {
  width: clamp(200px, 100%, 400px);
  aspect-ratio: 4/3;
}

.musician-description {
  font-size: var(--size-3-5);
}

.musician-details {
  align-items: center;
}

.musician-details > * {
  gap: 0;
}

@media (max-width: 767px) {
  .musician-details {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (min-width: 768px) {
  .musician-container {
    grid-template-columns: 1fr 1fr;
  }

  .musician-title {
    grid-column: span 2;
  }
}
</style>
