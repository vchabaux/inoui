exports.tracks = [
  {
    name: "Balade en ville",
    context: "Parcours",
    attributes: {
      status: "draft",
      color: "lightsalmon",
      points: [],
      categories: [],
      collaborators: [],
      authors: [],
    },
  },
];

exports.points = [
  {
    name: "Joao's restaurant",
    context: "Point",
    parent: "Balade en ville",
    attributes: {
      coordinates: [-9.140238825378646, 38.71444717011474],
      marker: "pepe.png",
    },
  },
  {
    name: "Astrud's house",
    context: "Point",
    parent: "Balade en ville",
    attributes: {
      coordinates: [-9.129252497253248, 38.723956468524875],
      marker: "pepe.png",
    },
  },
  {
    name: "University of Lisbon",
    context: "Point",
    parent: "Balade en ville",
    attributes: {
      coordinates: [-9.147105280456657, 38.72194756723843],
      marker: "pepe.png",
    },
  },
];
