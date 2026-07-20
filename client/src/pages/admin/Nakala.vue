<template>
  <div class="flow-row-between variant-dash-title">
    <h1>Données Nakala</h1>
    <el-button @click="handleAddMedia">New data</el-button>
  </div>

  <el-dialog :model-value="isFormNakalaOpen" @close="clear">
    <template #header>
      <div class="variant-dash-title">
        <h2>Add files</h2>
      </div>
    </template>

    <div class="upload-forms">
      <FormAssetNakala
        :dataId="dataToEdit"
        @upload="isFormNakalaOpen = false"
      />
    </div>
  </el-dialog>

  <Voice
    v-if="error"
    :closable="true"
    @close="error = null"
    :type="error.type"
    :message="error.message"
  />

  <Datable
    class="fix-table"
    :data="nakalaData"
    :columns="columnsNakala"
    :emptyMessage="tableMessage"
    layout="2fr 1fr 1fr 1fr"
    :expandable="true"
  >
    <template #details="{ item }">
      <div>
        <template v-for="$value in item.files" :key="$value.sha1">
          <div class="flow-row">
            <span>{{ $value.name }}</span>

            <img
              size="small"
              :src="$value.url"
              alt="file"
            />

            <el-button
              size="small"
              aria-label="delete"
              title="delete"
              @click="handleDeleteFile(item, $value)"
            >
              <i class="fa-solid fa-trash-can" />
            </el-button>
          </div>
        </template>
      </div>
    </template>

    <template #row-controls="{ item }">
      <el-button
        size="small"
        aria-label="edit"
        title="edit"
        @click="handleEdit(item)"
      >
        <i class="fa-solid fa-pen" />
      </el-button>
    </template>
  </Datable>
</template>

<script setup>
import { ref, computed } from "vue";
import Datable from "@/components/DaTable.vue";
import { columnsNakala } from "@/utils/columns";
import FormAssetNakala from "@/components/forms/FormAssetNakala.vue";
import { useStore } from "@/stores";
import { handleError } from "@/utils";
import Voice from "@/components/Voice.vue";
const nakalaStore = useStore("nakala");

nakalaStore.initialize();

const isFormNakalaOpen = ref(false);
const dataToEdit = ref(null);
const error = ref(null);

const storeLoading = computed(() => nakalaStore.loading);

const nakalaData = computed(() => nakalaStore.datas);

const tableMessage = computed(() => (storeLoading.value ? "Loading..." : "-"));

function handleEdit(item) {
  dataToEdit.value = item.identifier;
  isFormNakalaOpen.value = true;
}

async function handleDeleteFile(data, file) {
  try {
    await nakalaStore.deleteFile(data, file.sha1);
  } catch (err) {
    error.value = handleError(err);
  }
}

function clear() {
  dataToEdit.value = null;
  isFormNakalaOpen.value = false;
}

function handleAddMedia() {
  isFormNakalaOpen.value = true;
}
</script>

<style scoped>
:deep(form) {
  width: 100% !important;
}
</style>
