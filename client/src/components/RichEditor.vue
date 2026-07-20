<template>
  <el-form-item v-if="label" :label="label" class="rich-editor-wrapper">
    <div ref="toolbarContainer" class="ql-toolbar">
      <span class="ql-formats">
        <button class="ql-bold" />
        <button class="ql-italic" />
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered" />
        <button class="ql-list" value="bullet" />
      </span>
      <span class="ql-formats">
        <select class="ql-header">
          <option value="2" />
          <option value="3" />
          <option selected />
        </select>
      </span>
      <span v-if="mediaManagement === 'custom'" class="ql-formats">
        <button class="custom-btn" title="Image" @click="emit('upload', 'image')">
          <i class="fa-solid fa-image" />
        </button>
        <button class="custom-btn" title="Video" @click="emit('upload', 'video')">
          <i class="fa-solid fa-video" />
        </button>
        <button class="custom-btn" title="Audio" @click="emit('upload', 'audio')">
          <i class="fa-solid fa-music" />
        </button>
      </span>
    </div>
    <div ref="editorContainer" class="rich-editor-body" />
  </el-form-item>
  <div v-else class="rich-editor-wrapper">
    <div ref="toolbarContainer" class="ql-toolbar">
      <span class="ql-formats">
        <button class="ql-bold" />
        <button class="ql-italic" />
      </span>
      <span class="ql-formats">
        <button class="ql-list" value="ordered" />
        <button class="ql-list" value="bullet" />
      </span>
      <span class="ql-formats">
        <select class="ql-header">
          <option value="2" />
          <option value="3" />
          <option selected />
        </select>
      </span>
      <span v-if="mediaManagement === 'custom'" class="ql-formats">
        <button class="custom-btn" title="Image" @click="emit('upload', 'image')">
          <i class="fa-solid fa-image" />
        </button>
        <button class="custom-btn" title="Video" @click="emit('upload', 'video')">
          <i class="fa-solid fa-video" />
        </button>
        <button class="custom-btn" title="Audio" @click="emit('upload', 'audio')">
          <i class="fa-solid fa-music" />
        </button>
      </span>
    </div>
    <div ref="editorContainer" class="rich-editor-body" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const BlockEmbed = Quill.import("blots/block/embed");

class VideoBlot extends BlockEmbed {
  static blotName = "video";
  static tagName = "video";

  static create(value) {
    const node = super.create(value);
    node.setAttribute("controls", "");
    node.setAttribute("src", value);
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

class AudioBlot extends BlockEmbed {
  static blotName = "audio";
  static tagName = "audio";

  static create(value) {
    const node = super.create(value);
    node.setAttribute("controls", "");
    node.setAttribute("src", value);
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

Quill.register(VideoBlot);
Quill.register(AudioBlot);

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: undefined },
  mediaManagement: { type: String, default: undefined },
});

const emit = defineEmits(["update:modelValue", "upload"]);

const toolbarContainer = ref(null);
const editorContainer = ref(null);
let quill = null;

onMounted(() => {
  quill = new Quill(editorContainer.value, {
    theme: "snow",
    modules: {
      toolbar: toolbarContainer.value,
    },
  });

  if (props.modelValue) {
    quill.clipboard.dangerouslyPasteHTML(0, props.modelValue);
  }

  quill.on("text-change", () => {
    if (quill) {
      emit("update:modelValue", quill.getSemanticHTML() || quill.root.innerHTML);
    }
  });
});

onBeforeUnmount(() => {
  quill = null;
});

function getInsertIndex() {
  if (!quill) return 0;
  const sel = quill.getSelection();
  return sel ? sel.index : quill.getLength() - 1;
}

function addImage(url) {
  if (!quill) return;
  const index = getInsertIndex();
  quill.insertEmbed(index, "image", url);
}

function addVideo(url) {
  if (!quill) return;
  const index = getInsertIndex();
  quill.insertEmbed(index, "video", url);
}

function addAudio(url) {
  if (!quill) return;
  const index = getInsertIndex();
  quill.insertEmbed(index, "audio", url);
}

defineExpose({ addImage, addVideo, addAudio });
</script>

<style>
.rich-editor-body .ql-editor {
  min-height: 300px;
}

.ql-toolbar button.custom-btn {
  width: 28px;
  height: 24px;
  padding: 3px 5px;
  color: #444;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.ql-toolbar button.custom-btn:hover {
  color: #409eff;
}
</style>

<style scoped>
.rich-editor-wrapper {
  width: 100%;
}
</style>