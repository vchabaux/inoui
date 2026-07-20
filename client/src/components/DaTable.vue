<template>
  <el-table
    :data="data"
    :row-key="selectionKey || '_id'"
    stripe
    v-model:expand-row-keys="expandedRowKeys"
    :empty-text="emptyMessage"
    style="width: 100%"
  >
    <el-table-column v-if="expandable || $slots['details']" type="expand">
      <template #default="{ row }">
        <slot name="details" :item="row" />
      </template>
    </el-table-column>

    <el-table-column
      v-for="(col, i) in columns"
      :key="col.key"
      :label="col.displayName"
      :sortable="col.sortable ? true : false"
    >
      <template #default="{ row }">
        <template v-if="col.format">
          {{ col.format(getNestedValue(row, col.key), row) }}
        </template>
        <template v-else>
          {{ getNestedValue(row, col.key) }}
        </template>
      </template>
    </el-table-column>

    <el-table-column v-if="$slots['row-controls']" label="" width="120">
      <template #default="{ row }">
        <slot name="row-controls" :item="row" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  layout: { type: String, default: "" },
  selectionKey: { type: String, default: "" },
  expandable: { type: Boolean, default: false },
  emptyMessage: { type: String, default: "No data" },
});

const expandedRowKeys = ref([]);

function getNestedValue(obj, path) {
  if (!path) return "";
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : ""), obj);
}
</script>
