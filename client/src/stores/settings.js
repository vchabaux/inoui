import { defineStore } from "pinia";
import { api } from "@/api/axios";

const endPoint = "/app-settings";

export const useSettingsStore = defineStore("appSettings", {
  state: () => ({
    appSettings: null,

    appProject: null,
    loaded: false,
  }),

  getters: {
    settings() {
      return this.appSettings;
    },

    project() {
      return this.appProject;
    },
  },

  actions: {
    async initialize() {
      await this.get();
      this.loaded = true;
    },

    async get() {
      const { data } = await api.get(endPoint);
      this.appSettings = data;
      this.appProject = this.appSettings.project;
    },

    async update(data) {
      const response = await api.patch(endPoint, data);
      this.appSettings = response.data;
    },

    async setPublicLang(lang) {
      this.appPublicLang = lang;
    },
  },
});
