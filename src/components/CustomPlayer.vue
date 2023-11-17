<template>
  <div class="recorder-player">
    <div class="vue-player">
      <div class="vue-player-actions">
        <icon-button
          id="play"
          class="ar-icon ar-icon__lg vue-player__play"
          :name="playBtnIcon"
          :class="{
            'vue-player__play--active': isPlaying,
          }"
          @onClickIcon="() => playback()"
        />
      </div>

      <div class="vue-player-bar">
        <div v-show="!compact" class="vue-player__time">
          {{ playedTime }} / {{ duration }}
        </div>
        <line-control
          class="vue-player__progress"
          ref-id="progress"
          :percentage="progress"
          @change-linehead="onUpdateProgress"
        />
        <volume-control @change-volume="onChangeVolume" />
      </div>
    </div>
    <audio :src="audioSource" ref="playerRef" type="audio/mpeg" />
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
    compact: { type: Boolean, default: false },
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
    this.player = this.$refs.playerRef;

    this.player.addEventListener("ended", () => {
      this.isPlaying = false;
    });

    this.player.addEventListener("loadeddata", (ev) => {
      this.resetProgress();
      this.duration = convertTimeMMSS(this.player.duration);
    });

    this.player.addEventListener("timeupdate", this.onTimeUpdate);
  },

  computed: {
    audioSource() {
      if (this.src) {
        return this.src;
      }
      return "";
    },

    playBtnIcon() {
      return this.isPlaying ? "pause" : "play";
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

    resetProgress() {
      if (this.isPlaying) {
        this.player.pause();
      }

      this.duration = convertTimeMMSS(0);
      this.playedTime = convertTimeMMSS(0);
      this.progress = 0;
      this.isPlaying = false;
    },

    onTimeUpdate() {
      this.playedTime = convertTimeMMSS(this.player.currentTime);
      this.progress = (this.player.currentTime / this.player.duration) * 100;
    },

    onUpdateProgress(pos) {
      if (pos) {
        this.currentTime = pos * this.duration;
      }
    },

    onChangeVolume(val) {
      if (val) {
        this.player.volume = val;
      }
    },
  },
};
</script>

<style lang="scss">
.recorder-player {
  margin: 0.5em 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vue-player {
  width: 100%;
  height: unset;
  border: 0;
  border-radius: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: unset;
  border: 1px solid var(--border-color, rgba(100, 100, 100, 0.2));
  border-radius: 10em;
  padding: 0.5em;
  box-sizing: border-box;
  margin-top: 0.75em;

  & > .vue-player-bar {
    margin: 0 0 0 5px;

    & > .vue-player__progress {
      width: 100%;
    }
  }

  &-bar {
    display: flex;
    align-items: center;
    height: 32px;
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
    margin: 0 0.9em;
  }

  &__time {
    white-space: nowrap;
    color: var(--text-color, #333);
    font-size: 0.8em;
    width: 80px;
  }

  &__play {
    width: 32px;
    height: 32px;
  }
}
</style>
