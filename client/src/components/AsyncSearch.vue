<template>
  <form class="search" @submit.prevent>
    <Field type="text" :label="label" v-model="search" />

    <Container tag="ul" class="search-list" stretched>
      <li v-if="loading" class="search-spinner">
        <Icon name="spinner" spin />
      </li>

      <li v-for="(r, i) in results" :key="i">
        <Button
          class="search-item"
          variant="text"
          size="nested"
          wide
          @click="handleClick(r)"
        >
          {{ formatResult(r) }}
        </Button>
      </li>
    </Container>
  </form>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { Container, Field, Button, Icon } from "@owlabio/owl-ui";
import { getProperty } from "@/utils";
import axios from "axios";

const search = ref("");
const searchResult = ref([]);
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
  /**
   * Used
   */
  maxItems: {
    type: Number,
    default: 5,
  },

  /**
   * Depends on the response type, either the either is located @data key
   * or its nested.
   * Can pass a value such as data.foo.bar to get the array of results.
   */
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

watch(search, async (newValue) => {
  /**
   * TODO Debounce search.
   */
  try {
    loading.value = true;
    const response = await axios.get(`${props.endPoint}`, {
      params: {
        [props.queryKey]: newValue,
      },
    });

    searchResult.value = getProperty(response, props.resultLocation);
  } catch (error) {
    console.log("There has been an error", error?.response?.data);
  } finally {
    loading.value = false;
  }
});

const results = computed(() => {
  return searchResult.value ? searchResult.value.slice(0, props.maxItems) : [];
});

function handleClick(r) {
  emits("select", r);
  search.value = "";
}
</script>

<style scoped>
.search {
  position: relative;
}

.search-list:not(:empty) {
  display: block;
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(100% + var(--size-2));
  box-shadow: var(--box-shadow-3);
  background-color: var(--color-surface-neutral);
  gap: 0 !important;
  border-radius: var(--app-radius, var(--radius-2));
  overflow: hidden;
  z-index: 2;
}

.search-spinner {
  padding: var(--size-2);
  text-align: center;
}

.search-item {
  justify-items: flex-start !important;
  text-align: start;
  overflow-x: hidden;
  padding: var(--size-2);
}
</style>
