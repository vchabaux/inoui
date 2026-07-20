<template>
  <h3>{{ currentParam.type }}</h3>

  <pre>{{ JSON.stringify(foo, null, 2) }}</pre>

  <el-form label-position="top">
    <el-form-item label="Meta-datas types">
      <el-select v-model="selectedMeta" placeholder="Select" style="width: 100%">
        <el-option v-for="item in metaDataTypes" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>
    <el-form-item label="Licenses">
      <el-select v-model="selectedLicense" placeholder="Select" style="width: 100%">
        <el-option v-for="item in licenses" :key="item.name" :label="item.name" :value="item" />
      </el-select>
    </el-form-item>
    <el-form-item label="Data types">
      <el-select v-model="selectedDataType" placeholder="Select" style="width: 100%">
        <el-option v-for="item in dataTypes" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>
    <el-form-item label="Properties">
      <el-select v-model="selectedProperty" placeholder="Select" style="width: 100%">
        <el-option v-for="item in properties" :key="item" :label="item" :value="item" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
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
