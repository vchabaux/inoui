exports.appSettings = {
  CNRS1: {
    name: "CNRS 1",
    project: "cnrs1",
    map: {
      mapStyle: "mapbox://styles/mapbox/dark-v10",
      center: [2.2153, 48.8924],
      zoom: 15,
    },

    nakala: {
      active: true,
      collection: "10.34847/nkl.c57c6ep9",
      licenses: [
        { id: "CC-BY-4.0", name: "CC BY 4.0", code: "CC-BY-4.0" },
        { id: "CC-BY-SA-4.0", name: "CC BY-SA 4.0", code: "CC-BY-SA-4.0" },
        { id: "CC-BY-NC-4.0", name: "CC BY-NC 4.0", code: "CC-BY-NC-4.0" },
        { id: "CC-BY-NC-SA-4.0", name: "CC BY-NC-SA 4.0", code: "CC-BY-NC-SA-4.0" },
        { id: "CC-BY-ND-4.0", name: "CC BY-ND 4.0", code: "CC-BY-ND-4.0" },
        { id: "CC0-1.0", name: "CC0 1.0", code: "CC0-1.0" },
      ],
      language: { id: "fr", label: "French" },
      assetMetas: [],
    },
    storage: {
      destination: "nakala",
    },

    langs: {
      public: ["FR"],
    },
  },
  CNRS2: {
    name: "CNRS 2",

    project: "cnrs2",

    map: {
      mapStyle: "mapbox://styles/mapbox/streets-v11",
      center: [-9.142685, 38.736946],
      zoom: 14,
    },

    nakala: {
      active: false,
    },
  },
};
