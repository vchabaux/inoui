<template>
  <el-dialog :model-value="open" @close="$emit('close')">
    <template #header v-if="notice?.hasTitle">
      <div class="flow-row">
        <i class="fa-solid fa-location-dot" />
        <span class="notice-title">{{ notice?.title }}</span>
      </div>
    </template>

    <div class="notice-raw" v-html="notice?.content"></div>

    <NoticeRef
      v-if="hasRef || prevNotice"
      :prevTitle="prevNotice?.title"
      :references="references"
      @prev="showPrevious"
      @next="showNext"
    />

    <template
      #footer
      v-if="history.length > 1 || navigation || notice?.references?.length"
    >
      <NoticeNav
        v-if="navigation"
        :navigation="navigation"
        @navigate="(d, v) => emit('navigate', d, v)"
      />
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "@/stores";
import NoticeNav from "./NoticeNav.vue";
import NoticeRef from "./NoticeRef.vue";

const noticeStore = useStore("notice");

const emit = defineEmits(["navigate"]);

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  noticeId: {
    type: String,
    required: true,
  },
  navigation: {
    type: Object,
    default: null,
  },
});

const history = ref([]);
const currentId = ref(props.noticeId);
const prevNotice = ref(null);
const notice = computed(() => noticeStore.findOne(currentId.value));
const hasRef = notice.value?.references?.length || history.length > 1;
const references = computed(() => {
  return notice.value?.references?.map((ref) => noticeStore.findOne(ref));
});

watch(
  () => props.noticeId,
  (id) => {
    if (id !== currentId.value) {
      currentId.value = id;
    }
  }
);

function showPrevious() {
  currentId.value = prevNotice.value._id;

  history.value?.pop();

  prevNotice.value = noticeStore.findOne(
    history.value[history.value.length - 1]
  );
}

function showNext(newId) {
  history.value?.push(newId);
  prevNotice.value = noticeStore.findOne(currentId.value);
  currentId.value = newId;
}
</script>

<style scoped>
.notice-title {
  font-family: var(--app-font-title);
}

.notice-raw {
  display: grid;
  gap: var(--size-4);
  min-height: calc(100vh - 5vh - 250px) !important;
}

:global(video) {
  width: 100%;
}
</style>
