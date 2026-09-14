<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link :to="home.path" class="sidebar-title">{{ home.name }}</router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link v-for="link in links" :key="link.path" :to="link.path" class="sidebar-link" active-class="-active">{{ link.name }}</router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="notifications flow-column" v-if="hasNotifications">
          <router-link to="/admin/tracks" class="link-text text-sm" v-if="pending.tracks">
            <i class="fa-solid fa-bell" />
            {{ pending.tracks }} tracks
          </router-link>
          <router-link to="/admin/notices" class="link-text text-sm" v-if="pending.notices">
            <i class="fa-solid fa-bell" />
            {{ pending.notices }} notices
          </router-link>
        </div>

        <router-link to="/" target="_blank" class="link-plain w-full app-link">
          Open app
          <i class="fa-solid fa-arrow-up-right-from-square" />
        </router-link>

        <div class="flow-row-between">
          <router-link to="/admin/profile" class="link-text">
            {{ user.name }}
            {{ !fullTimeAccount && expiresIn < 30 ? ` (${expiresIn}d left)` : "" }}
          </router-link>

          <el-button aria-label="sign out" title="sign out" @click="signout" text>
            <i class="fa-solid fa-arrow-right-from-bracket" />
          </el-button>
        </div>
      </div>
    </aside>

    <main class="dashboard-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";
import { getDateDiff } from "@/utils/time";

const authStore = useStore("auth");
const noticeStore = useStore("notice");
const trackStore = useStore("track");
const settingsStore = useStore("settings");

const settings = computed(() => settingsStore.settings);
const app = computed(() => settingsStore.project);
const user = computed(() => authStore.currentUser);
const isAdmin = computed(() => user.value.role.includes("admin"));
const fullTimeAccount = computed(() => !user.value.expiresAt);
const expiresIn = computed(() => getDateDiff(user.value.expiresAt, new Date()));
const hasNotifications = computed(() => (isAdmin && pending.value.tracks) || pending.value.notices);

const home = computed(() => {
  return {
    name: settings.value.name,
    path: "/admin",
  };
});

const links = [
  { name: "Tracks", path: "/admin/tracks" },
  { name: "Notices", path: "/admin/notices" },
  { name: "Categories", path: "/admin/categories" },
];

app.value === "cnrs1" ? links.unshift({ name: "Artists", path: "/admin/musicians" }) : links.unshift({ name: "Playlists", path: "/admin/playlists" });

app.value === "cnrs1" ? links.push({ name: "Nakala", path: "/admin/nakala" }) : links.push({ name: "Medias", path: "/admin/medias" });

isAdmin.value &&
  links.push(
    { name: "Users", path: "/admin/users" },
    { name: "Content", path: "/admin/content" },
    { name: "Settings", path: "/admin/settings" },
    { name: "Icons", path: "/admin/icons" }
  );

const pending = computed(() => {
  return {
    tracks: trackStore.list.filter((p) => p.status === "pending").length,
    notices: noticeStore.list.filter((n) => n.status === "pending").length,
  };
});

function signout() {
  authStore.signout();
}
</script>

<style>
.-end {
  justify-content: end;
}

.-equal {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
}

.-astart {
  align-items: flex-start !important;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background-color: var(--color-surface-accent);
  border-inline-end: var(--app-border, var(--border-1)) solid var(--color-border-accent);
  padding: var(--size-4);
  display: flex;
  flex-direction: column;
  gap: var(--size-8);
}

.sidebar-header {
  background-color: var(--color-surface-accent);
}

.sidebar-title {
  font-size: var(--size-8);
  font-weight: 700;
  color: var(--color-text-neutral);
  text-decoration: none;
}

.sidebar-nav {
  flex: 1;
  display: grid;
  align-content: flex-start;
  gap: var(--size-1);
}

.sidebar-link {
  width: max-content;
  max-width: 100%;
  padding: var(--size-2) var(--size-4);
  border-radius: var(--app-radius, var(--radius-2));
  color: var(--color-text-neutral);
  text-decoration: none;
  transition: background-color .15s ease-in-out;
}

.sidebar-link:hover {
  background-color: var(--color-layer-hover);
}

.sidebar-link.-active {
  font-weight: bold;
  background-color: var(--color-element-neutral);
}

.sidebar-footer {
  border-block-start: var(--app-border, var(--border-1)) solid var(--color-border-accent);
  border-inline-end: var(--app-border, var(--border-1)) solid var(--color-border-accent);
  padding: var(--size-4) var(--size-4) var(--size-6);
  margin-inline-end: calc(-1 * var(--size-4));
  margin-block-start: var(--size-4);
  display: grid;
  gap: var(--size-4);
}

.dashboard-content {
  padding: var(--size-6) var(--size-8);
  display: grid;
  gap: var(--size-8);
  align-content: flex-start;
  overflow-y: auto;
}

.notifications {
  gap: var(--size-1);
}

.app-link {
  justify-content: center;
}
</style>
