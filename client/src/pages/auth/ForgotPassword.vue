<template>
  <Container variant="dash-title">
    <h1>Réinitialiser le mot de passe</h1>
  </Container>

  <Text class="small-text" v-if="submitted">
    Un e-mail contenant un lien vers le formulaire de réinitialisation de mot de
    passe vous a été envoyé.
  </Text>

  <Container tag="form" @submit.prevent stretched>
    <Field v-model="email" label="Email" type="email" autocomplete="email" />
  </Container>

    <Button wide :pending="submitting" @click="handleSubmit">Valider</Button>
</template>

<script setup>
import { ref } from "vue";
import { Container, Button, Field, Text } from "@owlabio/owl-ui";
import { api } from "@/api/axios";

const error = ref(null);
const submitting = ref(false);
const submitted = ref(false);

const email = ref("");

const handleSubmit = async () => {
  try {
    submitting.value = true;
    const data = { email: email.value };
    const response = await api.post("/account/password", data);

    submitting.value = false;
    submitted.value = true;
  } catch (err) {
    submitting.value = false;
    error.value = {
      status: err.response.status,
      message: err.response.data.message,
    };
    console.error(err);
  }
};
</script>
