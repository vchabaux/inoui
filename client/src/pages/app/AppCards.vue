<template>
  <div class="width-l app-page">
    <!-- Preview dialog -->
    <Notice v-if="isOpen" :noticeId="currentNoticeId" :open="isOpen" @close="isOpen = false" />

    <h1 class="color-title">Fiches pédagogiques</h1>

    <ul class="stretched">
      <li v-for="card in cards">
        <Button class="card w-full" text @click="previewNotice(card._id)">
          <span>{{ card.title }}</span>
        </Button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "@/stores";
import { useStoreCategory } from "@owlabio/category-manager";
import Notice from "@/components/notice/Notice.vue";
import Button from "primevue/button";

const settingsStore = useStore("settings");
const noticeStore = useStore("notice");
const categoryStore = useStoreCategory();

const app = computed(() => settingsStore.project);

const indexCat = computed(() => {
  const bundle = [];

  function extract(cat) {
    cat.children.forEach((child) => {
      bundle.push(child);
      child.children.length && extract(child);
    });
  }

  categoryStore.categories.forEach((cat) => {
    bundle.push(cat);
    cat.children.length && extract(cat);
  });

  return bundle.find((c) => app.value === 'cnrs1' ? c.name === "fiche pédagogique" : c.name === "fiche pédago");
});

const cards = computed(() => noticeStore.list.filter((n) => {
  return n.categories.find(c => c._id === indexCat.value?._id);
}));

const isOpen = ref(false);
const currentNoticeId = ref(null);

function previewNotice(id) {
  currentNoticeId.value = id;
  isOpen.value = true;
}

categoryStore.getRoots();
</script>

<style scoped>
:global(main) {
  overflow-y: auto;
}

ul {
  gap: 0 !important;
}

.card {
  justify-content: start;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  border-color: var(--color-text-neutral);
}
</style>
