import { defineStore } from "pinia";
import { api } from "@/api/axios";

export const useUserStore = defineStore("users", {
  state: () => ({
    users: null,
    current: null,
  }),

  getters: {
    list() {
      return this.users || [];
    },

    findOne() {
      return (id) => {
        return this.users.find((user) => user._id === id);
      };
    },
  },

  actions: {
    async find() {
      const { data } = await api.get("/admin/users");
      this.users = data;
      return Promise.resolve();
    },

    async create(user) {
      await api.post("/admin/users", user);
      await this.find();
      await Promise.resolve();
    },

    async update(id, user) {
      await api.patch("/admin/users/" + id, user);
      await this.find();
      Promise.resolve();
    },

    async delete(id) {
      await api.delete("/admin/users/" + id);
      await this.find();
      Promise.resolve();
    },
  },
});
