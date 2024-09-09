<template>
  <Container v-if="references?.length || prevTitle" class="notice-references" variant="surface">
    <Button v-if="prevTitle" size="s" @click="emit('prev')">
      <template #start><Icon name="arrow-left" /></template>
      {{ prevTitle }}
    </Button>

    <Text v-if="references?.length" v-t="'noticeref.title'"></Text>
    <ul v-if="references?.length">
      <li v-for="(reference, i) in references" :key="i">
        <Button class="notice-reference" variant="text" @click="emit('next', reference._id)">
          {{ reference?.title }}
        </Button>
      </li>
    </ul>
  </Container>
</template>

<script setup>
import { Container, Text, Button, Icon } from "@owlabio/owl-ui";
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
