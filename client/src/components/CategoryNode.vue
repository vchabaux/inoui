<template>
  <div>
    <div class="category-row" :class="{ '-favorite': favorite === node._id }">
      <!-- Icon picker button -->
      <Button
        v-if="icons"
        class="category-icon-btn"
        text
        size="small"
        :aria-label="'pick icon'"
        :title="'pick icon'"
        @click="$emit('pick-icon', node)"
      >
        <i v-if="node.attributes?.icon" :class="getIconClass(node.attributes.icon)" />
        <i v-else class="fa-solid fa-icons" />
      </Button>

      <!-- Rename mode -->
      <template v-if="isRenaming">
        <InputText
          v-model="renameValue"
          class="category-edit-input"
          autofocus
          @keyup.enter="confirmRename"
          @keyup.escape="cancelRename"
          @blur="confirmRename"
        />
      </template>

      <!-- Display name -->
      <Button
        v-else
        class="category-name-btn"
        text
        :class="{ '-favorite': favorite === node._id }"
        @click="$emit('select', node)"
      >
        {{ node.name }}
      </Button>

      <!-- Star button -->
      <Button
        v-if="favorite !== undefined"
        class="category-star-btn"
        text
        size="small"
        :class="{ '-active': favorite === node._id }"
        :aria-label="'star'"
        :title="'star'"
        @click="$emit('star', node)"
      >
        <i class="fa-solid fa-star" />
      </Button>

      <!-- Add child mode -->
      <template v-if="isAddingChild">
        <InputText
          v-model="newChildName"
          class="category-add-input"
          placeholder="New category name"
          autofocus
          @keyup.enter="confirmAddChild"
          @keyup.escape="cancelAddChild"
          @blur="confirmAddChild"
        />
      </template>

      <!-- Add child button -->
      <Button
        v-if="editable && !isAddingChild"
        class="category-add-btn"
        text
        size="small"
        :aria-label="'add child'"
        :title="'add child'"
        @click="startAddChild"
      >
        <i class="fa-solid fa-plus" />
      </Button>

      <!-- Rename button -->
      <Button
        v-if="editable && !isRenaming"
        class="category-edit-btn"
        text
        size="small"
        :aria-label="'rename'"
        :title="'rename'"
        @click="startRename"
      >
        <i class="fa-solid fa-pen" />
      </Button>

      <!-- Delete button -->
      <Button
        v-if="editable"
        class="category-delete-btn"
        text
        size="small"
        :aria-label="'delete'"
        :title="'delete'"
        @click="$emit('delete', node)"
      >
        <i class="fa-solid fa-trash-can" />
      </Button>
    </div>

    <!-- Children -->
    <ul v-if="node.children?.length" class="category-children">
      <li v-for="child in node.children" :key="child._id">
        <CategoryNode
          :node="child"
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
import { ref } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { useCategoryStore } from "@/stores/categories";

const props = defineProps({
  node: { type: Object, required: true },
  editable: { type: Boolean, default: false },
  icons: { type: Boolean, default: false },
  favorite: { type: String, default: "" },
});

const emit = defineEmits(["delete", "pick-icon", "star", "select"]);

const categoryStore = useCategoryStore();

const isRenaming = ref(false);
const renameValue = ref("");
const isAddingChild = ref(false);
const newChildName = ref("");

function startRename() {
  isRenaming.value = true;
  renameValue.value = props.node.name;
}

async function confirmRename() {
  if (renameValue.value.trim()) {
    await categoryStore.updateNode(props.node._id, { name: renameValue.value.trim() });
  }
  isRenaming.value = false;
  renameValue.value = "";
}

function cancelRename() {
  isRenaming.value = false;
  renameValue.value = "";
}

function startAddChild() {
  isAddingChild.value = true;
  newChildName.value = "";
}

async function confirmAddChild() {
  if (newChildName.value.trim()) {
    await categoryStore.createNode({
      name: newChildName.value.trim(),
      parentId: props.node._id,
      context: "Category",
    });
  }
  isAddingChild.value = false;
  newChildName.value = "";
}

function cancelAddChild() {
  isAddingChild.value = false;
  newChildName.value = "";
}

function getIconClass(icon) {
  if (!icon) return "";
  const style = icon.type === "regular" ? "fa-regular" : "fa-solid";
  return `${style} fa-${icon.name}`;
}
</script>

<style scoped>
.category-row {
  display: flex;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-2);
}

.category-row:hover {
  background: var(--color-element-neutral);
}

.category-row.-favorite {
  background: var(--color-element-neutral);
}

.category-name-btn {
  flex: 1;
  text-align: left;
  justify-content: flex-start;
}

.category-name-btn.-favorite {
  font-weight: bold;
}

.category-children {
  list-style: none;
  padding-inline-start: var(--size-6);
  margin: 0;
}

.category-edit-input {
  flex: 1;
  min-width: 100px;
}

.category-add-input {
  flex: 1;
  min-width: 100px;
	}
</style>