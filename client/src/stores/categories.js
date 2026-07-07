import { defineStore } from "pinia";
import { api } from "@/api/axios";

export const useCategoryStore = defineStore("categories", {
  state: () => ({
    categories: [],
    loaded: false,
  }),

  getters: {
    list() {
      return this.categories;
    },

    findOne() {
      return (id) => {
        function walk(node) {
          if (node._id === id) return node;
          for (const child of node.children || []) {
            const found = walk(child);
            if (found) return found;
          }
          return null;
        }
        for (const root of this.categories) {
          const found = walk(root);
          if (found) return found;
        }
        return null;
      };
    },
  },

  actions: {
    async initialize() {
      if (this.loaded) return;
      this.loaded = true;
      await this.getRoots();
    },

    async getRoots() {
      const { data } = await api.get("/nodes", {
        params: { type: "roots", context: "Category" },
      });
      this.categories = data;
    },

    async createNode(data) {
      await api.post("/nodes", data, {
        params: { type: data.parentId ? "child" : "root", context: "Category" },
      });
      await this.getRoots();
    },

    async updateNode(id, data) {
      await api.patch(`/nodes/${id}`, data);
      await this.getRoots();
    },

    async deleteNode(id) {
      await api.delete(`/nodes/${id}`);
      await this.getRoots();
    },
  },
});
