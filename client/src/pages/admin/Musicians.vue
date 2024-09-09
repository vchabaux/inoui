<template>
  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteMusician" />

  <!-- Header -->
  <Container flow="row-between" variant="dash-title">
    <h1>Artists</h1>
    <Link path="/admin/musicians/new">New artist</Link>
  </Container>

  <!-- List -->
  <Datable :data="musicians" :columns="columnsMusicians" selectionKey="_id" layout="2fr 1fr 1fr">
    <template #row-controls="{ item }">
      <Link aria-label="edit" title="edit" size="s" variant="outline" :path="`/admin/musicians/${item._id}`">
        <Icon name="pen" />
      </Link>
      <Button aria-label="delete" title="delete" size="s" variant="outline" class="danger-btn" :pending="isSubmitting" @click="openDialogDelete(item._id)">
        <Icon name="trash-can" />
      </Button>
    </template>
  </Datable>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "@/stores";
import { Container, Button, Link, Icon } from "@owlabio/owl-ui";
import Datable from "@owlabio/da-table";
import { columnsMusicians } from "@/utils/columns";
import FormDelete from "@/components/forms/FormDelete.vue";

const musicianStore = useStore("musician");
const trackStore = useStore("track");
const musicians = computed(() => musicianStore.list);
const tracks = computed(() => trackStore.list);
const selectedMusician = ref(null);

const isDeleting = ref(false);
const isSubmitting = ref(false);

function openDialogDelete(musicianId) {
  selectedMusician.value = musicianId;
  isDeleting.value = true;
}

function clearThings() {
  selectedMusician.value = null;
  isDeleting.value = false;
}

async function deleteMusician() {
  isSubmitting.value = true;

  try {
    const extras = tracks.value.filter((track) => track.attributes?.musician === selectedMusician);

    await extras.forEach((patient) => {
      patient.attributes.musician = null;
      noticeStore.update(patient._id, patient);
    });

    await musicianStore.delete(selectedMusician.value);
  } catch (err) {
    console.err(err);
  } finally {
    isSubmitting.value = false;
    clearThings();
  }
}
</script>
