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
