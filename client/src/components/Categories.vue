<template>
  <div class="categories-tree">
    <div v-if="!categories.length" class="small-text text-fade">No categories yet</div>

    <ul v-else class="category-list">
      <li v-for="node in categories" :key="node._id" class="category-item">
        <CategoryNode
          :node="node"
          :editable="editable"
          :icons="icons"
          :favorite="favorite"
          @delete="(n) => $emit('delete', n)"
          @pick-icon="(n) => $emit('pick-icon', n)"
          @star="(n) => $emit('star', n)"
          @select="(n) => $emit('select', n)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useCategoryStore } from "@/stores/categories";
import CategoryNode from "./CategoryNode.vue";

const props = defineProps({
  editable: { type: Boolean, default: false },
  icons: { type: Boolean, default: false },
  favorite: { type: String, default: "" },
});

const emit = defineEmits(["delete", "pick-icon", "star", "select"]);

const categoryStore = useCategoryStore();
const categories = computed(() => categoryStore.categories);
</script>

<style scoped>
.categories-tree {
  width: 100%;
}
</style>
