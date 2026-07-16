<template>
  <div class="variant-dash-title">
    <h1>Connection</h1>
  </div>

  <div v-if="error">
    <Voice type="error" :message="error.message" @close="error = null" />
  </div>

  <form
    class="stretched"
    @submit.prevent
    @keydown.enter="handleCredentials"
  >
    <label for="email">e-mail</label>
    <InputText
      id="email"
      type="email"
      v-model="user.email"
      autocomplete="email"
    />
    <label for="password">password</label>
    <InputText
      id="password"
      type="password"
      v-model="user.password"
      autocomplete="current-password"
    />

    <Button class="w-full" @click="handleCredentials" :loading="submitting">
      {{ `${submitting ? "Connection en cours" : "Se connecter"}` }}
    </Button>

    <div class="flow-row">
      <p>Mot de passe oublié ?</p>
      <router-link to="/password-forgotten" class="link-text">
        Réinitialiser
      </router-link>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/stores";
import Voice from "@/components/Voice.vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

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
