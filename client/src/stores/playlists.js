import { defineStore } from "pinia";
import { api } from "@/api/axios";

const endPoint = "/playlists";

export const usePlaylistStore = defineStore("playlist", {
  state: () => ({
    playlists: [],
    loaded: false,
  }),

  getters: {
    list() {
      return this.playlists;
    },
    findOne() {
      return (id) => this.playlists.find((p) => p._id == id);
    },
  },

  actions: {
    async initialize() {
      if (this.loaded) return;

      this.loaded = true;
      await this.getAll();
    },

    async getAll() {
      const { data } = await api.get(endPoint);
      this.playlists = data;
    },

    async create(playlist) {
      try {
        await api.post(endPoint, playlist);

        this.getAll();
      } catch (err) {}
    },

    async updateOne(id, playlist) {
      await api.patch(`${endPoint}/${id}`, playlist);
      this.getAll();
    },

    async deleteOne(id) {
      await api.delete(`${endPoint}/${id}`);
      this.getAll();
    },
  },
});
