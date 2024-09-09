class Player {
  constructor(id, url, cb, options = {}) {
    this.player = new Audio(url);
    this.id = id;
    this.cb = cb;
    this.currentTime = 0;
    this.hasPlayed = false;
    this.volume = 0;
    this.options = options;
    this.initialize();
  }

  initialize() {
    this.player.load();

    this.player.addEventListener("loadeddata", () => {
      this.cb && this.cb();
    });

    if (this.options.loop) {
      this.player.addEventListener(
        "ended",
        () => {
          this.player.currentTime = 0;
          this.play();
        },
        false
      );
    }

    this.player.volume = this.volume;
  }

  getId() {
    return this.id;
  }

  setVolume(volume) {
    this.player.volume = volume;
  }

  play() {
    this.player.play();

    this.hasPlayed = true;
  }

  stop() {
    this.setVolume(0);
    this.player.pause();
  }
}

export default Player;
