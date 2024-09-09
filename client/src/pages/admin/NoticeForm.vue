<template>
  <!-- Preview dialog -->
  <Notice v-if="currentNotice" :noticeId="currentNotice?._id" :open="isPreviewing" @close="isPreviewing = false" />

  <!-- Medias dialog -->
  <Dialog v-if="isMediaLibOpen" id="assets" :open="isMediaLibOpen" modal @close="isMediaLibOpen = false">
    <Medias picker @select="addMedia" :mediaType="currentUploadType" />
  </Dialog>

  <Container flow="row-between" variant="dash-title">
    <h1>
      {{ isUpdate ? `${notice?.title} (${notice?.status})` : "New notice" }}
    </h1>
    <Button v-if="isUpdate" aria-label="preview" @click="isPreviewing = true"> Preview </Button>
  </Container>

  <Container tag="form" width="l" stretched centered @submit.prevent>
    <h2>Notice information</h2>
    <Field label="title" type="text" v-model="notice.title" autofocus ref="inputRef" />
    <Field class="notice-checkbox" label="the title is visible in the notice" type="checkbox" v-model="notice.hasTitle" />
    <Editor label="content" v-model="notice.content" ref="editorRef" mediaManagement="custom" @upload="openLibrary" />

    <Container class="notice-config-container" stretched>
      <h2>Categories</h2>
      <Text class="small-text" variant="fade"> Categories allow the user to filter points on the map. The main category icon is displayed in the point </Text>
      <Container tag="ul" variant="surface" class="notice-config-list" flow="row">
        <li v-if="!notice.categories.length">No category yet</li>
        <Tag v-for="(category, i) in notice.categories" :key="i" tag="li" :label="getCategory(category._id)?.name" @delete="removeCategory(category)" />
      </Container>
      <Categories :favorite="favCat._id" @star="favCategory" @select="addCategory" />
    </Container>

    <Container class="notice-config-container" stretched>
      <h2>References</h2>
      <Text class="small-text" variant="fade"> References are displayed at the bottom of the notice</Text>
      <Field v-if="filteredNotices.length" label="Select a notice" type="select" :options="filteredNotices" @change="addReference" :formatter="(n) => n.title" />
      <Container tag="ul" variant="surface" class="notice-config-list" stretched>
        <li v-if="!notice.references.length">No reference yet</li>
        <li v-for="(reference, i) in references" :key="i">
          <Container flow="row-between">
            <Text>{{ reference.title }}</Text>
            <Button aria-label="remove" title="remove" variant="outline" size="s" @click="removeReference(reference)">
              <Icon name="xmark" />
            </Button>
          </Container>
        </li>
      </Container>
    </Container>
  </Container>

  <Container v-if="currentNotice?.original || currentNotice?.status === 'published'" width="l" centered flow="row" class="-end">
    <Text v-if="currentNotice?.original">You are working on a copy of {{ noticeStore.findOne(currentNotice.original)?.title }}</Text>
    <Text v-if="currentNotice?.status === 'published'">This notice is currently online</Text>
  </Container>
  <Container centered stretched width="s">
    <Voice v-if="error" :type="error.type" :message="error.message" :closable="true" @close="error = null" />
  </Container>

  <Container width="l" centered flow="row" class="-end">
    <Button variant="outline" @click="save('draft')">
      {{ getText("draft") }}
    </Button>
    <Button v-if="!isAdmin" @click="save('pending')">
      {{ getText("pending") }}
    </Button>
    <Button v-else @click="save('published')">
      {{ getText("published") }}
    </Button>
  </Container>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { Text, Field, Editor, Button, Container, Icon, Dialog } from "@owlabio/owl-ui";
import Notice from "@/components/notice/Notice.vue";
import Tag from "@/components/Tag.vue";
import Medias from "@/pages/admin/Medias.vue";
import { Categories } from "@owlabio/category-manager";
import { useRoute, useRouter } from "vue-router";
import { useStoreCategory } from "@owlabio/category-manager";
import { useStore } from "@/stores";
import { handleError } from "@/utils";
import Voice from "@/components/Voice.vue";

const route = useRoute();
const router = useRouter();
const authStore = useStore("auth");
const noticeStore = useStore("notice");
const settingsStore = useStore("settings");
const categoriesStores = useStoreCategory();

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

const filteredNotices = computed(() => [...notices.value]?.filter((n) => !notice.value.references.includes(n._id) && n._id !== route.params.id));
const references = computed(() => notice.value.references.map((r) => noticeStore.findOne(r)));

const isMediaLibOpen = ref(false);

function getText(goal) {
  let status = notice.value.status;
  let isCopy = currentNotice.value?.original;

  if (isUpdate.value) {
    if (isCopy) {
      if (goal === "draft") return "Save copy as draft";
      if (goal === "pending") {
        if (noticeStore.findOne(currentNotice.value.original).status === "pending") return "Send for review and overwrite original";
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
  /**
   * Instead of having it hardcoded
   * Can extract keys for the editorRef addX functions
   * lowercase and remove the "add" in order to make it dynamic
   * This is assuming editorRef will follow the addX pattern
   */

  const addFunctions = {
    image: "addImage",
    video: "addVideo",
    audio: "addAudio",
  };

  const addFunctionName = addFunctions[currentUploadType.value];

  editorRef.value[addFunctionName](value.url);

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

function addReference(e, reference) {
  notice.value.references.push(reference._id);
}

function removeReference(reference) {
  notice.value.references.splice(notice.value.references.indexOf(reference._id), 1);
}

// save process

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
  let status = notice.value.status;
  notice.value.mediaTypes = getMediaTypes(notice.value.content);

  /* ==== IS UPDATE SCENARIOS
    If the notice is NOT a copy :
        --> UPDATE
        From draft to all (user & admin)
        From pending to pending (user) / to draft or published (admin)
        From published to published (admin)

        --> COPY
        From pending to draft (user)
        From published to draft or pending (user) / to draft (admin)

    If the notice IS a copy :
        --> UPDATE
        From draft to draft (user & admin)
        From draft to pending IF OG IS NOT PENDING (user)

        --> REPLACE
        From draft to pending IF OG IS PENDING (user)
        From whatever to published IF OG IS PUBLISHED (admin)
  **/

  try {
    if (isUpdate.value) {
      // COPY
      if ((status === "published" && goal !== "published") || (status === "pending" && goal === "draft" && !isAdmin.value)) {
        await copyNotice();
        router.push("/admin/notices");
        return;
      }

      // REPLACE
      if (currentNotice.value.original && goal !== "draft") {
        await replaceNotice(goal);
        router.push("/admin/notices");
        return;
      }

      // UPDATE
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

onMounted(() => inputRef.value && inputRef.value.componentRef.domRef.focus());
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

:deep(.owl-dialog-content) {
  width: auto;
}
</style>
