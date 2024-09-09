<template>
  <Container :width="{ l: isPublic }" :class="{ 'app-page': isPublic }">
    <Text v-if="isPublic" tag="h1" class="color-title" v-t="'notfound.title'">Page not found</Text>
    <Container v-else variant="dash-title">
      <Text tag="h1" class="color-title">Page not found</Text>
    </Container>

    <Text v-if="isPublic" v-t="'notfound.text'"></Text>
    <Text v-else>The page you're looking for doesn't exist, it may have been deleted</Text>

    <Container flow="row" v-if="isPublic">
      <Button variant="outline" @click="router.go(-1)" v-t="'notfound.back'"></Button>
      <Link :path="isPublic ? '/' : '/admin'" v-t="'notfound.home'"></Link>
    </Container>

    <Container flow="row" v-else>
      <Button variant="outline" @click="router.go(-1)">Go back</Button>
      <Link :path="isPublic ? '/' : '/admin'">Home</Link>
    </Container>
  </Container>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Container, Button, Link, Text } from "@owlabio/owl-ui";

const route = useRoute();
const router = useRouter();

const isPublic = computed(() => !route.path.includes("admin"));
</script>
