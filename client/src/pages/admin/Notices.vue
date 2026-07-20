<template>
  <!-- Preview dialog -->
  <Notice v-if="isOpen" :noticeId="currentNoticeId" :open="isOpen" @close="isOpen = false" />

  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteNotice" />

  <!-- Header -->
  <div class="flow-row-between variant-dash-title" style="width: 100%">
    <h1>Notices</h1>
    <router-link to="/admin/notices/new">New notice</router-link>
  </div>

  <!-- Filters -->
  <div class="flow-row">
    <el-select class="notices-filter" v-model="filter.status" placeholder="-">
      <el-option
        v-for="opt in ['all', 'draft', 'pending', 'published']"
        :key="opt"
        :label="opt"
        :value="opt"
      />
    </el-select>

    <el-select class="notices-filter" v-model="filter.author" placeholder="-">
      <el-option
        v-for="opt in ['all', ...authors]"
        :key="opt"
        :label="opt"
        :value="opt"
      />
    </el-select>

    <el-select class="notices-filter" v-model="filter.mediaTypes" placeholder="-">
      <el-option
        v-for="opt in ['all', 'text', 'image', 'audio', 'video']"
        :key="opt"
        :label="opt"
        :value="opt"
      />
    </el-select>
  </div>

  <!-- List -->
  <DaTable class="fix-table" :data="filtered" :columns="columnsNotices" layout="2fr 1fr 1fr" expandable>
    <template #row-controls="{ item }">
      <el-button aria-label="preview" title="preview" size="small" @click="previewNotice(item._id)">
        <i class="fa-solid fa-eye" />
      </el-button>
      <router-link
        aria-label="edit"
        title="edit"
        v-if="getPermission(item)"
        class="el-button el-button--default el-button--small"
        :to="`/admin/notices/${item._id}`"
      >
        <i class="fa-solid fa-pen" />
      </router-link>
      <el-button
        v-if="getPermission(item)"
        aria-label="delete"
        title="delete"
        size="small"
        plain
        class="danger-btn"
        :loading="isSubmitting"
        @click="prepareDelete(item._id)"
      >
        <i class="fa-solid fa-trash-can" />
      </el-button>
    </template>

    <template #details="{ item }">
      <div>
        <h2 class="notice-update-title">Notice information</h2>
        <div>
          <span class="small-text">Created by {{ item.author.email }}</span>
          <span class="small-text" v-if="item.updates.length">
            Last updated by {{ item.updates[item.updates.length - 1].author.email }}
          </span>
        </div>

        <template v-if="item.updates.length">
          <h2 class="notice-update-title">Edit history</h2>
          <ul>
            <li v-for="update in [...item.updates].reverse()" :key="update.date">
              <span class="small-text">
                {{ formatDateShort(update.date) }}, {{ formatTime(update.date) }} by {{ update.author.email }}
              </span>
            </li>
          </ul>
        </template>
      </div>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
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
  const isAdmin = currentUser.value.role.includes("admin");
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
    extras.forEach((patient) => {
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
