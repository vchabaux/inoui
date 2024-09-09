<template>
  <Container flow="row-between" variant="dash-title">
    <h1>Categories</h1>
  </Container>

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
import { computed, ref } from "vue";
import { Container } from "@owlabio/owl-ui";
import { Categories, useStoreCategory } from "@owlabio/category-manager";
import { IconPicker } from "@owlabio/icon-manager/client";
import { useStore } from "@/stores";


const noticeStore = useStore("notice");
const storeCategory = useStoreCategory();

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
}
</script>

<style scoped>
#category-manager {
  width: 100%;
}

:deep(.owl-container > .owl-button:nth-of-type(4)) {
  color: crimson !important;
}
</style>
