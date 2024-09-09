<template>
  <!-- update email dialog -->
  <Dialog modal :open="isFormEmail" id="email-form" @close="isFormEmail = false">
    <template #header>
      <Text tag="h2">Update email</Text>
    </template>

    <Container tag="form" stretched>
      <template v-if="tokenSent">
        <p>Enter the code received by email</p>
        <Field label="Code" type="text" v-model="verificationCode" />
        <Button @click="submitCode">Validate</Button>
      </template>

      <template v-else>
        <Field label="New email" type="email" v-model="email" autocomplete="email" />
        <Button @click="sendToken">Validate</Button>
      </template>
    </Container>
  </Dialog>

  <!-- update password dialog -->
  <Dialog modal :open="isFormPassword" id="password-form" @close="clear">
    <template #header>
      <Text tag="h2">Update password</Text>
    </template>

    <Container tag="form" stretched>
      <Field label="current password" type="password" v-model="password" autocomplete="current-password" />
      <Field label="new password" type="password" v-model="newPassword" autocomplete="new-password" />

      <Button :pending="isSubmittingPassword" @click="updatePassword"> Submit </Button>
    </Container>
  </Dialog>

  <Container flow="row-between" variant="dash-title">
    <h1>Profile</h1>
    <Button @click="handleSignout">Sign out</Button>
  </Container>

  <Container tag="form" width="s" centered stretched>
    <h2>Account information</h2>
    <Field label="name" type="text" v-model="user.name" />
    <Field label="email" type="email" v-model="user.email" disabled />
  </Container>

  <Container tag="form" flow="row" class="actions" width="s" centered stretched>
    <Button variant="outline" @click="promptEmailForm">Update email</Button>
    <Button variant="outline" @click="promptPasswordDialog"> Update password </Button>
  </Container>

  <Container tag="form" width="s" centered stretched>
    <Button :pending="isSubmitting" wide @click="updateUser"> Save changes </Button>
  </Container>

  <Text v-if="currentUser.expiresAt">Your account is active until: {{ formatDateLong(currentUser.expiresAt) }}</Text>
  <Text v-if="currentUser.expiresAt">Only an administrator can change the expiration date</Text>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { Container, Button, Field, Text, Dialog } from "@owlabio/owl-ui";
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
