<template>
  <div class="wave-container">
    <div id="waveform" ref="waveform" />
    <div v-if="isReady" class="wave-controls">
      <icon-button
        v-show="!compact"
        name="backward"
        @click="wavesurfer.skipBackward()"
      />
      <icon-button
        :name="playing ? 'pause' : 'play'"
        @click="wavesurfer.playPause()"
      />
      <icon-button
        v-show="!compact"
        name="forward"
        @click="wavesurfer.skipForward()"
      />
      <icon-button
        v-show="!compact"
        :name="isMute ? 'volumeMute' : 'volume'"
        @click="wavesurfer.toggleMute()"
      />
      <div v-show="!compact" class="vue-player__time">
        {{ currentTime }} / {{ duration }}
      </div>
    </div>
  </div>
</template>

<script>
import WaveSurfer from "wavesurfer.js";
import IconButton from "./IconButton.vue";
import { convertTimeMMSS } from "@/lib/Utils";

export default {
  name: "AudioVisualizer",

  components: { IconButton },

  props: {
    src: { type: String },
    compact: { type: Boolean, default: false },
  },

  data() {
    return {
      wavesurfer: null,
    };
  },

  computed: {
    isReady() {
      return this.wavesurfer;
    },

    duration() {
      if (this.isReady) {
        return convertTimeMMSS(this.wavesurfer.getDuration());
      }
      return convertTimeMMSS(0);
    },

    currentTime() {
      if (this.isReady) {
        return convertTimeMMSS(this.wavesurfer.getCurrentTime());
      }
      return convertTimeMMSS(0);
    },

    isMute() {
      if (this.isReady) {
        return this.wavesurfer.getMute();
      }
      return false;
    },

    playing() {
      if (this.isReady) {
        return this.wavesurfer.isPlaying();
      }
      return false;
    },
  },

  watch: {
    src: {
      deep: true,
      handler() {
        if (this.src) {
          this.wavesurfer.load(this.src);
        }
      },
    },
  },

  mounted() {
    let ctx = document.createElement("canvas").getContext("2d");

    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      waveColor: "#0f6cbd",
      progressColor: "#0e4775",
      cursorColor: "#666",
      cursorWidth: 1,
      barWidth: 2,
      barHeight: 1,
      barGap: null,
      height: 32,
      normalize: true,
      hideScrollbar: true,
      responsive: true,
      fillParent: true,
    });
  },
};
</script>

<style lang="scss">
.wave-container {
  margin-top: 0.75em;
  border: 1px solid var(--border-color, rgba(100, 100, 100, 0.2));
  border-radius: 10em;
  padding: 0.5em;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row-reverse;

  #waveform {
    flex: 1;
  }
}

#waveform {
  position: relative;
  background-color: rgba(100, 100, 100, 0.1);
  border-radius: 10em;
}

.wave-controls {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
