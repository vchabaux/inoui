import { useAuthStore } from "./auth";
import { useMediaStore } from "./medias";
import { useNakalaStore } from "./nakala";
import { usePageStore } from "./pages";
import { useTrackStore } from "./tracks";
import { useUserStore } from "./users";
import { useNoticeStore } from "./notices";
import { usePlaylistStore } from "./playlists";
import { useSettingsStore } from "./settings";
import { useMusicianStore } from "./musicians";

const stores = {
  auth: useAuthStore,
  media: useMediaStore,
  nakala: useNakalaStore,
  notice: useNoticeStore,
  page: usePageStore,
  track: useTrackStore,
  playlist: usePlaylistStore,
  settings: useSettingsStore,
  user: useUserStore,
  musician: useMusicianStore,
};

export const useStore = (storeName) => {
  const currentStore = stores[storeName];

  if (!currentStore) {
    throw Error(
      `The store : ${storeName} does not exist, or must be imported in @/stores/index.js, store can only be one of ${Object.keys(
        stores
      ).join(" , ")}`
    );
  }

  return currentStore();
};
