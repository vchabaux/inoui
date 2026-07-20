<template>
  <div class="variant-dash-title">
    <h1>Connection</h1>
  </div>

  <div v-if="error">
    <Voice type="error" :message="error.message" @close="error = null" />
  </div>

  <el-form
    class="stretched"
    label-position="top"
    @submit.prevent
    @keydown.enter="handleCredentials"
  >
    <el-form-item label="e-mail">
      <el-input id="email" type="email" v-model="user.email" autocomplete="email" />
    </el-form-item>
    <el-form-item label="password">
      <el-input id="password" type="password" v-model="user.password" autocomplete="current-password" />
    </el-form-item>

    <el-button class="w-full" @click="handleCredentials" :loading="submitting">
      {{ `${submitting ? "Connection en cours" : "Se connecter"}` }}
    </el-button>

    <div class="flow-row">
      <p>Mot de passe oublié ?</p>
      <router-link to="/password-forgotten" class="link-text">
        Réinitialiser
      </router-link>
    </div>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
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
