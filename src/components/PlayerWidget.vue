<template>
  <div>
    <div v-show="custom" class="ar-player">
      <div class="ar-player-actions">
        <icon-button
          id="play"
          class="ar-icon ar-icon__lg ar-player__play"
          :name="playBtnIcon"
          :class="{
            'ar-player__play--active': isPlaying,
            disabled: disablePlayButton,
          }"
          @click="playback"
        />
      </div>

      <div class="ar-player-bar">
        <div class="ar-player__time">{{ playedTime }}</div>
        <line-control
          class="ar-player__progress"
          ref-id="progress"
          :percentage="progress"
          @change-linehead="_onUpdateProgress"
        />
        <div class="ar-player__time">{{ duration }}</div>
        <volume-control
          @change-volume="_onChangeVolume"
          :class="{ disabled: disablePlayButton }"
        />
      </div>

      <audio :id="playerUniqId" :src="audioSource" type="audio/mpeg" />
    </div>
    <div v-show="!custom">
      <figure class="recorder-player">
        <audio controls :src="audioSource" type="audio/mpeg" class="mx-auto">
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </figure>
    </div>
  </div>
</template>

<script>
import IconButton from "./IconButton.vue";
import LineControl from "./LineControl.vue";
import VolumeControl from "./VolumeControl.vue";
import { convertTimeMMSS } from "@/lib/Utils";

export default {
  name: "PlayerWidget",

  components: {
    IconButton,
    LineControl,
    VolumeControl,
  },

  props: {
    src: { type: String },
    record: { type: Object },
    filename: { type: String },
    custom: { type: Boolean, default: false },
  },

  data() {
    return {
      isPlaying: false,
      duration: convertTimeMMSS(0),
      playedTime: convertTimeMMSS(0),
      progress: 0,
    };
  },

  mounted() {
    this.player = document.getElementById(this.playerUniqId);
    debugger;
    if (!!this.player) {
      this.player.addEventListener("ended", () => {
        this.isPlaying = false;
      });

      this.player.addEventListener("loadeddata", (ev) => {
        this._resetProgress();
        this.duration = convertTimeMMSS(this.player.duration);
      });

      this.player.addEventListener("timeupdate", this._onTimeUpdate);

      this.$eventBus.$on("remove-record", () => {
        this._resetProgress();
      });
    }
  },

  computed: {
    disablePlayButton() {
      return !!this.src;
    },
    audioSource() {
      if (!this.src && this.record) {
        return this.record.url;
      }
      return this.src;
    },
    playBtnIcon() {
      return this.isPlaying ? "pause" : "play";
    },
    playerUniqId() {
      return `audio-player${this._uid}`;
    },
  },

  methods: {
    playback() {
      if (!this.audioSource) {
        return;
      }

      if (this.isPlaying) {
        this.player.pause();
      } else {
        setTimeout(() => {
          this.player.play();
        }, 0);
      }

      this.isPlaying = !this.isPlaying;
    },
    _resetProgress() {
      if (this.isPlaying) {
        this.player.pause();
      }

      this.duration = convertTimeMMSS(0);
      this.playedTime = convertTimeMMSS(0);
      this.progress = 0;
      this.isPlaying = false;
    },
    _onTimeUpdate() {
      this.playedTime = convertTimeMMSS(this.player.currentTime);
      this.progress = (this.player.currentTime / this.player.duration) * 100;
    },
    _onUpdateProgress(pos) {
      if (pos) {
        this.player.currentTime = pos * this.player.duration;
      }
    },
    _onChangeVolume(val) {
      if (val) {
        this.player.volume = val;
      }
    },
  },
};
</script>

<style lang="scss">
.ar-player {
  width: 100%;
  height: unset;
  border: 0;
  border-radius: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: unset;

  & > .ar-player-bar {
    border: 1px solid #ddd;
    border-radius: 1em;
    margin: 0 0 0 5px;

    & > .ar-player__progress {
      width: 100%;
    }
  }

  &-bar {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 12px;
    margin: 0 5px;
    flex: 1;
  }

  &-actions {
    width: 55%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex: 0;
  }

  &__progress {
    width: 160px;
    margin: 0 8px;
  }

  &__time {
    color: rgba(84, 84, 84, 0.5);
    font-size: 16px;
    width: 41px;
  }

  &__play {
    width: 32px;
    height: 32px;
    background-color: #ffffff;
    box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.07);

    &--active {
      fill: white !important;
      background-color: #05cbcd !important;

      &:not(.disabled):hover {
        fill: #505050 !important;
      }
    }
  }
}

div.disabled {
  color: grey;
  border-color: white;
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed !important;
  user-select: none;
}
</style>
