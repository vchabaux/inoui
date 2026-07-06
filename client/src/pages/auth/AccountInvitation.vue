<template>
  <div class="variant-dash-title">
    <h1>Bienvenue</h1>
  </div>

  <Voice v-if="error" :message="error.message" type="error" @close="error = null" />

  <p class="small-text">Veuillez créer votre mot de passe afin de continuer</p>
  <router-link v-if="showResetLink" to="/password-forgotten" class="w-full"> Renvoyer un lien par e-mail </router-link>

  <form @submit.prevent class="stretched">
    <label>Mot de passe</label>
    <InputText v-model="password" type="password" />
    <label>Confirmer le mot de passe</label>
    <InputText v-model="confirmPassword" type="password" />
    <Button class="w-full" :loading="submitting" @click="handleSubmit">Valider</Button>
  </form>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Voice from "@/components/Voice.vue";
import { api } from "@/api/axios";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

const route = useRoute();
const router = useRouter();

const error = ref(null);
const submitting = ref(false);
const showResetLink = ref(false);

const password = ref("");
const confirmPassword = ref("");

const handleSubmit = async () => {
  try {
    submitting.value = true;
    const data = {
      token: route.query.token,
      password: password.value,
    };

    if (password.value !== confirmPassword.value) {
      error.value = { status: 400, message: "Les mots de passe ne correspondent pas." };
      return;
    }

    await api.patch("/account/password", data);
    submitting.value = false;

    router.push("/auth/signin");
  } catch (err) {
    error.value = { status: err.response.status, message: err.response.data.message };
    submitting.value = false;

    if (err.response.status === 400) {
      showResetLink.value = true;
    }
  }
};

onMounted(() => {
  const { token } = route.query;
  if (!token) return router.push("/"); // Redirect to home page
});
</script>
