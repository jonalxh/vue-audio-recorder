<template>
  <custom-player
    v-if="customPlayer"
    :src="audioSource"
    :compact="compact"
    :disabled="disablePlayer"
  />
  <audio-visualizer
    v-else-if="wavePlayer"
    :src="audioSource"
    :compact="compact"
    :disabled="disablePlayer"
  />
  <figure v-else>
    <audio
      controls
      :src="audioSource"
      ref="playerRef"
      type="audio/mpeg"
      class="mx-auto"
    >
      Your browser does not support the
      <code>audio</code> element.
    </audio>
  </figure>
</template>

<script>
import { convertTimeMMSS } from "@/lib/Utils";
import AudioVisualizer from "./AudioVisualizer.vue";
import CustomPlayer from "./CustomPlayer.vue";

export default {
  name: "PlayerWidget",

  components: {
    AudioVisualizer,
    CustomPlayer,
  },

  props: {
    record: { type: Object },
    src: { type: String },
    customPlayer: { type: Boolean, default: false },
    wavePlayer: { type: Boolean, default: false },
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

  computed: {
    disablePlayer() {
      return this.objectNullOrEmpty(this.record) && !this.src;
    },

    audioSource() {
      if (this.record) {
        return this.record.url;
      } else if (this.src) {
        return this.src;
      }
      return "";
    },
  },

  methods: {
    objectNullOrEmpty(obj) {
      if (!obj) return true;
      return Object.keys(obj).length === 0;
    },
  },
};
</script>

<style lang="scss">
.disabled,
*:disabled,
div[disabled] {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
  user-select: none;
  border-color: #999 !important;
}

figure {
  margin: 0;
}
</style>
