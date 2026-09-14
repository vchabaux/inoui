<template>
  <el-table
    :data="data"
    :row-key="getRowKey"
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

    <el-table-column v-if="$slots['row-controls']" label="" width="190" class-name="row-controls-cell">
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

/* Clé de ligne unique : indispensable pour que l'expand ne déplie que la
   ligne cliquée. Les datas Nakala n'ont pas de _id (mais un identifier),
   d'où la chaîne de repli — sinon toutes les lignes partagent la clé
   `undefined` et se déplient ensemble. */
const fallbackKeys = new WeakMap();
let fallbackSeq = 0;

function getRowKey(row) {
  if (props.selectionKey) return row[props.selectionKey];
  if (row._id != null) return row._id;
  if (row.identifier != null) return row.identifier;
  if (row.id != null) return row.id;
  if (!fallbackKeys.has(row)) fallbackKeys.set(row, `__row_${fallbackSeq++}`);
  return fallbackKeys.get(row);
}

function getNestedValue(obj, path) {
  if (!path) return "";
  return path.split(".").reduce((acc, part) => (acc ? acc[part] : ""), obj);
}
</script>
