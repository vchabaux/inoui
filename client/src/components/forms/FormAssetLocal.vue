<template>
  <el-form @submit.prevent class="width-s">
    <template v-if="!isUpdate">
      <!-- VOICE -->
      <Voice
        v-if="error"
        :message="error.message"
        :type="error.type"
        @close="error = null"
        :closable="true"
      />

      <!-- FILES -->
      <h2>Files</h2>
      <el-form-item label="Files">
        <input
          ref="fileInputRef"
          type="file"
          multiple
          style="display: none"
          @change="onFileSelect"
        />
        <el-button @click="fileInputRef?.click()" type="default">
          Choose files
        </el-button>
      </el-form-item>
    </template>

    <div class="list stretched">
      <h2>Tags</h2>
      <el-form-item label="Add a tag">
        <el-input
          v-model="currentTag"
          placeholder="Add a tag"
          @keydown.enter.prevent="handleAddTag"
        />
      </el-form-item>

      <div class="flow-row variant-surface">
        <span class="small-text" v-if="!tags.length">No tag yet</span>
        <Tag v-else v-for="tag in tags" :key="tag" :label="tag" />
      </div>

      <AssetDetails
        v-if="isMulti"
        v-for="assetId in assets"
        :key="assetId"
        :file="getAsset(assetId)"
      />
    </div>

    <el-button
      class="w-full upload-btn"
      :loading="isSubmitting"
      @click="isUpdate ? updateTags() : handleSubmit()"
    >
      {{ isUpdate ? "Save" : "Add to the library" }}
    </el-button>
  </el-form>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "@/stores";
import Tag from "@/components/Tag.vue";
import AssetDetails from "@/components/media/AssetDetails.vue";
import Voice from "@/components/Voice.vue";

const props = defineProps({
  assets: {
    type: [Array, String],
    default: null,
  },
});

const emits = defineEmits(["upload"]);

const mediaStore = useStore("media");

const isMulti = computed(() => Array.isArray(props.assets));

const fileInputRef = ref(null);
const files = ref([]);
const error = ref(null);

const tags = ref([]);
const currentTag = ref("");
const isSubmitting = ref(false);

const isUpdate = computed(() => !!props.assets);

watch(
  () => props.id,
  () => {
    if (!props.id) return;
    const foundMedia = mediaStore.findOne(props.id);
    tags.value = foundMedia.tags;
  },
  {
    immediate: true,
  }
);

const getAsset = (id) => {
  return mediaStore.findOne(id);
};

function onFileSelect(event) {
  files.value = Array.from(event.target.files || []);
}

const handleAddTag = () => {
  const foundTag = tags.value.find(
    (tag) => tag.toLowerCase().trim() === currentTag.value.toLowerCase().trim()
  );

  if (foundTag) {
    currentTag.value = "";
    return;
  }

  tags.value.push(currentTag.value.trim());
  currentTag.value = "";
};

const updateTags = async () => {
  isSubmitting.value = true;
  try {
    const promises = props.assets.map((id) => {
      const currentAsset = mediaStore.findOne(id);
      currentAsset.tags = [...new Set([...currentAsset.tags, ...tags.value])];
      return mediaStore.updateOne(id, currentAsset.tags);
    });

    await Promise.all(promises);
    tags.value = [];
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    if (isUpdate.value) {
      await mediaStore.updateOne(props.id, tags.value);
      return;
    }

    if (!files.value.length) return;
    await mediaStore.create(files.value, tags.value);
    files.value = [];
    if (fileInputRef.value) {
      fileInputRef.value.value = "";
    }
    emits("upload");
  } catch (err) {
    // TODO
  } finally {
    setTimeout(() => {
      isSubmitting.value = false;
    }, 1000);
  }
};
</script>
