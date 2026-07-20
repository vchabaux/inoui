<template>
  <div :class="{ 'width-l': isPublic, 'app-page': isPublic }">
    <h1 v-if="isPublic" class="color-title" v-t="'notfound.title'">Page not found</h1>
    <div v-else class="variant-dash-title">
      <h1 class="color-title">Page not found</h1>
    </div>

    <p v-if="isPublic" v-t="'notfound.text'"></p>
    <p v-else>The page you're looking for doesn't exist, it may have been deleted</p>

    <div class="flow-row" v-if="isPublic">
      <el-button @click="router.go(-1)" v-t="'notfound.back'"></el-button>
      <router-link :to="isPublic ? '/' : '/admin'" v-t="'notfound.home'"></router-link>
    </div>

    <div class="flow-row" v-else>
      <el-button @click="router.go(-1)">Go back</el-button>
      <router-link :to="isPublic ? '/' : '/admin'">Home</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isPublic = computed(() => !route.path.includes("admin"));
</script>
