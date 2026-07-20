<template>
  <div v-if="references?.length || prevTitle" class="notice-references variant-surface">
    <el-button v-if="prevTitle" size="small" @click="emit('prev')">
      <i class="fa-solid fa-arrow-left" />
      {{ prevTitle }}
    </el-button>

    <span v-if="references?.length" v-t="'noticeref.title'"></span>
    <ul v-if="references?.length">
      <li v-for="(reference, i) in references" :key="i">
        <el-button class="notice-reference" text @click="emit('next', reference._id)">
          {{ reference?.title }}
        </el-button>
      </li>
    </ul>
  </div>
</template>

<script setup>
const emit = defineEmits(["prev", "next"]);

const props = defineProps({
  references: Array,
  prevTitle: String,
});
</script>

<style scoped>
.notice-references {
  margin-block-start: var(--size-8);
}

.notice-reference {
  padding: var(--size-1) var(--size-2);
  text-decoration: underline;
}
</style>
