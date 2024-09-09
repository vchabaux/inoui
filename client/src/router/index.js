import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppMap from "@/pages/app/AppMap.vue";

export const initRouter = (app) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/",
        component: AppMap,
        meta: {
          layout: "LayoutDefault",
          client: true,
        },
      },
      {
        path: "/intro",
        component: () => import("@/pages/app/AppIntro.vue"),
        meta: {
          layout: "LayoutDefault",
        },
      },
      {
        path: "/more/:slug",
        component: () => import("@/pages/app/AppPage.vue"),
        meta: {
          layout: "LayoutDefault",
          client: true,
        },
      },
      {
        path: "/more/musicians",
        component: () => import("@/pages/app/AppMusicians.vue"),
        meta: {
          layout: "LayoutDefault",
          client: true,
        },
      },
      {
        path: "/more/cards",
        component: () => import("@/pages/app/AppCards.vue"),
        meta: {
          layout: "LayoutDefault",
          client: true,
        },
      },
      /**
       * ADMIN
       */
      {
        path: "/admin",
        component: () => import("@/pages/Dashboard.vue"),
        meta: {
          auth: true,
          admin: true,
          layout: "LayoutDashboard",
        },
        children: [
          {
            path: "users",
            component: () => import("@/pages/admin/Users.vue"),
          },
          {
            path: "users/new",
            component: () => import("@/pages/admin/UserForm.vue"),
          },
          {
            path: "users/:id",
            component: () => import("@/pages/admin/UserForm.vue"),
          },
          {
            path: "notices",
            component: () => import("@/pages/admin/Notices.vue"),
          },
          {
            path: "notices/new",
            component: () => import("@/pages/admin/NoticeForm.vue"),
          },
          {
            path: "notices/:id",
            component: () => import("@/pages/admin/NoticeForm.vue"),
          },
          {
            path: "tracks",
            component: () => import("@/pages/admin/Tracks.vue"),
          },
          {
            path: "tracks/new",
            component: () => import("@/pages/admin/TrackForm.vue"),
          },
          {
            path: "tracks/:id",
            component: () => import("@/pages/admin/TrackForm.vue"),
          },
          {
            path: "playlists",
            component: () => import("@/pages/admin/Playlists.vue"),
          },
          {
            path: "playlists/new",
            component: () => import("@/pages/admin/PlaylistForm.vue"),
          },
          {
            path: "playlists/:id",
            component: () => import("@/pages/admin/PlaylistForm.vue"),
          },
          {
            path: "musicians",
            component: () => import("@/pages/admin/Musicians.vue"),
          },
          {
            path: "musicians/new",
            component: () => import("@/pages/admin/MusicianForm.vue"),
          },
          {
            path: "musicians/:id",
            component: () => import("@/pages/admin/MusicianForm.vue"),
          },
          {
            path: "content",
            component: () => import("@/pages/admin/Content.vue"),
          },
          {
            path: "content/:slug",
            component: () => import("@/pages/admin/ContentForm.vue"),
          },
          {
            path: "settings",
            component: () => import("@/pages/admin/Settings.vue"),
          },
          {
            path: "nakala",
            component: () => import("@/pages/admin/Nakala.vue"),
          },
          {
            path: "nakala",
            component: () => import("@/pages/admin/Nakala.vue"),
          },
          {
            path: "medias",
            component: () => import("@/pages/admin/Medias.vue"),
          },
          {
            path: "categories",
            component: () => import("@/pages/admin/Categories.vue"),
          },
          {
            path: "profile",
            component: () => import("@/pages/admin/Profile.vue"),
          },
          {
            path: "icons",
            component: () => import("@/pages/admin/Icons.vue"),
          },
          
        ],
      },
      /**
       * AUTH
       */
      {
        path: "/auth/signin",
        component: () => import("@/pages/auth/Signin.vue"),
        meta: {
          layout: "LayoutForm",
        },
      },
      {
        path: "/password-reset",
        component: () => import("@/pages/auth/ResetPassword.vue"),
        meta: {
          auth: false,
          admin: false,
          layout: "LayoutForm",
        },
      },
      {
        path: "/password-forgotten",
        component: () => import("@/pages/auth/ForgotPassword.vue"),
        meta: {
          auth: false,
          admin: false,
          layout: "LayoutForm",
        },
      },
      {
        path: "/account-invitation",
        component: () => import("@/pages/auth/AccountInvitation.vue"),
        meta: {
          auth: false,
          admin: false,
          layout: "LayoutForm",
        },
      },
      {
        path: "/account-confirm",
        component: () => import("@/pages/auth/AccountConfirmation.vue"),
        meta: {
          auth: false,
          admin: false,
          layout: "LayoutForm",
        },
      },
      /**
       * NOT FOUND
       */
      {
        path: "/admin/:pathMatch(.*)*",
        component: () => import("@/pages/NotFound.vue"),
        meta: {
          layout: "LayoutDashboard",
        },
      },
      {
        path: "/:pathMatch(.*)*",
        component: () => import("@/pages/NotFound.vue"),
        meta: {
          layout: "LayoutDefault",
        },
      },
    ],
  });

  router.beforeEach(async (to, from) => {
    // window.localStorage.removeItem("hasOnboarded"); // this is for testing purposes
    const isNew = window.localStorage.getItem("hasOnboarded") === null;
    if (isNew && to.meta.client) return "/intro";

    const canAccess = await canUserAccess(to);
    return canAccess || "/auth/signin";
  });

  return router;
};

async function canUserAccess(to) {
  if (!to.meta.auth) return true;

  const authStore = useAuthStore();
  if (!authStore.initialized) await authStore.initialize();

  return !!to.meta.auth && authStore.isLoggedIn;
}
