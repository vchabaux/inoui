<template>
  <!-- Preview dialog -->
  <Notice
    v-if="currentNotice"
    :noticeId="currentNotice?._id"
    :open="!!currentNotice"
    @close="currentNotice = null"
  />

  <!-- Medias dialog -->
  <el-dialog v-model="isPicking">
    <Medias picker @select="selectAudio" mediaType="audio" />
  </el-dialog>

  <!-- Detective dialog -->
  <el-dialog v-model="isLearningDetective">
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

      <el-button class="w-full" @click="isLearningDetective = false">Okay</el-button>
    </div>
  </el-dialog>

  <!-- Path dialog -->
  <el-dialog v-model="isLearningPath">
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

      <el-button class="w-full" @click="isLearningPath = false">Okay</el-button>
    </div>
  </el-dialog>

  <template v-if="!isUpdate">
    <div class="page-content">
      <div class="variant-dash-title flow-row-between">
        <h1>New track</h1>
      </div>

      <el-form label-position="top" class="width-s stretched centered">
        <h2>Track information</h2>
        <el-form-item label="name">
          <el-input
            type="text"
            required
            v-model="newTrack.name"
            @keyup.enter="createTrack"
          />
        </el-form-item>
      </el-form>

      <div class="width-s centered">
        <el-button class="w-full" @click="createTrack">Save</el-button>
      </div>
    </div>
  </template>

  <!-- 2. Content -->
  <template v-else>
    <div class="page-content">
      <div class="variant-dash-title flow-row-between">
        <h1>
          {{ currentTrack?.name }} ({{ currentTrack?.attributes?.status }})
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

      <el-form label-position="top" v-if="currentTrack" class="width-l centered stretched">
      <h2>Track information</h2>

      <div class="flow-row grid-auto">
        <el-form-item label="name">
          <el-input type="text" v-model="currentTrack.name" />
        </el-form-item>

        <div class="flow-row hidden-info">
          <el-checkbox v-model="currentTrack.attributes.isHidden">the track is hidden</el-checkbox>
          <el-button
            aria-label="more info"
            title="more info"
            size="small"
            circle
            class="info-btn"
            @click="isLearningDetective = true"
          >
            <i class="fa-solid fa-info"></i>
          </el-button>
        </div>
      </div>

      <el-form-item v-if="app === 'cnrs1'" label="artist">
        <el-select
          v-model="selectedMusician"
          @change="selectMusician"
        >
          <el-option
            v-for="m in [{ _id: '', name: '-' }, ...musicians]"
            :key="m._id"
            :label="m.name"
            :value="m"
          />
        </el-select>
      </el-form-item>

      <div class="flow-row grid-line">
        <el-form-item label="audio">
          <template v-if="currentTrack.attributes.media">
            <el-input
              type="text"
              readonly
              v-model="
                currentTrack.attributes.media.url.split('/')[
                  currentTrack.attributes.media.url.split('/').length - 1
                ]
              "
            />
          </template>
          <p class="text-sm text-fade">the audio will be played when the user approaches the entry point</p>
        </el-form-item>
        <el-button
          class="fix1"
          aria-label="pick a file"
          title="pick a file"
          @click="isPicking = true"
        >
          <i class="fa-solid fa-arrow-up-from-bracket"></i>
        </el-button>
      </div>

      <div class="flow-row-between">
        <div class="flow-row">
          <el-form-item label="color">
            <el-color-picker
              class="fix2"
              v-model="currentTrack.attributes.color"
            />
          </el-form-item>
          <el-checkbox
            v-model="currentTrack.attributes.transparence"
          >the track points are not linked</el-checkbox>
        </div>

        <div class="flow-row">
          <el-checkbox
            v-model="currentTrack.attributes.isWalking"
            @change="toggleWalkingPath"
          >the track path follows the road</el-checkbox>
          <el-button
            aria-label="more info"
            title="more info"
            size="small"
            circle
            class="info-btn"
            @click="isLearningPath = true"
          >
            <i class="fa-solid fa-info"></i>
          </el-button>
          <el-button v-if="currentTrack.attributes.isWalking" @click="getPath">
            Update path
          </el-button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flow-row -end">
        <el-button @click="save('draft')">
          {{ getText("draft") }}
        </el-button>
        <el-button v-if="!isAdmin" @click="save('pending')">
          {{ getText("pending") }}
        </el-button>
        <el-button v-else @click="save('published')">
          {{ getText("published") }}
        </el-button>
      </div>
    </el-form>

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
const noticeStore = useStore("notice");
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
        const orig = currentNotice?.value?.original;
        if (orig && noticeStore.findOne(orig)?.status === "pending")
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

function selectMusician(e) {
  const musician = typeof e === 'object' && e !== null && 'value' in e ? e.value : e;
  selectedMusician.value = musician;
  if (currentTrack.value && currentTrack.value.attributes) {
    currentTrack.value.attributes.musician = musician?._id ?? null;
  }
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
  if (!currentTrack.value.attributes.media) {
    currentTrack.value.attributes.media = {};
  }
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

.variant-dash-title {
  width: 100%;
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
