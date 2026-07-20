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

        <a :href="'/' + ''" target="_blank" class="app-link w-full">
          Open app
          <i class="fa-solid fa-arrow-up-right-from-square" />
        </a>

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
  background-color: var(--color-surface-neutral);
  border-inline-end: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  padding: var(--size-4);
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.sidebar-header {
  padding-block-end: var(--size-4);
  border-block-end: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
}

.sidebar-title {
  font-size: var(--size-5);
  font-weight: bold;
  color: var(--color-text-neutral);
  text-decoration: none;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}

.sidebar-link {
  padding: var(--size-2) var(--size-4);
  border-radius: var(--app-radius, var(--radius-2));
  color: var(--color-text-neutral);
  text-decoration: none;
}

.sidebar-link:hover {
  background-color: var(--color-element-neutral);
}

.sidebar-link.-active {
  background-color: var(--color-full-accent);
  color: var(--color-text-inverted);
}

.sidebar-footer {
  border-block-start: var(--app-border, var(--border-1)) solid var(--color-border-neutral);
  padding-block-start: var(--size-4);
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.dashboard-content {
  padding: var(--size-8);
  overflow-y: auto;
}

.notifications {
  gap: var(--size-1);
}

.app-link {
  justify-content: center;
}
</style>
