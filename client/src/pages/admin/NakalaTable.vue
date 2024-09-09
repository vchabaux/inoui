<template>
  <h3>{{ currentParam.type }}</h3>

  <!-- <img
        src="https://apitest.nakala.fr/data/10.34847/nkl.cc97i088.v1/50d3d9eb2d4cc4d09ab85990f98d69ec008926e2?bearer=b68c997f2728d2477b7a64ba1504864c5e944596abbc6d5694e0a9a6229bed7c" /> -->

  <pre>{{ JSON.stringify(foo, null, 2) }}</pre>

  <Field type="select" label="Meta-datas types" :options="metaDataTypes" v-model="selectedMeta" />
  <Field type="select" label="Licenses" :options="licenses" :formatter="(v) => v.name" v-model="selectedLicense" />
  <Field type="select" label="Data types" :options="dataTypes" v-model="selectedDataType" />
  <Field type="select" label="Properties" :options="properties" v-model="selectedProperty" />
</template>

<script setup>
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { Field } from "@owlabio/owl-ui";
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
