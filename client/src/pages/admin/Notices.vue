<template>
  <!-- Preview dialog -->
  <Notice v-if="isOpen" :noticeId="currentNoticeId" :open="isOpen" @close="isOpen = false" />

  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteNotice" />

  <!-- Header -->
  <div class="flow-row-between variant-dash-title">
    <h1>Notices</h1>
    <router-link to="/admin/notices/new" class="link-text">New notice</router-link>
  </div>

  <!-- Filters -->
  <div class="flow-row">
    <Select class="notices-filter" label="status" v-model="filter.status" :options="['all', 'draft', 'pending', 'published']" />

    <Select class="notices-filter" label="author" v-model="filter.author" :options="['all', ...authors]" />

    <Select class="notices-filter" label="media type" v-model="filter.mediaTypes" :options="['all', 'text', 'image', 'audio', 'video']" />
  </div>

  <!-- List -->
  <DaTable class="fix-table" :data="filtered" :columns="columnsNotices" layout="2fr 1fr 1fr" expandable>
    <template #row-controls="{ item }">
      <Button aria-label="preview" title="preview" size="small" @click="previewNotice(item._id)">
        <i class="fa-solid fa-eye" />
      </Button>
      <router-link aria-label="edit" title="edit" v-if="getPermission(item)" class="link-outline text-sm" :to="`/admin/notices/${item._id}`">
        <i class="fa-solid fa-pen" />
      </router-link>
      <Button
        v-if="getPermission(item)"
        aria-label="delete"
        title="delete"
        size="small"
        outlined
        class="danger-btn"
        :loading="isSubmitting"
        @click="prepareDelete(item._id)">
        <i class="fa-solid fa-trash-can" />
      </Button>
    </template>

    <template #details="{ item }">
      <div>
        <h2 class="notice-update-title">Notice information</h2>
        <div>
          <span class="small-text">Created by {{ item.author.email }}</span>
          <span class="small-text" v-if="item.updates.length"> Last updated by {{ item.updates[item.updates.length - 1].author.email }} </span>
        </div>

        <template v-if="item.updates.length">
          <h2 class="notice-update-title">Edit history</h2>
          <ul>
            <li v-for="update in [...item.updates].reverse()">
              <span class="small-text"> {{ formatDateShort(update.date) }}, {{ formatTime(update.date) }} by {{ update.author.email }} </span>
            </li>
          </ul>
        </template>
      </div>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
import Button from "primevue/button";
import Select from "primevue/select";
import Notice from "@/components/notice/Notice.vue";
import FormDelete from "@/components/forms/FormDelete.vue";
import DaTable from "@/components/DaTable.vue";
import { columnsNotices } from "@/utils/columns";
import { formatDateShort, formatTime } from "@/utils/time";
import { useStore } from "@/stores";

const noticeStore = useStore("notice");
const authStore = useStore("auth");
const isOpen = ref(false);
const isDeleting = ref(false);
const isSubmitting = ref(false);
const selectedItem = ref(null);

const notices = computed(() => noticeStore.list);
const authors = computed(() => [...new Set(notices.value.map((n) => n.author.email))]);

const filter = ref({ mediaTypes: "all", status: "all", author: "all" });
const filtered = computed(() =>
  notices.value?.filter(
    (n) =>
      (filter.value.mediaTypes === "all" || n.mediaTypes.includes(filter.value.mediaTypes)) &&
      (filter.value.status === "all" || n.status === filter.value.status) &&
      (filter.value.author === "all" || n.author.email === filter.value.author)
  )
);

const currentNoticeId = ref("");
const currentUser = computed(() => authStore.currentUser);

function getPermission(item) {
  const isAuthor = item.author._id === currentUser.value._id;
  const isAdmin = computed(() => currentUser.value.role.includes("admin"));

  return isAuthor || isAdmin;
}

function prepareDelete(id) {
  selectedItem.value = id;
  isDeleting.value = true;
}

function clearThings() {
  selectedItem.value = null;
  isDeleting.value = false;
}

async function deleteNotice() {
  isSubmitting.value = true;

  try {
    const extras = notices.value.filter((notice) => notice.references.includes(selectedItem.value));

    await extras.forEach((patient) => {
      patient.references = patient.references.filter((c) => c !== selectedItem.value);
      noticeStore.update(patient._id, patient);
    });

    await noticeStore.delete(selectedItem.value);
  } catch (err) {
    console.err(err);
  } finally {
    isSubmitting.value = false;
    clearThings();
  }
}

function previewNotice(id) {
  currentNoticeId.value = id;
  isOpen.value = true;
}
</script>

<style scoped>
.notices-filter {
  flex: 1;
  min-width: 300px;
}

.notice-update-title {
  font-size: var(--size-4);
  font-weight: bold;
}
</style>
