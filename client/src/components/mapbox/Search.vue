<template>
  <form class="search" @submit.prevent>
    <Field type="text" :label="label" :hint="hint" v-model="search" />

    <Container tag="ul" class="search-list" stretched>
      <li v-if="loading" class="search-spinner">
        <Icon name="spinner" spin />
      </li>

      <li v-for="(place, i) in results" :key="i">
        <Button class="search-item" variant="text" size="nested" wide @click="handleClick(place)">
          {{ place.place_name }}
        </Button>
      </li>
    </Container>
  </form>
</template>

<script setup>
import { Container, Field, Icon, Button } from "@owlabio/owl-ui";
import { useSearch } from "@/hooks";

const props = defineProps({
  label: {
    type: String,
  },
  hint: {
    type: String,
  },
  defaultValue: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["select"]);
const token = import.meta.env.VITE_APP_MAPBOX_TOKEN;

const { search, loading, results, setSearch } = useSearch(props.defaultValue, token);

const handleClick = (place) => {
  setSearch(place.place_name);
  emits("select", place);
  search.value = "";
};
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
  background-color: var(--color-background-neutral);
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
