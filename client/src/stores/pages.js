import { defineStore } from "pinia";
import { api } from "@/api/axios";

export const usePageStore = defineStore("pages", {
  state: () => ({
    pages: null,
    loaded: false,
  }),

  getters: {
    list() {
      return this.pages || [];
    },

    findOne() {
      return (id) => {
        return this.pages.find((p) => p._id === id);
      };
    },
  },

  actions: {
    async initialize() {
      try {
        await this.get();
      } catch (err) {
      } finally {
        this.loaded = true;
      }
    },

    async get() {
      const { data } = await api.get("/pages");
      this.pages = data;
      return Promise.resolve();
    },

    async update(id, page) {
      await api.patch("/pages/" + id, page);
      await this.get();
      Promise.resolve();
    },
  },
});
