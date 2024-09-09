<template>
  <!-- Preview dialog -->
  <Notice v-if="isOpen" :noticeId="currentNoticeId" :open="isOpen" @close="isOpen = false" />

  <!-- Delete dialog -->
  <FormDelete :open="isDeleting" @cancel="clearThings" @delete="deleteNotice" />

  <!-- Header -->
  <Container flow="row-between" variant="dash-title">
    <h1>Notices</h1>
    <Link path="/admin/notices/new">New notice</Link>
  </Container>

  <!-- Filters -->
  <Container flow="row">
    <Field class="notices-filter" label="status" type="select" v-model="filter.status" placeholder="-" :options="['all', 'draft', 'pending', 'published']" />

    <Field class="notices-filter" label="author" type="select" v-model="filter.author" placeholder="-" :options="['all', ...authors]" />

    <Field class="notices-filter" label="media type" type="select" v-model="filter.mediaTypes" placeholder="-" :options="['all', 'text', 'image', 'audio', 'video']" />
  </Container>

  <!-- List -->
  <DaTable class="fix-table" :data="filtered" :columns="columnsNotices" layout="2fr 1fr 1fr" expandable>
    <template #row-controls="{ item }">
      <Button aria-label="preview" title="preview" size="s" @click="previewNotice(item._id)">
        <Icon name="eye" />
      </Button>
      <Link aria-label="edit" title="edit" v-if="getPermission(item)" variant="outline" size="s" :path="`/admin/notices/${item._id}`">
        <Icon name="pen" />
      </Link>
      <Button
        v-if="getPermission(item)"
        aria-label="delete"
        title="delete"
        size="s"
        variant="outline"
        class="danger-btn"
        :pending="isSubmitting"
        @click="prepareDelete(item._id)">
        <Icon name="trash-can" />
      </Button>
    </template>

    <template #details="{ item }">
      <Container>
        <Text tag="h2" class="notice-update-title">Notice information</Text>
        <div>
          <Text class="small-text">Created by {{ item.author.email }}</Text>
          <Text class="small-text" v-if="item.updates.length"> Last updated by {{ item.updates[item.updates.length - 1].author.email }} </Text>
        </div>

        <template v-if="item.updates.length">
          <Text tag="h2" class="notice-update-title">Edit history</Text>
          <ul>
            <li v-for="update in [...item.updates].reverse()">
              <Text class="small-text"> {{ formatDateShort(update.date) }}, {{ formatTime(update.date) }} by {{ update.author.email }} </Text>
            </li>
          </ul>
        </template>
      </Container>
    </template>
  </DaTable>
</template>

<script setup>
import { ref, computed } from "vue";
import { Link, Container, Button, Text, Icon, Field } from "@owlabio/owl-ui";
import Notice from "@/components/notice/Notice.vue";
import FormDelete from "@/components/forms/FormDelete.vue";
import DaTable from "@owlabio/da-table";
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
