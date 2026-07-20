<template>
  <div class="async-search">
    <el-autocomplete
      v-model="search"
      :fetch-suggestions="querySearch"
      :loading="loading"
      :trigger-on-focus="false"
      :debounce="300"
      :placeholder="label"
      style="width: 100%"
      @select="handleSelect"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getProperty } from "@/utils";
import axios from "axios";

const search = ref("");
const loading = ref(false);

const emits = defineEmits(["select"]);

const props = defineProps({
  endPoint: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "Search",
  },
  queryKey: {
    type: String,
    default: "q",
  },
  maxItems: {
    type: Number,
    default: 5,
  },
  resultLocation: {
    type: String,
    default: "data",
  },
  formatResult: {
    type: Function,
    default(v) {
      return v;
    },
  },
});

async function querySearch(queryString, cb) {
  if (!queryString) {
    cb([]);
    return;
  }

  loading.value = true;
  try {
    const response = await axios.get(`${props.endPoint}`, {
      params: { [props.queryKey]: queryString },
    });
    const raw = getProperty(response, props.resultLocation);
    const items = (raw || []).slice(0, props.maxItems);
    cb(
      items.map((item) => ({
        ...item,
        value: props.formatResult(item),
      }))
    );
  } catch (error) {
    console.log("There has been an error", error?.response?.data);
    cb([]);
  } finally {
    loading.value = false;
  }
}

function handleSelect(item) {
  const { value: _, ...original } = item;
  emits("select", original);
  search.value = "";
}
</script>

<style scoped>
.async-search {
  width: 100%;
}
</style>
