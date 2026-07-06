<template>
  <Dialog v-if="selectingImage" v-model:visible="selectingImage" modal @hide="clear">
    <Medias picker @select="handleMedia" mediaType="image" />
  </Dialog>

  <div class="flow-row-between variant-dash-title">
    <h1>{{ isUpdate ? currentMusician?.name : "New musician" }}</h1>
  </div>

  <form class="width-s stretched centered">
    <h2>Artist information</h2>

    <!-- FIELDS -->
    <InputText type="text" name="name" label="Name" v-model="musician.name" required />
    <Textarea name="description" label="Description" v-model="musician.description" />
    <InputText type="email" name="name" label="E-mail" v-model="musician.contact.email" />
    <InputText type="tel" name="name" label="Phone number" v-model="musician.contact.phone" />

    <div class="flow-row file-btns">
      <div>
        <Button class="w-full" @click="getImage('main')">
          <i class="fa-regular fa-image" />
          Image 1
        </Button>

        <img :src="musician.pictures.main" alt="main" />
      </div>

      <div>
        <Button class="w-full" @click="getImage('secondary')">
          <i class="fa-regular fa-image" />
          Image 2
        </Button>

        <img :src="musician.pictures.secondary" alt="secondary" />
      </div>
    </div>
  </form>

  <div class="width-s centered">
    <Button class="w-full" @click="saveMusician" :loading="isSubmitting"> Save changes </Button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/stores";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
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
</style>
