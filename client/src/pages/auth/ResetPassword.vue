<template>
  <div class="variant-dash-title">
    <h1>Réinitialiser le mot de passe</h1>
  </div>

  <p class="small-text" v-if="!hasToken">No token provided</p>

  <form @submit.prevent class="stretched">
    <label for="password">Mot de passe</label>
    <InputText
      id="password"
      v-model="password"
      type="password"
      autocomplete="new-password"
    />
    <label for="confirmPassword">Confirmer le mot de passe</label>
    <InputText
      id="confirmPassword"
      v-model="confirmPassword"
      type="password"
      autocomplete="new-password"
    />
  </form>

  <Button class="w-full" :loading="submitting" @click="handleSubmit">Valider</Button>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/api/axios";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

const route = useRoute();
const router = useRouter();

const error = ref(null);
const submitting = ref(false);
const submitted = ref(false);

const password = ref("");
const confirmPassword = ref("");

// TODO Maybe make request once the component is mounted to check if the token has expired or not ??
const hasToken = computed(() => {
  return !!route.query.token;
});

// TODO Check if user is logged in, if he's logged in, redirect him to the dashboard or landing page.
const handleSubmit = async () => {
  try {
    submitting.value = true;

    if (password.value !== confirmPassword.value) {
      error.value = {
        status: 400,
        message: "Les mots de passe ne correspondent pas.",
      };
      return;
    }

    const data = {
      token: route.query.token,
      password: password.value,
    };

    await api.patch("/account/password", data);
    router.push("/auth/signin");
  } catch (err) {
    submitted.value = false;
    error.value = {
      status: err.response.status,
      message: err.response.data.message,
    };
  } finally {
    submitting.value = false;
  }
};
</script>
