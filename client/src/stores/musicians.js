import { defineStore } from "pinia";
import { api } from "@/api/axios";

const endPoint = "/musicians";

export const useMusicianStore = defineStore("musicians", {
  state: () => ({
    musicians: [],
    loaded: false,
  }),

  getters: {
    list() {
      return this.musicians;
    },

    findOne() {
      return (id) => this.musicians.find((m) => m._id === id);
    },
  },

  actions: {
    async initialize() {
      if (this.loaded) return;
      this.loaded = true;
      await this.get();
    },

    async create(data) {
      await api.post(endPoint, data);
      await this.get();
      await Promise.resolve(); // => No need
    },

    async get() {
      const { data } = await api.get(endPoint);
      this.musicians = data;
    },

    async update(id, data) {
      await api.patch(`${endPoint}/${id}`, data);
      await this.get();
    },

    async delete(id) {
      await api.delete(`${endPoint}/${id}`);
      await this.get();
    },
  },
});
