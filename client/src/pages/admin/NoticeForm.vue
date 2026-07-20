<template>
  <!-- Preview dialog -->
  <Notice v-if="currentNotice" :noticeId="currentNotice?._id" :open="isPreviewing" @close="isPreviewing = false" />

  <!-- Medias dialog -->
  <el-dialog v-if="isMediaLibOpen" :model-value="isMediaLibOpen" @close="isMediaLibOpen = false">
    <Medias picker @select="addMedia" :mediaType="currentUploadType" />
  </el-dialog>

  <div class="flow-row-between variant-dash-title" style="width: 100%">
    <h1>
      {{ isUpdate ? `${notice?.title} (${notice?.status})` : "New notice" }}
    </h1>
    <el-button v-if="isUpdate" aria-label="preview" @click="isPreviewing = true">Preview</el-button>
  </div>

  <el-form label-position="top" class="width-l centered" @submit.prevent>
    <h2>Notice information</h2>

    <el-form-item label="title">
      <el-input v-model="notice.title" ref="inputRef" />
    </el-form-item>

    <el-form-item>
      <el-checkbox v-model="notice.hasTitle">the title is visible in the notice</el-checkbox>
    </el-form-item>

    <el-form-item label="content">
      <el-input type="textarea" v-model="notice.content" rows="12" />
    </el-form-item>

    <div class="notice-config-container stretched">
      <h2>Categories</h2>
      <span class="small-text text-fade">Categories allow the user to filter points on the map. The main category icon is displayed in the point</span>
      <ul class="variant-surface notice-config-list flow-row">
        <li v-if="!notice.categories.length">No category yet</li>
        <Tag v-for="(category, i) in notice.categories" :key="i" tag="li" :label="getCategory(category._id)?.name" @delete="removeCategory(category)" />
      </ul>
      <Categories :favorite="favCat?._id" @star="favCategory" @select="addCategory" />
    </div>

    <div class="notice-config-container stretched">
      <h2>References</h2>
      <span class="small-text text-fade">References are displayed at the bottom of the notice</span>
      <el-select v-if="filteredNotices.length" @change="addReference" placeholder="Select a notice" style="width: 100%">
        <el-option
          v-for="n in filteredNotices"
          :key="n._id"
          :label="n.title"
          :value="n"
        />
      </el-select>
      <ul class="variant-surface notice-config-list stretched">
        <li v-if="!notice.references.length">No reference yet</li>
        <li v-for="(reference, i) in references" :key="i">
          <div class="flow-row-between">
            <span>{{ reference.title }}</span>
            <el-button aria-label="remove" title="remove" size="small" plain @click="removeReference(reference)">
              <i class="fa-solid fa-xmark" />
            </el-button>
          </div>
        </li>
      </ul>
    </div>
  </el-form>

  <div v-if="currentNotice?.original || currentNotice?.status === 'published'" class="width-l centered flow-row -end">
    <span v-if="currentNotice?.original">
      You are working on a copy of {{ noticeStore.findOne(currentNotice.original)?.title }}
    </span>
    <span v-if="currentNotice?.status === 'published'">This notice is currently online</span>
  </div>
  <div class="centered stretched width-s">
    <Voice v-if="error" :type="error.type" :message="error.message" :closable="true" @close="error = null" />
  </div>

  <div class="width-l centered flow-row -end">
    <el-button @click="save('draft')">
      {{ getText("draft") }}
    </el-button>
    <el-button v-if="!isAdmin" type="primary" @click="save('pending')">
      {{ getText("pending") }}
    </el-button>
    <el-button v-else type="primary" @click="save('published')">
      {{ getText("published") }}
    </el-button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import Notice from "@/components/notice/Notice.vue";
import Tag from "@/components/Tag.vue";
import Medias from "@/pages/admin/Medias.vue";
import Categories from "@/components/Categories.vue";
import { useRoute, useRouter } from "vue-router";
import { useCategoryStore } from "@/stores/categories";
import { useStore } from "@/stores";
import { handleError } from "@/utils";
import Voice from "@/components/Voice.vue";

const route = useRoute();
const router = useRouter();
const authStore = useStore("auth");
const noticeStore = useStore("notice");
const settingsStore = useStore("settings");
const categoriesStores = useCategoryStore();

const app = computed(() => settingsStore.project);
const inputRef = ref(null);
const isPreviewing = ref(false);
const editorRef = ref(null);
const currentUploadType = ref(null);
const error = ref(null);
const isUpdate = computed(() => route.params.id);
const notices = computed(() => noticeStore.list);
const currentNotice = computed(() => noticeStore.findOne(route.params.id));
const currentUser = computed(() => authStore.currentUser);

const categories = computed(() => {
  const bundle = [];

  function extract(cat) {
    cat.children.forEach((child) => {
      bundle.push(child);
      child.children.length && extract(child);
    });
  }

  categoriesStores.categories.forEach((cat) => {
    bundle.push(cat);
    cat.children.length && extract(cat);
  });

  return bundle;
});

const favCat = computed(() => notice.value.categories.length && notice.value?.categories?.[0]);

const isAdmin = computed(() => currentUser.value.role.includes("admin"));

const notice = ref({
  title: currentNotice.value?.title || "",
  hasTitle: isUpdate ? currentNotice.value?.hasTitle : true,
  categories: currentNotice.value?.categories || [],
  date: currentNotice.value?.date || new Date(),
  content: currentNotice.value?.content || "",
  mediaTypes: currentNotice.value?.mediaTypes || [],
  references: currentNotice.value?.references || [],
  author: currentNotice.value?.author || currentUser.value._id,
  status: currentNotice.value?.status || "draft",
  updates: currentNotice.value?.updates || [],
});

const filteredNotices = computed(() =>
  [...notices.value]?.filter((n) => !notice.value.references.includes(n._id) && n._id !== route.params.id)
);
const references = computed(() => notice.value.references.map((r) => noticeStore.findOne(r)));

const isMediaLibOpen = ref(false);

function getText(goal) {
  const status = notice.value.status;
  const isCopy = currentNotice.value?.original;

  if (isUpdate.value) {
    if (isCopy) {
      if (goal === "draft") return "Save copy as draft";
      if (goal === "pending") {
        const original = noticeStore.findOne(currentNotice.value?.original);
        if (original?.status === "pending") return "Send for review and overwrite original";
        else return "Send copy for review";
      }
      if (goal === "published") return "Publish and overwrite original";
    } else {
      if (status === "draft") {
        if (goal === "draft") return "Save";
        if (goal === "pending") return "Send for review";
        if (goal === "published") return "Publish";
      } else if (status === "pending") {
        if (goal === "draft") {
          if (isAdmin.value) return "Save";
          else return "Create a copy as draft";
        }
        if (goal === "pending") return "Send for review";
        if (goal === "published") return "Publish";
      } else if (status === "published") {
        if (goal === "draft") return "Create a copy as draft";
        if (goal === "pending") return "Send a copy for review";
        if (goal === "published") return "Publish changes";
      }
    }
  } else {
    if (goal === "draft") return "Save as draft";
    if (goal === "pending") return "Send for review";
    if (goal === "published") return "Publish";
  }
}

function openLibrary(type) {
  currentUploadType.value = type;
  isMediaLibOpen.value = true;
}

function addMedia(value) {
  const addFunctions = {
    image: "addImage",
    video: "addVideo",
    audio: "addAudio",
  };

  const addFunctionName = addFunctions[currentUploadType.value];

  if (editorRef.value && typeof editorRef.value[addFunctionName] === "function") {
    editorRef.value[addFunctionName](value.url);
  }

  isMediaLibOpen.value = false;
  currentUploadType.value = null;
}

function getCategory(id) {
  return categories.value.find((c) => c._id === id);
}

function addCategory(cat) {
  if (!notice.value.categories.includes(cat)) {
    notice.value.categories.push(cat);
  }
}

function favCategory(cat) {
  if (!notice.value.categories.includes(cat)) {
    notice.value.categories.push(cat);
    favCategory(cat);
  }

  if (notice.value.categories[0] !== cat) {
    notice.value.categories.splice(notice.value.categories.indexOf(cat), 1);
    notice.value.categories.unshift(cat);
  }
}

function removeCategory(cat) {
  notice.value.categories.splice(notice.value.categories.indexOf(cat), 1);
}

function addReference(n) {
  if (n && n._id) {
    notice.value.references.push(n._id);
  }
}

function removeReference(reference) {
  notice.value.references.splice(notice.value.references.indexOf(reference._id), 1);
}

function getMediaTypes(content) {
  const types = [];

  content.includes("<p") && types.push("text");
  content.includes("<img") && types.push("image");
  content.includes("<audio") && types.push("audio");
  content.includes("<video") && types.push("video");

  return types;
}

async function copyNotice() {
  try {
    notice.value.status = "draft";
    notice.value.original = currentNotice.value._id;
    noticeStore.create(notice.value);
  } catch (err) {
    throw err;
  }
}

async function replaceNotice(goal) {
  try {
    notice.value.status = goal;
    await noticeStore.update(currentNotice.value.original, notice.value);
    await noticeStore.delete(currentNotice.value._id);
  } catch (err) {
    throw err;
  }
}

async function updateNotice(goal) {
  try {
    notice.value.status = goal;
    notice.value.updates.push({
      author: currentUser.value._id,
      date: new Date(),
    });
    noticeStore.update(route.params.id, notice.value);
  } catch (err) {
    throw err;
  }
}

async function save(goal) {
  const status = notice.value.status;
  notice.value.mediaTypes = getMediaTypes(notice.value.content);

  try {
    if (isUpdate.value) {
      if ((status === "published" && goal !== "published") || (status === "pending" && goal === "draft" && !isAdmin.value)) {
        await copyNotice();
        router.push("/admin/notices");
        return;
      }

      if (currentNotice.value.original && goal !== "draft") {
        await replaceNotice(goal);
        router.push("/admin/notices");
        return;
      }

      await updateNotice(goal);
      router.push("/admin/notices");
    } else {
      noticeStore.create(notice.value);
      router.push("/admin/notices");
    }
  } catch (err) {
    console.log(handleError(err));
    error.value = handleError(err);
  }
}

categoriesStores.getRoots();

onMounted(() => {
  const inst = inputRef.value;
  if (inst && typeof inst.focus === "function") {
    inst.focus();
  } else if (inst && inst.$el && typeof inst.$el.focus === "function") {
    inst.$el.focus();
  }
});
</script>

<style scoped>
.notice-editor-btn {
  padding: var(--size-2) var(--size-4);
}

.notice-config-container {
  width: auto;
  min-width: 300px;
}

.notice-config-list {
  gap: var(--size-2);
}
</style>
