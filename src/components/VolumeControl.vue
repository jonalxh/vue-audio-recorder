<template>
  <div class="ar-volume">
    <icon-button class="ar-volume__icon" name="volume" />
    <line-control
      class="ar-volume-bar"
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
      volume: 0.8,
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
.ar-volume {
  display: flex;
  align-items: center;
  line-height: 10px;

  &-bar {
    width: 50px;
    height: 6px;
    background: #e6e6e6;
    border-radius: 4px;
    position: relative;
  }

  &__icon {
    fill: #747474;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: 0;
    padding: 0;
    background-color: unset;
    margin-right: 3px;
  }
}
@media (min-device-width: 320px) and (max-device-width: 700px) {
  .ar-volume {
    display: none;
  }
}
</style>
