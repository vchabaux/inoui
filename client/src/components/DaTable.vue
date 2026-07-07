<template>
  <DataTable
    :value="data"
    :dataKey="selectionKey"
    :emptyMessage="emptyMessage"
    v-model:expandedRows="expandedRows"
    @rowToggle="onRowToggle"
    stripedRows
    scrollable
    scrollHeight="flex"
  >
    <Column
      v-for="(col, i) in columns"
      :key="col.key"
      :field="col.key"
      :header="col.displayName"
      :sortable="col.sortable ? true : false"
      :style="columnStyle(i)"
    >
      <template #body="{ data }">
        <template v-if="col.format">
          {{ col.format(getNestedValue(data, col.key), data) }}
        </template>
        <template v-else>
          {{ getNestedValue(data, col.key) }}
        </template>
      </template>
    </Column>

    <Column v-if="$slots['row-controls']" :header="''">
      <template #body="{ data }">
        <slot name="row-controls" :item="data" />
      </template>
    </Column>

    <template v-if="$slots['details']" #expansion="{ data }">
      <slot name="details" :item="data" />
    </template>
  </DataTable>
</template>

<script setup>
import { ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  layout: { type: String, default: "" },
  selectionKey: { type: String, default: "" },
  expandable: { type: Boolean, default: false },
  emptyMessage: { type: String, default: "No data" },
});

const expandedRows = ref({});

function onRowToggle(event) {
  expandedRows.value = event.data;
}

function getNestedValue(obj, path) {
  if (!path) return "";
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : ""), obj);
}

function columnStyle(i) {
  if (!props.layout) return {};
  const parts = props.layout.split(/\s+/);
  if (i < parts.length) {
    const fr = parseFloat(parts[i]);
    if (!isNaN(fr)) {
      return { width: `${(fr / totalFr()) * 100}%` };
    }
  }
  return {};
}

function totalFr() {
  if (!props.layout) return 1;
  return props.layout.split(/\s+/).reduce((sum, p) => {
    const v = parseFloat(p);
    return sum + (isNaN(v) ? 1 : v);
  }, 0);
}
</script>