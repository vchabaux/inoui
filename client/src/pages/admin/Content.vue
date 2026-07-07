<template>
  <div class="flow-row-between variant-dash-title">
    <h1>Content</h1>
  </div>

  <DaTable class="fix-table" :data="pages" :columns="columnsContent" layout="1fr 1fr">
    <template #row-controls="{ item }">
      <router-link aria-label="edit" title="edit" class="link-outline text-sm" :to="`/admin/content/${item.slug}`">
        <i class="fa-solid fa-pen" />
      </router-link>
    </template>
  </DaTable>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "@/stores";
import DaTable from "@/components/DaTable.vue";
import {columnsContent} from "@/utils/columns";

const pageStore = useStore("page");
const settingsStore = useStore("settings");

const app = computed(() => settingsStore.project);
const pages = computed(() => pageStore.list.filter(p => app.value === 'cnrs1' ? p.slug !== 'itineraries' : p));
</script>
