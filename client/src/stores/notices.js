import { defineStore } from "pinia";
import { api } from "@/api/axios";

export const useNoticeStore = defineStore("notices", {
  state: () => ({
    notices: null,
    current: null,
  }),

  getters: {
    list() {
      return this.notices || [];
    },

    findOne() {
      return (id) => {
        return this.notices.find((notice) => notice._id === id);
      };
    },
  },

  actions: {
    async find() {
      const { data } = await api.get("/notices");
      this.notices = data;
      return Promise.resolve();
    },

    async create(notice) {
      await api.post("/notices", notice);
      await this.find();
      await Promise.resolve();
    },

    async update(id, notice) {
      await api.patch("/notices/" + id, notice);
      await this.find();
      Promise.resolve();
    },

    async delete(id) {
      await api.delete("/notices/" + id);
      await this.find();
      Promise.resolve();
    },
  },
});
