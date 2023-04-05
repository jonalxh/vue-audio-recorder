<template>
  <div>
    <button type="button" class="toggle" @click="toggle">
      Toggle recorder/player
    </button>

    <div>
      <div class="controls">
        <div v-if="showRecorder">
          <input type="checkbox" id="countdown" v-model="countdown" />
          <label for="countdown">Enable countdown</label>
        </div>
        <div>
          <input type="checkbox" id="customPlayer" v-model="customPlayer" />
          <label for="customPlayer">Enable customPlayer</label>
        </div>
        <div v-if="showRecorder">
          <label for="limit">Time limit in seconds</label>
          <input id="limit" type="number" v-model="limit" />
        </div>
        <div v-if="showRecorder">
          <label for="attempts">Attempts limit</label>
          <input id="attempts" type="number" v-model="attempts" />
        </div>
      </div>

      <div v-if="showRecorder" class="row">
        <div>
          Default mode:
          <recorder-widget
            :time="2"
            :successfulUpload="success"
            :failedUpload="failed"
            :afterRecording="afterRec"
            :backendEndpoint="backendEndpoint"
            buttonColor="rgb(16, 185, 129)"
            :customUpload="customUp"
            :customPlayer="customPlayer"
          />
        </div>
        <div>
          Minimal mode:
          <recorder-widget
            :time="2"
            :successfulUpload="success"
            :failedUpload="failed"
            :afterRecording="afterRec"
            :backendEndpoint="backendEndpoint"
            buttonColor="rgb(16, 185, 129)"
            :customUpload="customUp"
            compact
          />
        </div>
      </div>
    </div>
    <div v-if="!showRecorder">
      <player-widget v-if="!showRecorder" :src="mp3" :custom="customPlayer" />
    </div>
  </div>
</template>

<script>
import RecorderWidget from "./components/RecorderWidget.vue";
import PlayerWidget from "./components/PlayerWidget.vue";

export default {
  name: "App",

  components: {
    RecorderWidget,
    PlayerWidget,
  },

  data() {
    return {
      attempts: 3,
      countdown: false,
      customPlayer: false,
      limit: 20,
      mp3: "/demo/example.mp3",
      showRecorder: true,
      headers: {
        "X-Custom-Header": "some data",
      },
    };
  },

  computed: {
    backendEndpoint() {
      return process.env.VUE_APP_BACKEND_ENDPOINT;
    },
  },

  methods: {
    toggle() {
      this.showRecorder = !this.showRecorder;
    },

    success() {
      console.log("SUCCESS UPLOAD!!");
    },
    failed() {
      console.log("FAILED!");
    },
    afterRec() {
      console.log("Recorded successfully!");
    },
    async customUp(blob) {
      console.log("custom Upload code!");

      // add your upload code here, return true if success, false if failed
      try {
        const response = await fetch(this.backendEndpoint, {
          method: "POST",
          body: blob,
        });
        if (!response.ok) {
          return false;
        }

        return true;
      } catch (error) {
        return false;
      }
    },
  },
};
</script>

<style lang="scss">
.controls {
  display: flex;
  flex-direction: column;
  width: 50vw;
  padding: 2em;
  margin: 0 auto;
  margin-bottom: 2em;
  border-radius: 0.5em;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);

  input[type="checkbox"] {
    margin-right: 1em;
    margin-bottom: 1em;
  }

  input[type="number"] {
    display: block;
    width: 100%;
    padding: 0.3em;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-bottom: 1em;
  }
}

.row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  & > div {
    flex: 1;
  }
}

.toggle {
  cursor: pointer;
  margin: 20px;
  border-radius: 50px;
  padding: 5px 20px;
  background-color: white;
  font-weight: bold;
  border: 1px solid #05cbcd;
  color: #747474;
  &:hover {
    background-color: #05cbcd;
  }
}
</style>
