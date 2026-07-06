<template>
  <!-- Preview dialog -->
  <Notice
    v-if="currentNotice"
    :noticeId="currentNotice?._id"
    :open="!!currentNotice"
    @close="currentNotice = null"
  />

  <!-- Medias dialog -->
  <Dialog v-model:visible="isPicking" modal @hide="isPicking = false">
    <Medias picker @select="selectAudio" mediaType="audio" />
  </Dialog>

  <!-- Detective dialog -->
  <Dialog
    v-model:visible="isLearningDetective"
    modal
    @hide="isLearningDetective = false"
  >
    <template #header>
      <h2>Detective mode</h2>
    </template>

    <div>
      <p class="small-text">
        A track can be hidden : when the user is in
        {{ app === "cnrs1" ? "exploration" : "itinerary" }} mode, and moves the
        map (mobile) or the cursor (desktop), they will hear the audio
        associated with the track. The closer they get to the entry point, the
        louder the audio will play. This is a fantastic way to provide a fun,
        interactive experience for your visitors
      </p>

      <p class="small-text">
        You can choose to hide some tracks and show others, of course. Don't
        worry about accessibility : when the detective mode is enabled, the user
        can disable it and use the accessible
        {{ app === "cnrs1" ? "exploration" : "itinerary" }} mode instead (all
        entry points are visible on the map)
      </p>

      <Button class="w-full" @click="isLearningDetective = false">Okay</Button>
    </div>
  </Dialog>

  <!-- Path dialog -->
  <Dialog
    v-model:visible="isLearningPath"
    modal
    @hide="isLearningPath = false"
  >
    <template #header>
      <h2>Type of path</h2>
    </template>

    <div>
      <p class="small-text"
        >The path between two points of the track can either be a straight line
        (left image), or follow the road (right image)</p
      >

      <div class="path-images flow-row">
        <img
          src="/images/map-path-crow.png"
          alt="map: the path between two points is a straight line (convenient to assess distances and relative location)"
        />
        <img
          src="/images/map-path-road.png"
          alt="map: the path between two points is the walking route (convenient to explore the track in the real world)"
        />
      </div>

      <p class="small-text text-fade"
        >A path following the road needs to be updated before publication in
        order to reflect recent changes (50 000 requests a month)</p
      >

      <Button class="w-full" @click="isLearningPath = false">Okay</Button>
    </div>
  </Dialog>

  <!-- Header -->
  <div class="variant-dash-title flow-row-between">
    <h1>
      {{
        isUpdate
          ? `${currentTrack?.name} (${currentTrack?.attributes?.status})`
          : "New track"
      }}
    </h1>
  </div>

  <div class="stretched width-s centered">
    <Voice
      v-if="error"
      type="error"
      :message="error.message"
      @close="error = null"
      :closable="true"
    />
  </div>

  <!-- 1. Name -->
  <template v-if="!isUpdate">
    <div class="width-s stretched centered">
      <h2>Track information</h2>
      <label>name</label>
      <InputText
        type="text"
        required
        v-model="newTrack.name"
        @keyup.enter="createTrack"
      />
    </div>

    <div class="width-s centered">
      <Button class="w-full" @click="createTrack">Save</Button>
    </div>
  </template>

  <!-- 2. Content -->
  <template v-else>
    <div v-if="currentTrack" class="width-l centered stretched">
      <h2>Track information</h2>

      <div class="flow-row grid-auto">
        <label>name</label>
        <InputText type="text" v-model="currentTrack.name" />

        <div class="flow-row hidden-info">
          <Checkbox
            :binary="true"
            v-model="currentTrack.attributes.isHidden"
          />
          <label>the track is hidden</label>
          <Button
            aria-label="more info"
            title="more info"
            outlined
            size="small"
            rounded
            class="info-btn"
            @click="isLearningDetective = true"
          >
            <i class="fa-solid fa-info"></i>
          </Button>
        </div>
      </div>

      <Select
        v-if="app === 'cnrs1'"
        :options="[{ _id: '', name: '-' }, ...musicians]"
        optionLabel="name"
        :modelValue="selectedMusician"
        @change="selectMusician"
      />

      <div class="flow-row grid-line">
        <template v-if="currentTrack.attributes.media">
          <label>audio</label>
          <InputText
            type="text"
            readonly
            v-model="
              currentTrack.attributes.media.url.split('/')[
                currentTrack.attributes.media.url.split('/').length - 1
              ]
            "
          />
          <p class="text-sm text-fade">the audio will be played when the user approaches the entry point</p>
        </template>
        <Button
          class="fix1"
          aria-label="pick a file"
          title="pick a file"
          @click="isPicking = true"
        >
          <i class="fa-solid fa-arrow-up-from-bracket"></i>
        </Button>
      </div>

      <div class="flow-row-between">
        <div class="flow-row">
          <label>color</label>
          <ColorPicker
            class="fix2"
            v-model="currentTrack.attributes.color"
          />
          <Checkbox
            :binary="true"
            v-model="currentTrack.attributes.transparence"
          />
          <label>the track points are not linked</label>
        </div>

        <div class="flow-row">
          <Checkbox
            :binary="true"
            v-model="currentTrack.attributes.isWalking"
            @change="toggleWalkingPath"
          />
          <label>the track path follows the road</label>
          <Button
            aria-label="more info"
            title="more info"
            outlined
            size="small"
            rounded
            class="info-btn"
            @click="isLearningPath = true"
          >
            <i class="fa-solid fa-info"></i>
          </Button>
          <Button v-if="currentTrack.attributes.isWalking" @click="getPath">
            Update path
          </Button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flow-row -end">
        <Button outlined @click="save('draft')">
          {{ getText("draft") }}
        </Button>
        <Button v-if="!isAdmin" @click="save('pending')">
          {{ getText("pending") }}
        </Button>
        <Button v-else @click="save('published')">
          {{ getText("published") }}
        </Button>
      </div>
    </div>

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
import { useStore } from "@/stores";
import { Layer, Map, Marker, Path } from "@/components/mapbox";
import FormTrack from "@/components/forms/FormTrack.vue";
import FormPoint from "@/components/forms/FormPoint.vue";
import Notice from "@/components/notice/Notice.vue";
import Medias from "@/pages/admin/Medias.vue";
import Voice from "@/components/Voice.vue";
import { handleError } from "@/utils";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import ColorPicker from "primevue/colorpicker";

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
