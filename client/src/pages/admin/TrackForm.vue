<template>
  <!-- Preview dialog -->
  <Notice
    v-if="currentNotice"
    :noticeId="currentNotice?._id"
    :open="!!currentNotice"
    @close="currentNotice = null"
  />

  <!-- Medias dialog -->
  <Dialog id="assets" :open="isPicking" modal @close="isPicking = false">
    <Medias picker @select="selectAudio" mediaType="audio" />
  </Dialog>

  <!-- Detective dialog -->
  <Dialog
    id="detective"
    :open="isLearningDetective"
    modal
    @close="isLearningDetective = false"
  >
    <template #header>
      <Text tag="h2">Detective mode</Text>
    </template>

    <Container>
      <Text class="small-text">
        A track can be hidden : when the user is in
        {{ app === "cnrs1" ? "exploration" : "itinerary" }} mode, and moves the
        map (mobile) or the cursor (desktop), they will hear the audio
        associated with the track. The closer they get to the entry point, the
        louder the audio will play. This is a fantastic way to provide a fun,
        interactive experience for your visitors
      </Text>

      <Text class="small-text">
        You can choose to hide some tracks and show others, of course. Don't
        worry about accessibility : when the detective mode is enabled, the user
        can disable it and use the accessible
        {{ app === "cnrs1" ? "exploration" : "itinerary" }} mode instead (all
        entry points are visible on the map)
      </Text>

      <Button wide @click="isLearningDetective = false">Okay</Button>
    </Container>
  </Dialog>

  <!-- Path dialog -->
  <Dialog
    id="path"
    :open="isLearningPath"
    modal
    @close="isLearningPath = false"
  >
    <template #header>
      <Text tag="h2">Type of path</Text>
    </template>

    <Container>
      <Text class="small-text"
        >The path between two points of the track can either be a straight line
        (left image), or follow the road (right image)</Text
      >

      <Container class="path-images" flow="row">
        <Image
          src="/images/map-path-crow.png"
          alt="map: the path between two points is a straight line (convenient to assess distances and relative location)"
        />
        <Image
          src="/images/map-path-road.png"
          alt="map: the path between two points is the walking route (convenient to explore the track in the real world)"
        />
      </Container>

      <Text variant="fade" class="small-text"
        >A path following the road needs to be updated before publication in
        order to reflect recent changes (50 000 requests a month)</Text
      >

      <Button wide @click="isLearningPath = false">Okay</Button>
    </Container>
  </Dialog>

  <!-- Header -->
  <Container flow="row-between" variant="dash-title">
    <h1>
      {{
        isUpdate
          ? `${currentTrack?.name} (${currentTrack?.attributes?.status})`
          : "New track"
      }}
    </h1>
  </Container>

  <Container stretched width="s" centered>
    <Voice
      v-if="error"
      type="error"
      :message="error.message"
      @close="error = null"
      :closable="true"
    />
  </Container>

  <!-- 1. Name -->
  <template v-if="!isUpdate">
    <Container width="s" stretched centered>
      <h2>Track information</h2>
      <Field
        label="name"
        type="text"
        required
        v-model="newTrack.name"
        @keyup.enter="createTrack"
      />
    </Container>

    <Container width="s" centered>
      <Button wide @click="createTrack">Save</Button>
    </Container>
  </template>

  <!-- 2. Content -->
  <template v-else>
    <Container v-if="currentTrack" width="l" centered stretched>
      <h2>Track information</h2>

      <Container flow="row" class="grid-auto">
        <Field type="text" label="name" v-model="currentTrack.name" />

        <Container flow="row" class="hidden-info">
          <Field
            type="checkbox"
            label="the track is hidden"
            v-model="currentTrack.attributes.isHidden"
          />
          <Button
            aria-label="more info"
            title="more info"
            variant="outline"
            size="s"
            pill
            class="info-btn"
            @click="isLearningDetective = true"
          >
            <Icon name="info" />
          </Button>
        </Container>
      </Container>

      <Field
        v-if="app === 'cnrs1'"
        type="select"
        label="artist"
        :options="[{ _id: '', name: '-' }, ...musicians]"
        :formatter="(v) => v.name"
        :modelValue="selectedMusician"
        @change="selectMusician"
      />

      <Container flow="row" class="grid-line">
        <Field
          v-if="currentTrack.attributes.media"
          type="text"
          label="audio"
          readonly
          hint="the audio will be played when the user approaches the entry point"
          v-model="
            currentTrack.attributes.media.url.split('/')[
              currentTrack.attributes.media.url.split('/').length - 1
            ]
          "
        />
        <Button
          class="fix1"
          aria-label="pick a file"
          title="pick a file"
          @click="isPicking = true"
        >
          <Icon name="arrow-up-from-bracket" />
        </Button>
      </Container>

      <Container flow="row-between">
        <Container flow="row">
          <Field
            type="color"
            class="fix2"
            label="color"
            v-model="currentTrack.attributes.color"
          />
          <Field
            type="checkbox"
            label="the track points are not linked"
            v-model="currentTrack.attributes.transparence"
          />
        </Container>

        <Container flow="row">
          <Field
            type="checkbox"
            label="the track path follows the road"
            v-model="currentTrack.attributes.isWalking"
            @change="toggleWalkingPath"
          />
          <Button
            aria-label="more info"
            title="more info"
            variant="outline"
            size="s"
            pill
            class="info-btn"
            @click="isLearningPath = true"
          >
            <Icon name="info" />
          </Button>
          <Button v-if="currentTrack.attributes.isWalking" @click="getPath">
            Update path
          </Button>
        </Container>
      </Container>

      <!-- Actions -->
      <Container flow="row" class="-end">
        <Button variant="outline" @click="save('draft')">
          {{ getText("draft") }}
        </Button>
        <Button v-if="!isAdmin" @click="save('pending')">
          {{ getText("pending") }}
        </Button>
        <Button v-else @click="save('published')">
          {{ getText("published") }}
        </Button>
      </Container>
    </Container>

    <Map
      v-if="currentTrack && currentNode"
      class="map"
      :zoom="mapSettings.zoom"
      :mapStyle="mapSettings.mapStyle"
      :center="
        currentNode.context === 'Point'
          ? currentNode.attributes.coordinates
          : mapSettings.center
      "
      @loaded="mapLoaded = true"
      @click="addPoint"
    >
      <Marker
        v-for="(point, i) in allPoints"
        :key="point._id"
        :lat="point.attributes.coordinates[1]"
        :lng="point.attributes.coordinates[0]"
        :color="currentTrack.attributes?.color"
        :icon="point.attributes.notice?.categories?.[0]?.attributes?.icon"
        :first="i === 0"
        :current="currentNode._id === point._id"
        draggable
        @dragend="({ lat, lng }) => movePoint({ id: point._id, lat, lng })"
        @click="openNotice(point)"
      />

      <Path
        v-if="mapLoaded && !currentTrack.attributes.transparence"
        :id="currentTrack.name"
        :steps="getSteps()"
        :color="currentTrack.attributes?.color"
        line
      />

      <Path
        v-if="
          mapLoaded && detours.length && !currentTrack.attributes.transparence
        "
        v-for="(obj, i) in detours"
        :id="`${i}-detour`"
        :steps="obj?.steps"
        :color="currentTrack.attributes.color"
        line
        dashed
      />

      <!-- Form -->
      <template #layer>
        <component
          v-if="currentNode"
          :is="currentForm"
          :node="currentNode"
          @edit="editNode"
          @go-back="goBack"
          @save="autosave"
        >
        </component>
      </template>
    </Map>
  </template>
</template>

<script setup>
import axios from "axios";
import { computed, ref } from "vue";
import { getDirections } from "@/api/mapbox.js";
import { useRoute, useRouter } from "vue-router";
import {
  Dialog,
  Container,
  Image,
  Field,
  Button,
  Icon,
  Text,
} from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import { Layer, Map, Marker, Path } from "@/components/mapbox";
import FormTrack from "@/components/forms/FormTrack.vue";
import FormPoint from "@/components/forms/FormPoint.vue";
import Notice from "@/components/notice/Notice.vue";
import Medias from "@/pages/admin/Medias.vue";
import Voice from "@/components/Voice.vue";
import { handleError } from "@/utils";

const route = useRoute();
const router = useRouter();
const trackStore = useStore("track");
const settingsStore = useStore("settings");
const authStore = useStore("auth");
const musicianStore = useStore("musician");

const isUpdate = computed(() => route.params.id);
const isPicking = ref(false);
const isLearningDetective = ref(false);
const isLearningPath = ref(false);
const newTrack = ref({ name: "" });
const currentTrack = ref(trackStore.findOne(route.params.id));
const currentNode = ref(currentTrack.value);
const currentNotice = ref(null);
const mapLoaded = ref(false);
const error = ref(null);
const mapSettings = computed(() => settingsStore.settings?.map);
const app = computed(() => settingsStore.project);
const currentForm = computed(() =>
  currentNode.value?.context === "Parcours" ? FormTrack : FormPoint
);
const currentUser = computed(() => authStore.currentUser);
const isAdmin = computed(() => currentUser.value.role.includes("admin"));
const selectedMusician = ref(
  currentTrack.value?.attributes?.musician
    ? musicianStore.findOne(currentTrack.value.attributes.musician)
    : null
);
const musicians = computed(() => {
  const allMusicians = musicianStore.list;
  const usedMusicians = trackStore.musicians;

  return allMusicians.filter((n) => !usedMusicians.includes(n._id));
});

const isWalking = computed(() => !!currentTrack.value.attributes.isWalking);
const allPoints = computed(() => {
  if (!currentTrack.value) return [];
  const points = [];

  const extract = (node) => {
    for (const child of node) {
      child.context === "Point" && points.push(child);
      extract(child.children);
    }
  };

  extract(currentTrack.value.children);
  return points;
});

function getText(goal) {
  let status = currentTrack.value?.attributes.status;
  let isCopy = currentTrack.value?.original;

  if (isUpdate.value) {
    if (isCopy) {
      if (goal === "draft") return "Save copy as draft";
      if (goal === "pending") {
        if (
          noticeStore.findOne(currentNotice.value.original).status === "pending"
        )
          return "Send for review and overwrite original";
        else return "Send copy for review";
      }
      if (goal === "published") return "Publish and overwrite original";
    } else {
      if (status === "draft") {
        if (goal === "draft") return "Save";
        if (goal === "pending") return "Send for review";
        if (goal === "published") return "Publish";
      } else if (status === "pending") {
        if (goal === "draft") {
          if (isAdmin.value) return "Save";
          else return "Create a copy as draft";
        }
        if (goal === "pending") return "Send for review";
        if (goal === "published") return "Publish";
      } else if (status === "published") {
        if (goal === "draft") return "Create a copy as draft";
        if (goal === "pending") return "Send a copy for review";
        if (goal === "published") return "Publish changes";
      }
    }
  } else {
    if (goal === "draft") return "Save as draft";
    if (goal === "pending") return "Send for review";
    if (goal === "published") return "Publish";
  }
}

function selectMusician(e, musician) {
  selectedMusician.value = musician;
  currentTrack.value.attributes.musician = musician._id;
}

async function toggleWalkingPath() {
  await trackStore.updateNode(currentTrack.value._id, currentTrack.value);
}

const detours = computed(() => {
  const result = [];

  if (isWalking.value) {
    currentTrack.value.children.forEach((point) => {
      if (point.children.length) {
        point.children.forEach((detour) => {
          result.push({ steps: detour.attributes.walkingPath });
        });
      }
    });
    return result;
  }

  currentTrack.value.children.forEach((point, i) => {
    if (point.children.length) {
      const steps = [point.attributes.coordinates];

      point.children.forEach((detour) => {
        detour.children.forEach((detourPoint) => {
          steps.push(detourPoint.attributes.coordinates);
        });
      });

      steps.push(currentTrack.value.children[i + 1]?.attributes.coordinates);
      result.push({ steps });
    }
  });

  return result.flat();
});

function getSteps() {
  if (!currentTrack.value) return [];
  if (currentTrack.value.attributes.transparence) return [];

  if (isWalking.value) return currentTrack.value.attributes.walkingPath;

  return currentTrack.value.children.map(
    (child) => child?.attributes?.coordinates
  );
}

async function generatePath(node) {
  const allCoordinates = [];

  let parentNode;
  let parentParentNode;

  if (node.parent) {
    parentNode = trackStore.findOne(node.parent);

    allCoordinates.push(parentNode.attributes.coordinates);

    parentParentNode = trackStore.findOne(parentNode.parent);
  }

  for (const child of node.children) {
    allCoordinates.push(child.attributes.coordinates);
  }

  if (node.parent) {
    const index = parentParentNode.children.findIndex(
      (n) => n._id === parentNode._id
    );

    const nextParentSibling = parentParentNode.children[index + 1];
    allCoordinates.push(nextParentSibling.attributes.coordinates);
  }

  node.attributes.walkingPath = await getDirections(allCoordinates);

  const { _id, ...copy } = node;

  await trackStore.updateNode(node._id, copy);
}

async function getPath() {
  generatePath(currentTrack.value);

  for (const point of currentTrack.value.children) {
    if (point.children.length) {
      for (const detour of point.children) {
        generatePath(detour);
      }
    }
  }
}

async function getAddress(lat, lng) {
  const query = `${lng},${lat}.json?access_token=${
    import.meta.env.VITE_APP_MAPBOX_TOKEN
  }`;
  const { data } = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}`
  );
  return data;
}

function selectAudio(file) {
  currentTrack.value.attributes.media.url = file.url;
  isPicking.value = false;
}

async function addPoint(e) {
  if (currentNode.value.context === "Parcours") {
    const location = await getAddress(e.lngLat.lat, e.lngLat.lng);

    const newPoint = {
      name: `Point # ${currentNode.value.children.length + 1}`,
      attributes: {
        placeName: location.features[0].place_name,
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      },
    };

    await trackStore.createPoint(currentNode.value._id, newPoint);
    currentTrack.value = trackStore.findOne(currentTrack.value._id);
    currentNode.value = trackStore.findOne(currentNode.value._id);
  }
}

const movePoint = async ({ id, lng, lat }) => {
  /**
   * This means update
   */

  const location = await getAddress(lat, lng);

  const { _id, ...foundNode } = trackStore.findOne(id);

  const point = {
    ...foundNode,
    name: foundNode.name,
    context: "Point",
    attributes: {
      ...foundNode.attributes,
      placeName: location.features[0].place_name,
      coordinates: [lng, lat],
    },
  };

  await trackStore.updateNode(id, point);

  currentTrack.value = trackStore.findOne(currentTrack.value._id);
  currentNode.value = trackStore.findOne(currentNode.value._id);
};

function openNotice(point) {
  point.attributes.notice && (currentNotice.value = point.attributes.notice);
}

function goBack(nodeId) {
  currentNode.value = trackStore.findOne(nodeId);
}

function editNode(node) {
  currentNode.value = node;
  currentTrack.value = trackStore.findOne(currentTrack.value._id);
}

// save process

async function createTrack() {
  const created = await trackStore.createTrack(newTrack.value.name);

  currentTrack.value = trackStore.findOne(created._id);
  currentNode.value = currentTrack.value;
  router.push(`/admin/tracks/${created._id}`);
}

function autosave() {
  trackStore.updateNode(currentTrack.value._id, currentTrack.value);
  currentTrack.value = trackStore.findOne(currentTrack.value._id);
  currentNode.value = trackStore.findOne(currentNode.value._id);
}

// ===========

async function copyTrack() {
  currentTrack.value.attributes.status = "draft";
  currentTrack.value.original = currentTrack.value._id;
  await trackStore.create(currentTrack.value);
}

async function replaceTrack(goal) {
  const previousGoal = currentTrack.value.attributes.status;
  try {
    currentTrack.value.attributes.status = goal;
    await trackStore.updateNode(
      currentTrack.value.original,
      currentTrack.value
    );
    await trackStore.delete(currentTrack.value._id);
  } catch (err) {
    currentTrack.value.attributes.status = previousGoal;
    error.value = handleError(err);
    throw err;
  }
}

async function updateTrack(goal) {
  const previousGoal = currentTrack.value.attributes.status;

  try {
    currentTrack.value.attributes.status = goal;
    await trackStore.updateNode(route.params.id, currentTrack.value);
  } catch (err) {
    currentTrack.value.attributes.status = previousGoal;
    error.value = handleError(err);
    throw err;
  }
}

async function save(goal) {
  let status = currentTrack.value.attributes.status;

  /* ==== IS UPDATE SCENARIOS
    If the track is NOT a copy :
        --> UPDATE
        From draft to all (user & admin)
        From pending to pending (user) / to draft or published (admin)
        From published to published (admin)

        --> COPY
        From pending to draft (user)
        From published to draft or pending (user) / to draft (admin)

    If the track IS a copy :
        --> UPDATE
        From draft to draft (user & admin)
        From draft to pending IF OG IS NOT PENDING (user)

        --> REPLACE
        From draft to pending IF OG IS PENDING (user)
        From whatever to published IF OG IS PUBLISHED (admin)
  **/

  try {
    if (isUpdate.value) {
      // COPY
      if (
        (status === "published" && goal !== "published") ||
        (status === "pending" && goal === "draft" && !isAdmin.value)
      ) {
        copyTrack();
        router.push("/admin/tracks");
        return;
      }

      // REPLACE
      if (currentTrack.value.original && goal !== "draft" && status === goal) {
        replaceTrack(goal);
        router.push("/admin/tracks");
        return;
      }

      // UPDATE

      await updateTrack(goal);
      router.push("/admin/tracks");
    } else {
      trackStore.create(currentTrack.value);
      router.push("/admin/tracks");
    }
  } catch (err) {
    console.log(err, "this is the err");
  }
}
</script>

<style scoped>
.path-images {
  margin-inline: auto;
}

.path-images img {
  min-width: 200px;
  max-width: 300px;
  flex: 1;
}

.map {
  height: 90vh;
}

.grid-auto,
.grid-line {
  display: grid;
  gap: var(--size-4);
  align-items: flex-start;
}

.grid-line {
  grid-template-columns: 1fr auto;
}

.row-end {
  align-items: flex-end;
}

.info-btn {
  padding: var(--size-1) !important;
}

.fix1 {
  margin-block-start: 25px;
}

.fix2 {
  margin-block-end: 25px;
}

@media (max-width: 767px) {
  .grid-auto {
  }

  .hidden-info {
    margin-block: var(--size-2);
  }
}

@media (min-width: 768px) {
  .grid-auto {
    grid-template-columns: 1fr auto;
  }

  .hidden-info {
    margin-block-start: 30px;
  }
}
</style>
