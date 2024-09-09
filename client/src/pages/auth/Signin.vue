<template>
  <Container variant="dash-title">
    <h1>Connection</h1>
  </Container>

  <Container v-if="error">
    <Voice type="error" :message="error.message" @close="error = null" />
  </Container>

  <Container
    tag="form"
    stretched
    @prevent.submit
    @keydown.enter="handleCredentials"
  >
    <Field
      label="e-mail"
      type="email"
      v-model="user.email"
      autocomplete="email"
    />
    <Field
      label="password"
      type="password"
      v-model="user.password"
      autocomplete="current-password"
    />

    <Button wide @click="handleCredentials" :pending="submitting">
      {{ `${submitting ? "Connection en cours" : "Se connecter"}` }}
    </Button>

    <Container flow="row">
      <Text>Mot de passe oublié ?</Text>
      <Link class="link" path="/password-forgotten" variant="text">
        Réinitialiser
      </Link>
    </Container>
  </Container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Container, Field, Button, Link, Text } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import Voice from "@/components/Voice.vue";

const user = ref({
  email: "",
  password: "",
});

const submitting = ref(false);
const error = ref(null);
const router = useRouter();

const authStore = useStore("auth");

const handleCredentials = async () => {
  //TODO Try catch to display error messages in the form with app locales + Voice
  try {
    submitting.value = true;
    await authStore.signin(user.value);
    submitting.value = false;
    router.push("/admin");
  } catch (err) {
    submitting.value = false;
    if (err.response) {
      error.value = {
        message: err.response.data.message,
      };
    }
  }
};
</script>

<style scoped></style>
