<template>
  <div class="search">
    <el-autocomplete
      v-model="search"
      :fetch-suggestions="querySearch"
      :loading="loading"
      :trigger-on-focus="false"
      :debounce="0"
      style="width: 100%"
      @select="handleSelect"
    />
    <p v-if="hint" class="search-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { useSearch } from "@/hooks";

const props = defineProps({
  label: { type: String },
  hint: { type: String },
  defaultValue: { type: String, default: "" },
});

const emits = defineEmits(["select"]);
const token = import.meta.env.VITE_APP_MAPBOX_TOKEN;

const { search, loading, results, setSearch } = useSearch(props.defaultValue, token);

let suggestionsCallback = null;

const querySearch = (queryString, cb) => {
  if (!queryString) {
    cb([]);
    return;
  }
  suggestionsCallback = cb;
};

watch(results, (newResults) => {
  if (suggestionsCallback) {
    suggestionsCallback(
      newResults.map((place) => ({
        ...place,
        value: place.place_name,
      }))
    );
    suggestionsCallback = null;
  }
});

const handleSelect = (item) => {
  // Remove the synthetic 'value' key added for el-autocomplete
  const { value: _, ...place } = item;
  setSearch(place.place_name);
  emits("select", place);
  search.value = "";
};
</script>

<style scoped>
.search {
  width: 100%;
}
.search-hint {
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
  margin: 4px 0 0;
}
</style>
