import { defineStore } from "pinia";
import { api } from "@/api/axios";

const endPoint = "/nodes";

const findNode = (roots, id) => {
  let found;
  for (const root of roots) {
    found = walk(root, id);
    if (found) {
      return found;
    }
  }

  function walk(root, id) {
    if (root._id === id) return root;

    for (const child of root.children) {
      if (child._id === id) return child;
      else {
        found = walk(child, id);
        if (found) return found;
      }
    }
  }
};

export function reduceNodes(roots, cb, accumulator = {}) {
  for (const root of roots) {
    cb(root, accumulator);

    for (const child of root.children) {
      walk(child, accumulator);
    }

    function walk(root) {
      cb(root, accumulator);

      for (const child of root.children) {
        cb(child, acc);
        walk(child);
      }
    }
  }

  return accumulator;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function filterNodes(roots, cb) {
  /**
   *
   */

  const filteredArray = [];

  for (const root of roots) {
    const isMatch = cb(root);

    if (isMatch) {
      filteredArray.push(root);
    }

    for (const child of root.children) {
      walk(child);
    }
  }

  function walk(root) {
    const isMatch = cb(root);

    if (isMatch) {
      filteredArray.push(root);
    }

    for (const child of root.children) {
      const isMatch = cb(child);
      if (isMatch) {
        filteredArray.push(child);
      }
      walk(child);
    }
  }

  return filteredArray;
}

export const useTrackStore = defineStore("tracks", {
  state: () => ({
    tracks: [],
    loaded: false,
  }),

  getters: {
    list() {
      return this.tracks || [];
    },

    findOne() {
      return (id) => {
        return findNode(this.tracks, id);
      };
    },

    isLoaded() {
      return this.loaded;
    },

    notices() {
      // Get all notices that are associated within the points.

      const roots = this.tracks;

      const allNoticesFound = [];

      const extract = (node) => {
        for (const child of node) {
          if (child.attributes && child.attributes.notice) {
            allNoticesFound.push(child.attributes.notice._id);
          }
          extract(child.children);
        }
      };

      for (const root of roots) extract(root.children);

      return allNoticesFound;
    },

    musicians() {
      const allMusiciansFound = [];
      this.tracks.forEach((track) => {
        track.attributes.musician &&
          allMusiciansFound.push(track.attributes.musician);
      });

      return [...new Set(allMusiciansFound)];
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
      const { data } = await api.get(endPoint, {
        params: { type: "roots", context: "Parcours" },
      });

      const reducedNodes = reduceNodes(
        data,
        (node, acc) => {
          if (node.context === "Point") {
            // const coordinates = node.attributes.coordinates;

            // const stringifiedCoords = coordinates.join("");
            const key = node.attributes.placeName;

            if (acc[key]) {
              acc[key].push(node);
            } else {
              acc[key] = [node];
            }
          }

          return acc;
        },
        {}
      );

      for (const key in reducedNodes) {
        if (reducedNodes[key].length > 1) {
          const nodes = reducedNodes[key];
          let offsetRatio = 0;
          for (const node of nodes) {
            node.attributes.offset = [0, 24 * offsetRatio];
            offsetRatio += 1;
          }
        }
      }

      this.tracks = data;
    },

    async createPoint(parentId, data) {
      await api.post(
        endPoint,
        { ...data, parentId: parentId, context: "Point" },
        {
          params: {
            type: "child",
          },
        }
      );

      await this.get();
    },

    async getNode(id) {
      return api.get(endPoint + "/" + id);
    },

    async createTrack(name, parentId = null) {
      const { data } = await api.post(
        endPoint,
        {
          name,
          context: "Parcours",
          parentId,
          attributes: {
            isHidden: false,
            status: "draft",
            color: "#000000",
            transparence: false,
            media: {
              url: "",
              type: "audio",
            },
          },
        },
        {
          params: { context: "Parcours", type: parentId ? "child" : "root" },
        }
      );
      await this.get();
      return data;
    },

    async updateNode(id, data) {
      await api.patch(`${endPoint}/${id}?context=${data.context}`, data);
      await this.get();
    },

    async swapChildren(firstId, secondId) {
      await api.patch(`${endPoint}/${firstId}/${secondId}/position`);
      await this.get();
    },

    async deleteOne(id) {
      await api.delete(`${endPoint}/${id}`);
      await this.get();
    },
  },
});
