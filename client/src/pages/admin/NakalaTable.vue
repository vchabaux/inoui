<template>
  <h3>{{ currentParam.type }}</h3>

  <pre>{{ JSON.stringify(foo, null, 2) }}</pre>

  <Select label="Meta-datas types" :options="metaDataTypes" v-model="selectedMeta" />
  <Select label="Licenses" :options="licenses" optionLabel="name" v-model="selectedLicense" />
  <Select label="Data types" :options="dataTypes" v-model="selectedDataType" />
  <Select label="Properties" :options="properties" v-model="selectedProperty" />
</template>

<script setup>
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import Select from "primevue/select";
import { useStore } from "@/stores";

const route = useRoute();

const nakalaStore = useStore("nakala");

const selectedLicense = ref("");
const selectedDataType = ref("");
const selectedMeta = ref("");
const selectedProperty = ref("");

const metaDataTypes = computed(() => nakalaStore.vocabulariesList("metadatatypes"));
const licenses = computed(() => nakalaStore.vocabulariesList("licenses"));
const dataTypes = computed(() => nakalaStore.vocabulariesList("datatypes"));
const properties = computed(() => nakalaStore.vocabulariesList("properties"));

const currentParam = computed(() => {
  return route.params;
});
</script>
