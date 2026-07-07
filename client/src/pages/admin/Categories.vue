<template>
  <div class="flow-row-between variant-dash-title">
    <h1>Categories</h1>
  </div>

  <Categories
    editable
    :icons="true"
    @delete="deleteCategory"
    @pick-icon="handleIconPickerOpen"
  />

  <IconPicker
    :open="showPicker"
    @close="handleIconPickerClose"
    @select="handleIconSelect"
  />
</template>

<script>
export default {
  name: "PageCategory",
};
</script>

<script setup>
import { computed, ref, onMounted } from "vue";
import Categories from "@/components/Categories.vue";
import IconPicker from "@/components/IconPicker.vue";
import { useCategoryStore } from "@/stores/categories";
import { useStore } from "@/stores";


const noticeStore = useStore("notice");
const storeCategory = useCategoryStore();

//state
const showPicker = ref(false);
const currentCategoryId = ref(null);

// computation
const notices = computed(() => noticeStore.list);

// methods

function handleIconPickerOpen(node) {
  showPicker.value = true;
  currentCategoryId.value = node._id;
}

function handleIconPickerClose() {
  showPicker.value = false;
  currentCategoryId.value = null;
}

function handleIconSelect(icon) {
  try {
    storeCategory.updateNode(currentCategoryId.value, {
      attributes: { icon: icon },
    });
  } catch (err) {
    console.log(err);
  } finally {
    showPicker.value = false;
  }
}

async function deleteCategory(category) {
  const extras = notices.value.filter((notice) =>
    notice.categories.includes(category._id)
  );
  await extras.forEach((patient) => {
    patient.categories = patient.categories.filter((c) => c !== category._id);
    noticeStore.update(patient._id, patient);
  });
  await storeCategory.deleteNode(category._id);
}

onMounted(() => {
  storeCategory.initialize();
});
</script>

<style scoped>
#category-manager {
  width: 100%;
}
</style>
