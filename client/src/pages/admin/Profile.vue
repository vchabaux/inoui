<template>
  <!-- update email dialog -->
  <Dialog v-model:visible="isFormEmail" modal @hide="isFormEmail = false">
    <template #header>
      <h2>Update email</h2>
    </template>

    <form class="stretched">
      <template v-if="tokenSent">
        <p>Enter the code received by email</p>
        <InputText label="Code" type="text" v-model="verificationCode" />
        <Button @click="submitCode">Validate</Button>
      </template>

      <template v-else>
        <InputText label="New email" type="email" v-model="email" autocomplete="email" />
        <Button @click="sendToken">Validate</Button>
      </template>
    </form>
  </Dialog>

  <!-- update password dialog -->
  <Dialog v-model:visible="isFormPassword" modal @hide="clear">
    <template #header>
      <h2>Update password</h2>
    </template>

    <form class="stretched">
      <InputText label="current password" type="password" v-model="password" autocomplete="current-password" />
      <InputText label="new password" type="password" v-model="newPassword" autocomplete="new-password" />

      <Button :loading="isSubmittingPassword" @click="updatePassword"> Submit </Button>
    </form>
  </Dialog>

  <div class="flow-row-between variant-dash-title">
    <h1>Profile</h1>
    <Button @click="handleSignout">Sign out</Button>
  </div>

  <form class="width-s centered stretched">
    <h2>Account information</h2>
    <InputText label="name" type="text" v-model="user.name" />
    <InputText label="email" type="email" v-model="user.email" disabled />
  </form>

  <form class="flow-row actions width-s centered stretched">
    <Button outlined @click="promptEmailForm">Update email</Button>
    <Button outlined @click="promptPasswordDialog"> Update password </Button>
  </form>

  <form class="width-s centered stretched">
    <Button :loading="isSubmitting" class="w-full" @click="updateUser"> Save changes </Button>
  </form>

  <span v-if="currentUser.expiresAt">Your account is active until: {{ formatDateLong(currentUser.expiresAt) }}</span>
  <span v-if="currentUser.expiresAt">Only an administrator can change the expiration date</span>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { formatDateLong } from "@/utils/time";
import { useStore } from "@/stores";
import Voice from "@/components/Voice.vue";
const authStore = useStore("auth");

const currentUser = computed(() => authStore.currentUser);
const tokenSent = computed(() => authStore.mailRequestOnGoing);

const isFormPassword = ref(false);
const isFormEmail = ref(false);

const user = ref({
  name: currentUser.value?.name || "",
  email: currentUser.value?.email || "",
});

const password = ref("");
const newPassword = ref("");

const isSubmittingPassword = ref(false);

const verificationCode = ref("");

const email = ref("");

const isSubmitting = ref(false);

function handleSignout() {
  authStore.signout();
}

async function updatePassword() {
  try {
    if (!password.value || !newPassword.value) return;

    await authStore.updatePassword(password.value, newPassword.value);
  } catch (err) {
    // TODO Voice
  } finally {
    isFormPassword.value = false;
  }
}

function clear() {
  password.value = "";
  isFormPassword.value = false;
}

function promptPasswordDialog() {
  isFormPassword.value = true;
}

async function promptEmailForm() {
  isFormEmail.value = true;
}

onMounted(() => {
  authStore.getToken();
});

async function sendToken() {
  await authStore.sendMailToken(email.value);
}

async function submitCode() {
  await authStore.validateCode(verificationCode.value);
}

async function updateUser() {
  isSubmitting.value = true;
  try {
    await authStore.updateName(user.value.name);
  } catch (err) {
    // TODO Voice
  } finally {
    setTimeout(() => {
      isSubmitting.value = false;
    }, 500);
  }
}
</script>

<style scoped>
.actions > * {
  flex: 1;
}

dialog button {
  align-self: end;
}
</style>
