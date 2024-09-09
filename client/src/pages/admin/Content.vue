<template>
  <Container flow="row-between" variant="dash-title">
    <h1>Content</h1>
  </Container>

  <DaTable class="fix-table" :data="pages" :columns="columnsContent" layout="1fr 1fr">
    <template #row-controls="{ item }">
      <Link aria-label="edit" title="edit" variant="outline" size="s" :path="`/admin/content/${item.slug}`">
        <Icon name="pen" />
      </Link>
    </template>
  </DaTable>
</template>

<script setup>
import { computed } from "vue";
import { Link, Container, Icon } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import DaTable from "@owlabio/da-table";
import {columnsContent} from "@/utils/columns";

const pageStore = useStore("page");
const settingsStore = useStore("settings");

const app = computed(() => settingsStore.project);
const pages = computed(() => pageStore.list.filter(p => app.value === 'cnrs1' ? p.slug !== 'itineraries' : p));
</script>
