const config = require("../../src/config");

exports.pages = [
  {
    slug: "intro",
    type: "intro",
    title: "Welcome to the CNRS 1",
    subtitle: "A place to discover the CNRS",
    content: ["Lorem atque et vitae est nemo. Labore officia sunt ut dolor iusto non. Veritatis inventore ducimus ut est animi saepe doloremque. Magnam aliquam error quos et nemo. Rerum ex quis sint sapiente et. Autem et nesciunt magni est.", "deuzio"],
    video: "http://localhost:4000/uploads/35907fb7-4cb8-4d8f-96f9-96fdc2a662aa.mp4",
    audio: "http://localhost:4000/uploads/2373337a-570b-4d45-b534-872a5555a46e.mp3",
  },
  {
    slug: "credits",
    type: "credits",
    content: "🇪🇺 This app was created by the CNRS",
  },
  {
    slug: "about",
    type: "page",
    title: "About",
    content: '<h2 class="owl-editor-title">ABOUT</h2><p>Joao opened his restaurant 27 years ago. Atque et vitae est nemo. Labore officia sunt ut dolor iusto non. Veritatis inventore ducimus ut est animi saepe doloremque. Magnam aliquam error quos et nemo. Rerum ex quis sint sapiente et. Autem et nesciunt magni est.</p><img src="https://picsum.photos/400/200"><p>Sed accusantium et sequi beatae sint dolores fugit iure. Aut exercitationem quia velit iusto qui saepe. Animi consequatur eum et. Est et minus et et perferendis. Voluptatem ipsum itaque odit perferendis. Aut ut pariatur aut voluptatum amet.</p>',
  },
  {
    slug: "itineraries",
    type: "page",
    title: "Itineraries",
    content: '<h2 class="owl-editor-title">PARCOURS</h2><p>Joao opened his restaurant 27 years ago. Atque et vitae est nemo. Labore officia sunt ut dolor iusto non. Veritatis inventore ducimus ut est animi saepe doloremque. Magnam aliquam error quos et nemo. Rerum ex quis sint sapiente et. Autem et nesciunt magni est.</p><img src="https://picsum.photos/400/200"><p>Sed accusantium et sequi beatae sint dolores fugit iure. Aut exercitationem quia velit iusto qui saepe. Animi consequatur eum et. Est et minus et et perferendis. Voluptatem ipsum itaque odit perferendis. Aut ut pariatur aut voluptatum amet.</p>',
  },
];
