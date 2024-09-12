import { ref, isRef, watchEffect, unref } from "vue";
import Player from "@/utils/player.js";

const _DISTANCE = 500;

export const useAudios = (audios, mode, hasAudio, currentTrack) => {
  const players = ref([]);

  function initAudios() {
    const audioUnref = unref(audios);
    const modeOK = unref(mode);
    const audioOK = unref(hasAudio);
    const globalOK = unref(currentTrack);

    const playable = audioOK && !globalOK;// && modeOK === "narration";

    for (const audio of audioUnref) {
      const found = players.value.find((player) => player.id === audio.id);
      if (!found) players.value.push(new Player(audio.id, audio.url));
    }

    for (const audio of audioUnref) {
      const player = players.value.find((p) => p.getId() === audio.id);

      const percentage = (audio.distance * 100) / _DISTANCE;
      const volumePercentage = percentage / 100;
      const volume = volumePercentage > 1 ? 0 : 1 - volumePercentage;

      player.setVolume(volume);

      playable ? player.play() : player.stop();
    }
  }

  if (isRef(audios)) {
    watchEffect(initAudios);
  } else {
    initAudios();
  }
};
