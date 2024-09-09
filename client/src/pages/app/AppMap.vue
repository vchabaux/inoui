<template>
  <!-- Notice dialog -->

  <Notice
    v-if="isReading"
    :noticeId="currentNoticeId"
    :open="isReading"
    :navigation="mode === 'narration' ? currentNav : null"
    @navigate="navigate"
    @close="closeNotice"
  />

  <!-- Help dialog -->
  <Tuto
    v-if="isLearning"
    :hasDetectiveMode="hasDetectiveMode"
    @close="isLearning = false"
  />

  <!-- Map -->
  <h1 class="invisible" v-t="'map.title'"></h1>

  <audio
    v-if="settings?.map.appAudio"
    id="ambiance"
    class="invisible"
    :src="settings?.map.appAudio"
    :volume="0.07"
    loop
  />

  <Map
    :zoom="mapZoom"
    :center="
      currentPoint ? currentPoint.attributes.coordinates : settings?.map?.center
    "
    :mapStyle="settings?.map?.mapStyle"
    @mousemove="checkAudio"
    @drag="checkAudio"
    @loaded="loadMap"
    @keyup.escape="
      () => {
        currentTrack = null;
        currentPoint = null;
        isFiltersOpen = false;
      }
    "
    @click="
      () => {
        currentTrack = null;
        currentPoint = null;
        isFiltersOpen = false;
      }
    "
  >
    <template v-for="(point, i) in filteredPoints" :key="point._id">
      <Marker
        v-if="
          currentTrack
            ? point.track === currentTrack
            : point.isFirst || mode === 'classic'
        "
        :id="`${i}-point`"
        :lng="point.attributes?.coordinates[0]"
        :lat="point.attributes?.coordinates[1]"
        :offset="point.attributes?.offset"
        :color="point.color"
        :icon="point.icon"
        :isSelected="Boolean(currentTrack) && Boolean(currentPoint)"
        :first="mode === 'narration' && point.isFirst"
        :invisible="
          isDetective &&
          mode === 'narration' &&
          !currentTrack &&
          !visitedTracks.includes(point.track._id) &&
          point.track.attributes?.isHidden
        "
        :faded="
          app === 'cnrs2' &&
          mode === 'narration' &&
          !currentTrack &&
          visitedTracks.includes(point.track._id)
        "
        :emphasis="
          app === 'cnrs2' &&
          mode === 'narration' &&
          !currentTrack &&
          point.track._id === nextTrackToVisit
        "
        :revealed="
          point._id === currentPoint?._id ||
          (isDetective &&
            !currentTrack &&
            !visitedTracks.includes(point.track._id) &&
            point.track.attributes?.isHidden &&
            checkVisibility(point))
        "
        :current="point._id === currentPoint?._id"
        @focus="currentPoint = point"
        @blur="currentPoint = null"
        @click="selectPoint(point)"
      />
    </template>

    <template v-if="isLoaded && mode === 'narration'">
      <Path
        v-for="(track, i) in tracks"
        :id="`${i}-track`"
        :steps="getTrackSteps(track)"
        :color="track?.attributes?.color"
        :visible="track === currentTrack"
        line
      />

      <Path
        v-for="(detour, i) in detours"
        :id="`${i}-detour`"
        :steps="getDetourSteps(detour)"
        :color="detour?.attributes?.color"
        :visible="detour.track === currentTrack"
        line
        dashed
      />
    </template>
  </Map>

  <Controls
    :controls="controls"
    :filterType="filterType"
    :filterCat="filterCat"
    :filterMus="filterMus"
    :hasDetectiveMode="hasDetectiveMode"
    @back="currentTrack = null"
    @help="isLearning = true"
    @toggleMode="toggleMode"
    @toggleAudio="toggleAudio"
    @toggleDetective="toggleDetective"
    @toggleFilters="toggleFilters"
    @resetFilter="(f) => (f === 'type' ? (filterType = []) : (filterCat = []))"
    @filter="(f, v) => toggleFilter(f, v)"
    @zoom="(v) => zoom(v)"
    @center="center"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { Map, Marker, Path } from "@/components/mapbox";
import { useStore } from "@/stores";
import { useRoute } from "vue-router";
import { getDistanceFromLatLon } from "@/utils/index";
import Notice from "@/components/notice/Notice.vue";
import Controls from "@/components/mapbox/Controls.vue";
import Tuto from "@/components/Tuto.vue";
import { useAudios } from "@/hooks/useAudios";
import { useStoreCategory } from "@owlabio/category-manager";

const categoriesStores = useStoreCategory();
const settingsStore = useStore("settings");
const playlistStore = useStore("playlist");
const trackStore = useStore("track");
const settings = computed(() => settingsStore.settings);
const app = computed(() => settingsStore.project);
const playlists = computed(() => playlistStore.list);

const currentPlaylist = computed(() => {
  return app.value === "cnrs1"
    ? {
        tracks: trackStore.list.filter(
          (t) => t.attributes.status === "published"
        ),
      }
    : playlists.value.find((p) => p._id === settings.value.playlist);
});

// const playlistSelected = currentPlaylist.value.

const tracks = computed(() => {
  return app.value === "cnrs1"
    ? currentPlaylist.value.tracks
    : trackStore.list.filter((t) =>
        currentPlaylist.value?.tracks?.includes(t._id)
      );
});
const hasDetectiveMode = computed(
  () => !!tracks.value.find((t) => t.attributes?.isHidden)
);
const visitedTracks = ref(
  window.localStorage.getItem("visitedTracks")
    ? JSON.parse(window.localStorage.getItem("visitedTracks"))
    : []
);
const nextTrackToVisit = ref(
  currentPlaylist.value?.tracks?.find((t) => !visitedTracks.value.includes(t))
);

const isLoaded = ref(false);
const mode = ref("narration");
const isDetective = ref(true);
const currentTrack = ref(null);
const currentPoint = ref(null);
const currentNav = ref({});
const currentNoticeId = ref(null);
const isLearning = ref(
  app.value === "cnrs2" && !window.localStorage.getItem("hasOnboarded")
);
const isReading = ref(false);
const isFiltersOpen = ref(false);
const mapRef = ref(null);
const mapZoom = ref(settings.value?.map?.zoom);
const hasAudio = ref(false);
const route = useRoute();

const myAudios = ref([]);
const inRange = ref([]);

categoriesStores.getRoots();

watch(
  tracks,
  () => {
    for (const track of tracks.value) {
      const found = myAudios.value.find((audio) => {
        return audio.id === track._id;
      });
      if (!found) {
        myAudios.value.push({
          url: track.attributes?.media?.url?.replaceAll("\\", "/"),
          id: track._id,
          distance: null,
        });
        inRange.value.push({
          id: track._id,
          distance: null,
        });
      }
    }
  },
  { immediate: true }
);

const hasMouse = ref(false);

const controls = computed(() => {
  return {
    back: !!currentTrack.value,
    filters: isFiltersOpen.value,
    mode: mode.value,
    isDetective: isDetective.value,
    audio: hasAudio.value,
  };
});

const categories = computed(() => {
  return categoriesStores.categories;

  // const bundle = [];

  // function extract(cat) {
  //   cat.children.forEach((child) => {
  //     bundle.push(child);
  //     child.children.length && extract(child);
  //   });
  // }

  // categoriesStores.categories.forEach((cat) => {
  //   bundle.push(cat);
  //   cat.children.length && extract(cat);
  // });

  // return bundle;
});

const filterCat = ref([]);
const filterType = ref([]);
const filterMus = ref([]);

useAudios(myAudios, mode, hasAudio, currentTrack);

const mapPoints = computed(() => {
  const points = [];

  tracks.value.forEach((t) => {
    t.children.forEach((p, i) => {
      points.push({
        ...p,
        color: t.attributes.color,
        track: t,
        isFirst: i === 0,
        isLast: i === t.children.length - 1,
        icon: getIcon(p),
      });
    });
  });

  const detourPoints = [];
  points.forEach((p) => {
    p.children.forEach((d) => {
      d.children.forEach((dp) => {
        const t = trackStore.findOne(p.parent);
        detourPoints.push({
          ...dp,
          color: t.attributes.color,
          track: t,
          icon: getIcon(p),
        });
      });
    });
  });

  return [...points, ...detourPoints];
});

const currentTrackPoints = computed(() => {
  if (!currentTrack.value) return [];

  const pointsInTrack = [];

  function extract(points) {
    points.forEach((p, i) => {
      p.context === "Point" &&
        pointsInTrack.push({
          ...p,
          isFirst: p.parent === currentTrack.value._id && i === 0,
          isLast:
            p.parent === currentTrack.value._id && i === points.length - 1,
          isDetour: p.parent !== currentTrack.value._id,
        });
      if (p.children?.length) extract(p.children);
    });
  }

  extract(currentTrack.value.children);
  return pointsInTrack;
});

const filteredPoints = computed(() => {
  if (
    !filterCat.value.length &&
    !filterType.value.length &&
    !filterMus.value.length
  )
    return mapPoints.value;

  return mapPoints.value.filter((p) => {
    const notice = p.attributes.notice;

    return (
      (!filterCat.value.length ||
        filterCat.value.some((cat) => notice?.categories.includes(cat))) &&
      (!filterType.value.length ||
        filterType.value.some((type) => notice?.mediaTypes.includes(type))) &&
      (!filterMus.value.length ||
        filterMus.value.some((mus) => p.track.attributes?.musician === mus))
    );
  });
});

const detours = computed(() => {
  const result = [];

  tracks.value.forEach((track, a) => {
    track.children.forEach((point, b) => {
      point.children.forEach((detour, c) => {
        result.push({
          attributes: {
            color: track.attributes.color,
            transparence: track.attributes.transparence,
          },
          track: track,
          index: b,
          children: detour.children,
        });
      });
    });
  });

  return result;
});

const findNode = (roots, id) => {
  let found;
  for (const root of roots) {
    found = walk(root, id);
    if (found) {
      return found;
    }
  }

  function walk(root, id) {
    if (root._id === id) return root;

    for (const child of root.children) {
      if (child._id === id) return child;
      else {
        found = walk(child, id);
        if (found) return found;
      }
    }
  }
};

// map user actions

function getIcon(point) {
  if (!point.attributes?.notice) return;

  if (!point.attributes?.notice?.categories?.length) return;

  const currentCategory = findNode(
    categories.value,
    point.attributes.notice.categories[0]
  );

  return currentCategory?.attributes?.icon;
}

function toggleMode() {
  if (mode.value === "narration") {
    currentTrack.value = null;
    currentNav.value = {};
    mode.value = "classic";
  } else {
    filterCat.value = [];
    filterType.value = [];
    isFiltersOpen.value = false;
    mode.value = "narration";
  }
}

function toggleAudio() {
  hasAudio.value = !hasAudio.value;
  if (settings.value.map.appAudio) {
    hasAudio.value
      ? document.getElementById("ambiance").play()
      : document.getElementById("ambiance").pause();
  }
}

function toggleDetective() {
  isDetective.value = !isDetective.value;
}

function toggleFilters() {
  isFiltersOpen.value = !isFiltersOpen.value;
}

function toggleFilter(filter, value) {
  const filterArray =
    filter === "cat" ? filterCat : filter === "type" ? filterType : filterMus;
  filterArray.value.includes(value)
    ? filterArray.value.splice(filterArray.value.indexOf(value), 1)
    : filterArray.value.push(value);
}

function zoom(direction) {
  direction === "in" ? mapZoom.value++ : mapZoom.value--;
}

function center() {
  const center = settings.value?.map?.center;
  const zoom = settings.value?.map?.zoom;

  if (center && zoom) {
    mapRef.value.flyTo({
      center: center,
      zoom: zoom,
    });
  }
}

function selectPoint(point) {
  if (mode.value === "narration") {
    if (!currentTrack.value) {
      // narration without track : select the track
      currentTrack.value = trackStore.findOne(point.track._id);
      currentPoint.value = point;
    } else {
      // narration with track : if the point is in the track, getNav details and open notice
      if (point.attributes.notice) {
        navigate("point", point);
        currentPoint.value = point;
      }
    }
  } else {
    // classic : select the point open notice
    if (point.attributes.notice) {
      currentNoticeId.value = point.attributes.notice._id;
      isReading.value = true;
    }
  }
}

function getNav(point) {
  const currentT = currentPlaylist.value?.tracks?.findIndex(
    (t) => t === currentTrack.value._id
  );
  const currentP = currentTrackPoints.value.findIndex(
    (p) => p._id === point._id
  );
  const reversePoints = [...currentTrackPoints.value].reverse();

  currentNav.value.current = point;
  currentNav.value.finish =
    currentT === currentPlaylist.value.tracks.length - 1 &&
    currentP === currentTrackPoints.value.length - 1;

  if (!point.isFirst) {
    currentNav.value.prevTrack = null;
    if (currentTrackPoints.value[currentP - 1]?.isDetour) {
      currentNav.value.prevDetour = currentTrackPoints.value[currentP - 1];
      currentNav.value.prevPoint = reversePoints.find(
        (p, i) => i > currentTrackPoints.value.length - currentP && !p.isDetour
      );
    } else {
      currentNav.value.prevPoint = currentTrackPoints.value[currentP - 1];
      currentNav.value.prevDetour = null;
    }
  } else {
    let prevTrackId = currentPlaylist.value.tracks[currentT - 1];
    currentNav.value.prevTrack = trackStore.findOne(prevTrackId);
    currentNav.value.prevPoint = null;
    currentNav.value.prevDetour = null;
  }

  if (!point.isLast) {
    currentNav.value.nextTrack = null;
    if (currentTrackPoints.value[currentP + 1]?.isDetour) {
      currentNav.value.nextDetour = currentTrackPoints.value[currentP + 1];
      currentNav.value.nextPoint = currentTrackPoints.value.find(
        (p, i) => i > currentP && !p.isDetour
      );
    } else {
      currentNav.value.nextPoint = currentTrackPoints.value[currentP + 1];
      currentNav.value.nextDetour = null;
    }
  } else {
    let nextTrackId =
      currentT === currentPlaylist.value.length - 1
        ? null
        : currentPlaylist.value.tracks[currentT + 1];
    currentNav.value.nextTrack = trackStore.findOne(nextTrackId);
    currentNav.value.nextPoint = null;
    currentNav.value.nextDetour = null;
  }
}

function setTravelLog() {
  !visitedTracks.value.includes(currentTrack.value._id) &&
    visitedTracks.value.push(currentTrack.value._id);
  window.localStorage.setItem(
    "visitedTracks",
    JSON.stringify(visitedTracks.value)
  );
}

function closeNotice() {
  currentNoticeId.value = null;
  isReading.value = false;

  if (settings.value.map.appAudio) {
    document.getElementById("ambiance").volume = 0.07;
  }
}

function navigate(type, destination) {
  isReading.value = false;

  if (type === "point") {
    getNav(destination);
    currentNoticeId.value = destination.attributes.notice._id;
    destination.isLast && setTravelLog();
    isReading.value = true;
    currentPoint.value = destination;

    if (settings.value.map.appAudio) {
      document.getElementById("ambiance").volume = 0;
    }
  } else {
    currentNav.value = {};
    currentTrack.value = trackStore.findOne(destination._id);
    currentPoint.value = destination.children[0];
  }
}

// map setup

function loadMap(state, map) {
  isLoaded.value = state;
  mapRef.value = map;
}

function listenMouseMove(event) {
  hasMouse.value = true;
}

function checkVisibility(point) {
  let currentDistance = inRange.value.find(
    (t) => t.id === point.track._id
  )?.distance;

  return currentDistance
    ? currentDistance <= settings.value.map.distanceMarker
    : false;
}

function checkAudio(event) {
  if (event.type === "drag" && hasMouse.value) return;
  if (currentTrack.value) return;

  let lat;
  let lng;

  /**
   * TODO
   * Detect if it's a mobile device in order to determine if we should be
   * strictly listening to the drag event or the mousemove
   */

  if (event.type === "drag" && !hasMouse.value) {
    const center = mapRef.value.getCenter();
    lat = center.lat;
    lng = center.lng;
  } else {
    const { lngLat } = event;
    lat = lngLat.lat;
    lng = lngLat.lng;
  }

  tracks.value.forEach((track) => {
    if (!track.children[0]) return;

    const point = track.children[0];
    const coords = point.attributes.coordinates;
    const distance = getDistanceFromLatLon(
      [coords[1], coords[0]],
      [lat, lng],
      "m"
    );
    const foundAudio = myAudios.value.find((a) => a.id === track._id);
    const foundEntry = inRange.value.find((t) => t.id === track._id);
    foundAudio.distance = distance;
    foundEntry.distance = distance;

    inRange.value = inRange.value.map((t) =>
      t.id === foundEntry.id ? foundEntry : t
    );

    if (!hasAudio.value) {
      stopAudio();
    } else {
      myAudios.value = myAudios.value.map((a) =>
        a.id === foundAudio.id ? foundAudio : a
      );
    }
  });
}

const stopAudio = () => {};

function getTrackSteps(track) {
  return track.attributes.transparence
    ? []
    : track.attributes.isWalking
    ? track.attributes.walkingPath
    : track.children.map((point) => point.attributes.coordinates);
}

function getDetourSteps(detour) {
  const steps = [detour.track.children[detour.index].attributes.coordinates];

  detour.children.forEach((detour, d) => {
    steps.push(detour.attributes?.coordinates);
  });

  steps.push(detour.track.children[detour.index + 1].attributes.coordinates);

  return detour.attributes.transparence ? [] : steps;
}

onMounted(() => {
  window.addEventListener("mousemove", listenMouseMove);
  route.query?.musician &&
    (currentTrack.value = tracks.value.find(
      (t) => t.attributes.musician === route.query.musician
    ));
});

onUnmounted(() => {
  stopAudio();
  window.removeEventListener("mousemove", listenMouseMove);
});
</script>

<style scoped>
.map-container {
  border: 0;
  grid-template-columns: auto 1fr !important;
  height: 100%;
}
</style>
