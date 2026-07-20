<template>
  <div class="variant-dash-title">
    <h1>Réinitialiser le mot de passe</h1>
  </div>

  <p class="small-text" v-if="submitted">
    Un e-mail contenant un lien vers le formulaire de réinitialisation de mot de
    passe vous a été envoyé.
  </p>

  <el-form label-position="top" @submit.prevent>
    <el-form-item label="Email">
      <el-input id="email" v-model="email" type="email" autocomplete="email" />
    </el-form-item>
    <el-button class="w-full" :loading="submitting" @click="handleSubmit">Valider</el-button>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
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
