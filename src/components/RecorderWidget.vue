<template>
  <div class="recorder-container">
    <div class="recorder-action">
      <icon-button
        :name="recording ? 'stop' : 'mic'"
        @click="toggleRecording()"
      />
      <span class="recorder-timer">{{ recordedTime }}</span>
    </div>
    <div class="recorder-message">
      <span v-if="instructionMessage" class="color-primary">
        {{ instructionMessage }}
      </span>
      <span v-if="successMessage" class="color-success">
        {{ successMessage }}
      </span>
      <span v-if="errorMessage" class="color-danger">
        {{ errorMessage }}
      </span>
    </div>

    <player-widget
      v-if="!compact"
      :custom="customPlayer"
      :src="recordedAudio"
      :record="recordedBlob"
    />
    <submit-button @submit="sendData" :color="buttonColor" />
  </div>
</template>

<script>
import Service from "../api/Service";
import Recorder from "../lib/Recorder";
import { convertTimeMMSS } from "../lib/Utils";
import IconButton from "./IconButton.vue";
import SubmitButton from "./SubmitButton.vue";
import PlayerWidget from "./PlayerWidget.vue";

const INSTRUCTION_MESSAGE = "Click icon to start recording message.";
const INSTRUCTION_MESSAGE_STOP = "Click icon again to stop recording.";
const ERROR_MESSAGE =
  "Failed to use microphone. Please refresh and try again and permit the use of a microphone.";
const SUCCESS_MESSAGE = "Successfully recorded message!";
const SUCCESS_MESSAGE_SUBMIT =
  "Successfully submitted audio message! Thank you!";
const ERROR_SUBMITTING_MESSAGE =
  "Error submitting audio message! Please try again later.";

export default {
  name: "RecorderWidget",

  components: {
    IconButton,
    SubmitButton,
    PlayerWidget,
  },

  props: {
    time: { type: Number, default: 1 },
    bitRate: { type: Number, default: 128 },
    sampleRate: { type: Number, default: 44100 },
    backendEndpoint: { type: String },
    buttonColor: { type: String, default: "green" },
    compact: { type: Boolean, default: false },
    customPlayer: { type: Boolean, default: false },
    // callback functions
    afterRecording: { type: Function },
    successfulUpload: { type: Function },
    failedUpload: { type: Function },
    customUpload: { type: Function, default: null },
  },

  data() {
    return {
      recording: false,
      recordedAudio: null,
      recordedBlob: null,
      recorder: null,
      successMessage: null,
      errorMessage: null,
      instructionMessage: INSTRUCTION_MESSAGE,
    };
  },

  computed: {
    recordedTime() {
      if (this.time && this.recorder?.duration >= this.time * 60) {
        this.toggleRecording();
      }
      return convertTimeMMSS(this.recorder?.duration);
    },
  },

  beforeUnmount() {
    if (this.recording) {
      this.stopRecorder();
    }
  },

  methods: {
    toggleRecording() {
      this.recording = !this.recording;
      if (this.recording) {
        this.initRecorder();
      } else {
        this.stopRecording();
      }
    },

    initRecorder() {
      this.recorder = new Recorder({
        micFailed: this.micFailed,
        bitRate: this.bitRate,
        sampleRate: this.sampleRate,
      });
      this.recorder.start();
      this.successMessage = null;
      this.errorMessage = null;
      this.instructionMessage = INSTRUCTION_MESSAGE_STOP;
      this.service = new Service(this.backendEndpoint);
    },

    stopRecording() {
      this.recorder.stop();
      const recordList = this.recorder.recordList();
      this.recordedAudio = recordList[0].url;
      this.recordedBlob = recordList[0].blob;
      if (this.recordedAudio) {
        this.successMessage = SUCCESS_MESSAGE;
        this.instructionMessage = null;
      }
      if (this.afterRecording) {
        this.afterRecording();
      }
    },

    async sendData() {
      if (!this.recordedBlob) {
        return;
      }

      let result = null;
      if (this.customUpload) {
        result = await this.customUpload(this.recordedBlob);
      } else {
        result = await this.service.postBackend(this.recordedBlob);
      }

      if (result) {
        this.errorMessage = null;
        this.successMessage = SUCCESS_MESSAGE_SUBMIT;
        if (this.successfulUpload) {
          this.successfulUpload();
        }
      } else {
        // error uploading
        this.successMessage = null;
        this.errorMessage = ERROR_SUBMITTING_MESSAGE;
        if (this.failedUpload) {
          this.failedUpload();
        }
      }
    },

    micFailed() {
      this.recording = false;
      this.instructionMessage = INSTRUCTION_MESSAGE;
      this.errorMessage = ERROR_MESSAGE;
    },
  },
};
</script>

<style lang="scss">
.recorder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  margin: 1em;
}

.recorder-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .recorder-timer {
    font-size: 0.9em;
  }
}

.recorder-message {
  & > span {
    display: block;
    padding: 0.5em;
    border-radius: 1em;
    margin: 0.5em 0;

    &.color-primary {
      background-color: #b4d6fa;
    }

    &.color-success {
      background-color: #9fd89f;
    }

    &.color-danger {
      background-color: #f4bfab;
    }
  }
}
</style>
