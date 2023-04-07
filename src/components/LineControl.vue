<template>
  <div :ref="refId" class="player-line-control" @mousedown="onMouseDown">
    <div class="player-line-control__head" :style="calculateSize" />
  </div>
</template>

<script>
import { calculateLineHeadPosition } from "@/lib/utils";

export default {
  props: {
    refId: { type: String },
    eventName: { type: String },
    percentage: { type: Number, default: 0 },
    rowDirection: { type: Boolean, default: true },
  },

  computed: {
    calculateSize() {
      const value =
        this.percentage < 1 ? this.percentage * 100 : this.percentage;
      return `${this.rowDirection ? "width" : "height"}: ${value}%`;
    },
  },

  methods: {
    onMouseDown(ev) {
      const seekPos = calculateLineHeadPosition(ev, this.$refs[this.refId]);
      this.$emit("change-linehead", seekPos);
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
    },

    onMouseUp(ev) {
      document.removeEventListener("mouseup", this.onMouseUp);
      document.removeEventListener("mousemove", this.onMouseMove);
      const seekPos = calculateLineHeadPosition(ev, this.$refs[this.refId]);
      this.$emit("change-linehead", seekPos);
    },

    onMouseMove(ev) {
      if (ev.buttons == 0) return;
      const seekPos = calculateLineHeadPosition(ev, this.$refs[this.refId]);
      this.$emit("change-linehead", seekPos);
    },
  },
};
</script>

<style lang="scss">
.player-line-control {
  position: relative;
  height: 4px;
  border-radius: 4px;
  background-color: #ddd;
  transition: all 0.1s ease-in;
  &:hover {
    height: 8px;
  }

  &__head {
    position: absolute;
    height: inherit;
    background-color: var(--primary-color, #0f6cbd);
    border-radius: inherit;
  }
}
</style>
