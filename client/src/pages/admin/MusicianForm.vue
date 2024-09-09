<template>
  <Dialog v-if="selectingImage" id="assets" modal :open="selectingImage" @close="clear">
    <Medias picker @select="handleMedia" mediaType="image" />
  </Dialog>

  <Container flow="row-between" variant="dash-title">
    <h1>{{ isUpdate ? currentMusician?.name : "New musician" }}</h1>
  </Container>

  <Container tag="form" width="s" stretched centered>
    <h2>Artist information</h2>

    <!-- FIELDS -->
    <Field type="text" name="name" label="Name" v-model="musician.name" required />
    <Field type="textarea" name="description" label="Description" v-model="musician.description" />
    <Field type="email" name="name" label="E-mail" v-model="musician.contact.email" />
    <Field type="tel" name="name" label="Phone number" v-model="musician.contact.phone" />

    <Container flow="row" class="file-btns">
      <Container>
        <Button wide @click="getImage('main')">
          <template #start><Icon type="far" name="image" /></template>
          Image 1
        </Button>

        <Image :src="musician.pictures.main" />
      </Container>

      <Container>
        <Button wide @click="getImage('secondary')">
          <template #start><Icon type="far" name="image" /></template>
          Image 2
        </Button>

        <Image :src="musician.pictures.secondary" />
      </Container>
    </Container>
  </Container>

  <!-- IMAGE PREVIEW -->

  <Container width="s" centered>
    <Button wide @click="saveMusician" :pending="isSubmitting"> Save changes </Button>
  </Container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores";
import { Dialog, Container, Field, Button, Icon, Text, Image } from "@owlabio/owl-ui";
import Medias from "@/pages/admin/Medias.vue";
const musicianStore = useStore("musician");
const router = useRouter();
const route = useRoute();

const isSubmitting = ref(false);
const selectingImage = ref(false);
const currentImageKey = ref("");

const isUpdate = computed(() => !!route.params.id);

const currentMusician = computed(() => musicianStore.findOne(route.params.id));
const musician = ref({
  name: currentMusician.value?.name || "",
  pictures: {
    main: currentMusician.value?.pictures?.main || "",
    secondary: currentMusician.value?.pictures?.secondary || "",
  },
  description: currentMusician.value?.description || "",
  contact: {
    email: currentMusician.value?.contact?.email || "",
    phone: currentMusician.value?.contact?.phone || "",
  },
});

function handleMedia(image) {
  musician.value.pictures[currentImageKey.value] = image.url;
  clear();
}

function getImage(key) {
  currentImageKey.value = key;
  selectingImage.value = true;
}

function clear() {
  currentImageKey.value = "";
  selectingImage.value = false;
}

async function saveMusician() {
  musician.value.name === "" && (musician.value.name = "Untitled");

  try {
    isSubmitting.value = true;
    if (isUpdate.value) {
      await musicianStore.update(route.params.id, musician.value);
    } else {
      await musicianStore.create(musician.value);
    }
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
    router.push("/admin/musicians");
  }
}
</script>

<style scoped>
.file-btns {
  margin-block-start: var(--size-4);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: flex-start;
}

.file-btns .owl-button {
  justify-content: center;
}
</style>
