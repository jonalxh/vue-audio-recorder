<template>
  <button
    @click="clickButton"
    type="button"
    :style="{ 'background-color': color }"
    class="submit-button shadow-md"
  >
    Submit
  </button>
</template>

<script>
export default {
  emits: ["submit"],
  props: {
    color: {
      type: String,
    },
  },
  methods: {
    clickButton() {
      this.$emit("submit");
    },
  },
};
</script>

<style lang="scss">
.submit-button {
  display: flex;
  align-items: center;
  padding: 0.75em;
  border: none;
  border-radius: 4px;
  color: white;
}
</style>
