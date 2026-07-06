<template>
  <div class="variant-dash-title">
    <h1>Confirmation</h1>
  </div>

  <p>Félicitations ! Votre compte a bien été créé</p>

  <router-link to="/auth/signin" class="w-full">Se connecter</router-link>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/api/axios";

const route = useRoute();
const router = useRouter();

const submit = async (token) => {
  try {
    const response = await api.patch("/account/email", { token });
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
    // TODO Check what's up to display correct error message / status
  }
};

onMounted(async () => {
  const token = route.query.token;
  if (!token) return router.push("/");

  submit(token);
});
</script>

<style scoped></style>
