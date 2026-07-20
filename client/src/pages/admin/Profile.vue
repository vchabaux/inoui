<template>
  <!-- update email dialog -->
  <el-dialog :model-value="isFormEmail" @close="isFormEmail = false">
    <template #header>
      <h2>Update email</h2>
    </template>

    <el-form label-position="top">
      <template v-if="tokenSent">
        <p>Enter the code received by email</p>
        <el-form-item label="Code">
          <el-input v-model="verificationCode" />
        </el-form-item>
        <el-button type="primary" @click="submitCode">Validate</el-button>
      </template>

      <template v-else>
        <el-form-item label="New email">
          <el-input type="email" v-model="email" autocomplete="email" />
        </el-form-item>
        <el-button type="primary" @click="sendToken">Validate</el-button>
      </template>
    </el-form>
  </el-dialog>

  <!-- update password dialog -->
  <el-dialog :model-value="isFormPassword" @close="clear">
    <template #header>
      <h2>Update password</h2>
    </template>

    <el-form label-position="top">
      <el-form-item label="current password">
        <el-input type="password" v-model="password" autocomplete="current-password" />
      </el-form-item>
      <el-form-item label="new password">
        <el-input type="password" v-model="newPassword" autocomplete="new-password" />
      </el-form-item>

      <el-button type="primary" :loading="isSubmittingPassword" @click="updatePassword"> Submit </el-button>
    </el-form>
  </el-dialog>

  <div class="flow-row-between variant-dash-title" style="width: 100%">
    <h1>Profile</h1>
    <el-button @click="handleSignout">Sign out</el-button>
  </div>

  <div class="page-content">
    <el-form label-position="top" class="width-s centered">
      <h2>Account information</h2>
      <el-form-item label="name">
        <el-input v-model="user.name" />
      </el-form-item>
      <el-form-item label="email">
        <el-input v-model="user.email" disabled />
      </el-form-item>
    </el-form>

    <div class="flow-row actions width-s centered">
      <el-button @click="promptEmailForm">Update email</el-button>
      <el-button @click="promptPasswordDialog">Update password</el-button>
    </div>

    <el-form label-position="top" class="width-s centered">
      <el-button type="primary" :loading="isSubmitting" class="w-full" @click="updateUser">Save changes</el-button>
    </el-form>

    <span v-if="currentUser.expiresAt">Your account is active until: {{ formatDateLong(currentUser.expiresAt) }}</span>
    <span v-if="currentUser.expiresAt">Only an administrator can change the expiration date</span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
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
.page-content {
  display: grid;
  gap: var(--size-8);
  align-content: flex-start;
}

.actions > * {
  flex: 1;
}
</style>
