import { defineStore } from "pinia";
import { api } from "@/api/axios";

export const useMediaStore = defineStore("media", {
  state: () => ({
    assets: [],
    loaded: false,
  }),

  getters: {
    list() {
      return this.assets;
    },

    findOne() {
      return (id) => this.assets.find((asset) => asset._id === id);
    },
  },
  actions: {
    async initialize() {
      if (this.loaded) return;
      await this.getAll();
      this.loaded = true;
    },

    async getAll() {
      try {
        const { data } = await api.get("/assets");
        this.assets = data;
      } catch (err) {}
    },

    async create(files, tags) {
      const fd = new FormData();

      for (const file of files) {
        fd.append("files", file);
      }

      for (const tag of tags) fd.append("tags", tag);

      try {
        const { data } = await api.post("/assets", fd);

        await this.getAll();
      } catch (err) {
        console.error(err.response);
      }
    },

    async updateOne(id, tags) {
      try {
        const { data } = await api.patch(`/assets/${id}`, { tags });
        await this.getAll();
      } catch (err) {
        console.error(err.response);
      }
    },

    async deleteOne(id) {
      await api.delete(`/assets/${id}`);
      await this.getAll();
    },
  },
});
