<template>
  <div v-if="references?.length || prevTitle" class="notice-references variant-surface">
    <Button v-if="prevTitle" size="small" @click="emit('prev')">
      <i class="fa-solid fa-arrow-left" />
      {{ prevTitle }}
    </Button>

    <span v-if="references?.length" v-t="'noticeref.title'"></span>
    <ul v-if="references?.length">
      <li v-for="(reference, i) in references" :key="i">
        <Button class="notice-reference" text @click="emit('next', reference._id)">
          {{ reference?.title }}
        </Button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import Button from "primevue/button";
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
