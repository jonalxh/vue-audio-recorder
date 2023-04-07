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
          <input id="limit" type="number" v-model.number="limit" />
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
            :time="limit"
            :successfulUpload="success"
            :failedUpload="failed"
            :afterRecording="afterRec"
            :backendEndpoint="backendEndpoint"
            :customUpload="customUp"
            :customPlayer="customPlayer"
            :countdown="countdown"
            :attempts="attempts"
          />
        </div>
        <div>
          Minimal mode:
          <recorder-widget
            :time="limit"
            :successfulUpload="success"
            :failedUpload="failed"
            :afterRecording="afterRec"
            :backendEndpoint="backendEndpoint"
            :customUpload="customUp"
            :customPlayer="customPlayer"
            :countdown="countdown"
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
      mp3: "https://download.samplelib.com/mp3/sample-15s.mp3",
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
html,
body {
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  display: flex;
  flex-direction: column;
  width: 50vw;
  padding: 1em;
  margin: 0 auto;
  margin-bottom: 0.75em;
  border-radius: 0.5em;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);

  input[type="checkbox"] {
    margin-right: 0.75em;
    margin-bottom: 0.75em;
  }

  input[type="number"] {
    display: block;
    width: 100%;
    padding: 0.3em;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-bottom: 0.75em;
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
  margin: 0.75em;
  border-radius: 1em;
  padding: 0.5em 1em;
  background-color: white;
  font-weight: bold;
  border: 1px solid var(--primary-color, #0f6cbd);
  color: #747474;
  &:hover {
    background-color: var(--primary-color, #0f6cbd);
  }
}
</style>
