<template>
  <Container flow="row-between" variant="dash-title">
    <h1>Données Nakala</h1>
    <Button @click="handleAddMedia">New data</Button>
  </Container>

  <Dialog id="form-nakala" modal @close="clear" :open="isFormNakalaOpen">
    <Container variant="dash-title">
      <Text tag="h2">Add files</Text>
    </Container>

    <Container class="upload-forms">
      <FormAssetNakala
        :dataId="dataToEdit"
        @upload="isFormNakalaOpen = false"
      />
    </Container>
  </Dialog>

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
      <Container>
        <Each :data="item.files" v-slot="{ $value }">
          <Container flow="row">
            <Text>{{ $value.name }}</Text>

            <Thumbnail
              size="s"
              variant="contain"
              :type="$value.mediaType"
              :src="$value.url"
            >
            </Thumbnail>

            <Button
              size="s"
              aria-label="delete"
              title="delete"
              @click="handleDeleteFile(item, $value)"
            >
              <Icon name="trash-can" />
            </Button>
          </Container>
        </Each>
      </Container>
    </template>

    <template #row-controls="{ item }">
      <Button
        variant="outline"
        size="s"
        aria-label="edit"
        title="edit"
        @click="handleEdit(item)"
      >
        <Icon name="pen" />
      </Button>
    </template>
  </Datable>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Container,
  Button,
  Icon,
  Dialog,
  Thumbnail,
  Text,
} from "@owlabio/owl-ui";
import Datable from "@owlabio/da-table";
import { columnsNakala } from "@/utils/columns";
import FormAssetNakala from "@/components/forms/FormAssetNakala.vue";
import { useStore } from "@/stores";
import { Each } from "@owlabio/each-vue";
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
:deep(.owl-dialog-content) {
  width: min(100ch, calc(100vw - 2rem)) !important;
}

:deep(form) {
  width: 100% !important;
}
</style>
