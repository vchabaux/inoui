<template>
  <div class="categories-tree">
    <form v-if="editable" class="flow-row category-add" @submit.prevent="createRoot">
      <el-input
        v-model="rootName"
        placeholder="Category name"
        aria-label="Category name"
        class="category-root-input"
      />
      <el-button type="primary" native-type="submit" :disabled="!rootName.trim()">Add</el-button>
      <el-button v-if="rootName" @click="rootName = ''">Cancel</el-button>
    </form>

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
import { computed, ref } from "vue";
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

const rootName = ref("");

async function createRoot() {
  const name = rootName.value.trim();
  if (!name) return;
  await categoryStore.createNode({ name, parentId: null, context: "Category" });
  rootName.value = "";
}
</script>

<style scoped>
.categories-tree {
  width: 100%;
}

.category-root-input {
  max-width: 40ch;
}
</style>
