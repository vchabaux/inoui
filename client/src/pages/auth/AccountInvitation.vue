<template>
  <Container variant="dash-title">
    <h1>Bienvenue</h1>
  </Container>

  <Voice v-if="error" :message="error.message" type="error" @close="error = null" />

  <Text class="small-text">Veuillez créer votre mot de passe afin de continuer</Text>
  <Link v-if="showResetLink" wide path="/password-forgotten"> Renvoyer un lien par e-mail </Link>

  <Container tag="form" @submit.prevent stretched>
    <Field v-model="password" type="password" label="Mot de passe" />
    <Field v-model="confirmPassword" type="password" label="Confirmer le mot de passe" />
    <Button wide :pending="submitting" @click="handleSubmit">Valider</Button>
  </Container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Voice from "@/components/Voice.vue";
import { Container, Field, Button, Link, Text } from "@owlabio/owl-ui";
import { api } from "@/api/axios";

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
