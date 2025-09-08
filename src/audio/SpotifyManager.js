/**
 * Basic wrapper around Spotify Web Playback SDK.
 * NOTE: For production you must host a proper OAuth flow; this expects a valid access token passed directly.
 */
export class SpotifyManager {
  constructor({ token, onError, onTrack, audioCtx, pannerSystem }) {
    this.token = token;
    this.onError = onError;
    this.onTrack = onTrack;
    this.audioCtx = audioCtx;
    this.pannerSystem = pannerSystem;
    this.player = null;
    this.pollInterval = null;
  }

  setToken(token) {
    this.token = token;
  }

  async loadSdk() {
    if (window.Spotify) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Spotify SDK"));
      document.head.appendChild(script);
    });
    await new Promise((resolve) => {
      window.onSpotifyWebPlaybackSDKReady = resolve;
    });
  }

  async connect() {
    await this.loadSdk();
    this.player = new window.Spotify.Player({
      name: "16D Sound Chamber",
      getOAuthToken: (cb) => cb(this.token),
      volume: 0.8
    });
    this.player.addListener("initialization_error", ({ message }) => this.onError(message));
    this.player.addListener("authentication_error", ({ message }) => this.onError(message));
    this.player.addListener("account_error", ({ message }) => this.onError(message));
    this.player.addListener("playback_error", ({ message }) => this.onError(message));

    this.player.addListener("player_state_changed", (state) => {
      if (!state) return;
      const track = state.track_window.current_track;
      if (track) {
        this.onTrack({
          title: track.name,
          artist: track.artists.map((a) => a.name).join(", ")
        });
      }
    });

    await this.player.connect();

    // Attempt to transfer playback to this device
    setTimeout(() => {
      this.transferPlayback();
    }, 1200);

    // We cannot route Spotify's internal audio directly through WebAudio reliably without hacks;
    // For demonstration we mimic panner motion by hooking into analyser placeholder (not live audio).
    // In production you could capture via MediaElement + captureStream with user permission and feed to pannerSystem.
  }

  async transferPlayback() {
    try {
      const deviceId = (await this.player._options.id) || this.player._options.id;
      if (!deviceId) return;
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ device_ids: [deviceId], play: true })
      });
    } catch (e) {
      this.onError("Transfer failed: " + e.message);
    }
  }

  async togglePlay() {
    try {
      await this.player.togglePlay();
    } catch (e) {
      this.onError(e.message);
    }
  }

  disconnect() {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}