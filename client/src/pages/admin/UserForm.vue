<template>
  <Container flow="row-between" variant="dash-title">
    <h1>{{ isUpdate ? user.name : "New user" }}</h1>
  </Container>

  <Container tag="form" width="s" stretched centered @submit.prevent>
    <h2>User information</h2>
    <Field label="name" type="text" v-model="name" />
    <Field label="e-mail" type="email" v-model="email" />
  </Container>

  <Container tag="form" width="s" stretched centered @submit.prevent>
    <h2>User permissions</h2>
    <Field
      label="role"
      :options="Object.keys(roles).map((key) => roles[key])"
      v-model="role"
      type="select"
    />
    <Field
      label="This is a temporary member"
      type="checkbox"
      v-model="isTemporary"
    />
    <Field
      v-if="isTemporary"
      label="Expiration date"
      type="date"
      v-model="_expiresAt"
    />
  </Container>

  <Container centered width="s">
    <Voice
      v-if="Object.keys(errors).length"
      type="error"
      :message="Object.values(errors).join(`<br>`)"
    />
    <Button
      wide
      @click="save"
      :pending="isSubmitting"
      :disabled="!!Object.keys(errors).length"
    >
      {{ isUpdate ? "Save changes" : "Send an invitation" }}
    </Button>
  </Container>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed, watchEffect } from "vue";
import { Field, Button, Container } from "@owlabio/owl-ui";
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
});

const { handleSubmit, errors, isSubmitting, validate } = useForm({
  validationSchema: userSchema,
  initialValues: user,
});

const { value: name, errorMessage: nameError } = useField("name");
const { value: email, errorMessage: emailError, meta } = useField("email");
const { value: role, errorMessage: roleError } = useField("role");
const { value: expiresAt } = useField("expiresAt");

const isTemporary = ref(false);

const twoDigits = (value) => (value < 10 ? `0${value}` : value);

const _expiresAt = computed({
  get() {
    const date = expiresAt;
    const formatted = new Date(date);
    const year = formatted.getFullYear(); // Add 1 year
    const month = twoDigits(formatted.getMonth() + 1);
    const day = twoDigits(formatted.getUTCDate());

    return `${year}-${month}-${day}`;
  },
  set(newValue) {
    expiresAt.value = newValue;
  },
});

watchEffect(() => {
  if (route.params.id) {
    const foundUser = userStore.findOne(route.params.id);
    user.value = foundUser;
    user.value.name = user.value.name || "";
    user.value.expiresAt = foundUser.expiresAt
      ? foundUser.expiresAt
      : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  }
});

const save = handleSubmit(async (values, {}) => {
  const { name, email, role, expiresAt } = values;

  if (isUpdate.value) {
    await userStore.update(user.value._id, {
      name: name,
      role: role,
      email: email,
      expiresAt: isTemporary.value ? expiresAt : null,
    });
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
