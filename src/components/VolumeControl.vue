<template>
  <div class="player-volume">
    <icon-button class="player-volume__icon" name="volume" />
    <line-control
      class="player-volume-bar"
      ref-id="volume"
      :percentage="volume"
      @change-linehead="onChangeLinehead"
    />
  </div>
</template>

<script>
import IconButton from "./IconButton.vue";
import LineControl from "./LineControl.vue";

export default {
  data() {
    return {
      volume: 100,
    };
  },
  components: {
    IconButton,
    LineControl,
  },
  methods: {
    onChangeLinehead(val) {
      this.$emit("change-volume", val);
      this.volume = val;
    },
  },
};
</script>

<style lang="scss">
.player-volume {
  display: flex;
  align-items: center;
  line-height: 10px;

  &-bar {
    width: 50px;
    border-radius: 4px;
    position: relative;
    width: 0;
    overflow: hidden;
  }

  &__icon {
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 0;
    padding: 0;
    background-color: unset;
    margin-right: 3px;
  }

  &:hover {
    .player-volume-bar {
      width: 50px;
    }
  }
}
</style>
