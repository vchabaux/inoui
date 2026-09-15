<template>
  <div class="variant-dash-title flow-row-between" style="width:100%">
    <h1>{{ isUpdate ? user.name : "New user" }}</h1>
  </div>

  <el-form label-position="top" class="width-s stretched centered" @submit.prevent>
    <h2>User information</h2>
    <el-form-item label="name">
      <el-input v-model="name" />
    </el-form-item>
    <el-form-item label="e-mail">
      <el-input v-model="email" type="email" />
    </el-form-item>
    <el-form-item v-if="isUpdate" label="new password">
      <el-input
        v-model="password"
        type="password"
        autocomplete="new-password"
        show-password
        placeholder="Leave empty to keep the current password"
      />
    </el-form-item>
  </el-form>

  <el-form label-position="top" class="width-s stretched centered" @submit.prevent>
    <h2>User permissions</h2>
    <el-form-item label="role">
      <el-select v-model="role" style="width:100%">
        <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
      </el-select>
    </el-form-item>
    <el-form-item label="This is a temporary member">
      <el-checkbox v-model="isTemporary" />
    </el-form-item>
    <template v-if="isTemporary">
      <el-form-item label="Expiration date">
        <el-date-picker v-model="_expiresAt" type="date" value-format="YYYY-MM-DD" style="width:100%" />
      </el-form-item>
    </template>
  </el-form>

  <div class="centered width-s">
    <Voice
      v-if="Object.keys(errors).length"
      type="error"
      :message="Object.values(errors).join(`<br>`)"
    />
    <el-button class="w-full" @click="save" :loading="isSubmitting" :disabled="!!Object.keys(errors).length">
      {{ isUpdate ? "Save changes" : "Send an invitation" }}
    </el-button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed, watchEffect } from "vue";
import { useStore } from "@/stores";
import Voice from "@/components/Voice.vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

const route = useRoute();
const router = useRouter();
const userStore = useStore("user");

const roles = ["viewer", "editor", "admin", "superadmin"];

const isUpdate = computed(() => {
  return !!route.params.id;
});

const user = ref({
  name: "",
  email: "",
  role: "",
  expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
});

const userSchema = yup.object().shape({
  name: yup.string().min(1).required("Name is required"),
  email: yup.string().email("Enter a valid email").required(),
  role: yup.string().required(),
  expiresAt: yup.date(),
  password: yup.string(),
});

const { handleSubmit, errors, isSubmitting, resetForm } = useForm({
  validationSchema: userSchema,
  initialValues: user,
});

const { value: name, errorMessage: nameError } = useField("name");
const { value: email, errorMessage: emailError, meta } = useField("email");
const { value: role, errorMessage: roleError } = useField("role");
const { value: expiresAt } = useField("expiresAt");
const { value: password } = useField("password");

const isTemporary = ref(false);

const twoDigits = (value) => (value < 10 ? `0${value}` : value);

const _expiresAt = computed({
  get() {
    const formatted = new Date(expiresAt.value);
    const year = formatted.getFullYear();
    const month = twoDigits(formatted.getMonth() + 1);
    const day = twoDigits(formatted.getDate());

    return `${year}-${month}-${day}`;
  },
  set(newValue) {
    expiresAt.value = newValue;
  },
});

// Sync the fetched user into the form ONCE per user id. The effect can
// re-run on unrelated reactive updates; re-applying resetForm then would
// clobber whatever the admin is typing (all fields reverting mid-typing).
let syncedId = null;

watchEffect(() => {
  const id = route.params.id;
  if (!id) return;
  if (syncedId === id) return;

  const foundUser = userStore.findOne(id);
  if (!foundUser) return;

  syncedId = id;
  user.value = { ...foundUser };
  isTemporary.value = !!foundUser.expiresAt;

  // vee-validate copies initialValues once at setup: push the fetched user
  // into the fields explicitly, later mutations of `user` would not sync.
  resetForm({
    values: {
      name: foundUser.name || "",
      email: foundUser.email || "",
      role: foundUser.role || "",
      expiresAt: foundUser.expiresAt
        ? foundUser.expiresAt
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      password: "",
    },
  });
});

const save = handleSubmit(async (values, {}) => {
  const { name, email, role, expiresAt, password } = values;

  if (isUpdate.value) {
    await userStore.update(user.value._id, {
      name: name,
      role: role,
      email: email,
      expiresAt: isTemporary.value ? expiresAt : null,
    });
    if (password) {
      await userStore.changePassword(user.value._id, password);
    }
    router.push("/admin/users");
  } else {
    const _user = isTemporary.value
      ? { email, role, expiresAt, name }
      : { email, role, name };

    await userStore.create(_user);
    router.push("/admin/users");
  }
});
</script>

<style scoped></style>
