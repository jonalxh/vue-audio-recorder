<template>
  <div class="recorder-container">
    <div class="recorder-action">
      <icon-button
        class="vue-recorder-action"
        :name="iconButtonType"
        @click="toggleRecording()"
      />
      <icon-button
        v-if="!compact"
        class="vue-recorder-stop"
        name="stop"
        @click="stopRecording()"
      />
    </div>

    <div class="timing">
      <div class="time-attempt" v-if="attempts && !compact">
        Attempts: {{ attemptsLeft }}/{{ attempts }}
      </div>
      <div class="recording-time">
        <span v-if="countdown"> {{ countdownTitle }}</span>
        <span class="recorder-timer">{{ recordedTime }}</span>
      </div>
      <div class="time-limit" v-if="time && !compact">
        Record duration is limited: {{ time }}s
      </div>
    </div>

    <div class="vue-records" v-if="!compact && recordList.length > 0">
      <div
        v-for="(record, idx) in recordList"
        :key="record.id"
        class="vue-records__record"
        :class="{ 'vue-records__record--selected': record.id === selected.id }"
        @click="choiceRecord(record)"
      >
        <span>Record {{ idx + 1 }}</span>
        <div class="list-actions">
          <icon-button
            id="download"
            v-if="record.id === selected.id && showDownloadButton"
            name="download"
            @click="download"
          />

          <icon-button
            id="upload"
            v-if="record.id === selected.id && showUploadButton"
            class="submit-button"
            name="upload"
            @click="sendData"
          />

          <icon-button
            v-if="record.id === selected.id"
            name="remove"
            @click="removeRecord(idx)"
          />
        </div>
        <div class="vue__text">{{ record.duration }}</div>
      </div>
    </div>

    <player-widget
      :custom="customPlayer"
      :src="recordedAudio"
      :record="selected"
    />

    <div v-if="successMessage || errorMessage" class="recorder-message">
      <span v-if="successMessage" class="color-success">
        {{ successMessage }}
      </span>
      <span v-if="errorMessage" class="color-danger">
        {{ errorMessage }}
      </span>
    </div>
  </div>
</template>

<script>
import Service from "../api/Service";
import Recorder from "../lib/Recorder";
import { convertTimeMMSS } from "../lib/Utils";
import IconButton from "./IconButton.vue";
import PlayerWidget from "./PlayerWidget.vue";

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
    PlayerWidget,
  },

  props: {
    attempts: { type: Number },
    time: { type: Number },
    bitRate: { type: Number, default: 128 },
    sampleRate: { type: Number, default: 44100 },
    showDownloadButton: { type: Boolean, default: true },
    showUploadButton: { type: Boolean, default: true },
    beforeRecording: { type: Function },
    pauseRecording: { type: Function },
    afterRecording: { type: Function },
    selectRecord: { type: Function },
    backendEndpoint: { type: String },
    filename: { type: String, default: "audio" },
    compact: { type: Boolean, default: false },
    customPlayer: { type: Boolean, default: false },
    customUpload: { type: Function, default: null },
    countdown: { type: Boolean, default: false },
    countdownTitle: { type: String, default: "Time remaining" },
  },

  data() {
    return {
      recording: false,
      recordedAudio: null,
      recordedBlob: null,
      recorder: null,
      successMessage: null,
      errorMessage: null,
      recordList: [],
      selected: {},
    };
  },

  computed: {
    recordedTime() {
      if (this.time && this.recorder?.duration >= this.time * 60) {
        this.toggleRecording();
      }
      if (this.countdown) {
        return convertTimeMMSS(this.time - this.recorder?.duration);
      }

      return convertTimeMMSS(this.recorder?.duration);
    },

    attemptsLeft() {
      return this.attempts - this.recordList.length;
    },

    iconButtonType() {
      return this.recording && this.compact
        ? "stop"
        : this.recording
        ? "record"
        : "mic";
    },
  },

  beforeUnmount() {
    if (this.recording) {
      this.stopRecording();
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
      this.service = new Service(this.backendEndpoint);
    },

    stopRecording() {
      this.recording = false;
      this.recorder.stop();
      const recorded = this.recorder.recordList();
      this.selected = recorded[0];

      if (this.selected) {
        this.recordList.push(this.selected);
        this.recordedAudio = this.selected.url;
        this.recordedBlob = this.selected.blob;

        if (this.recordedAudio) {
          this.successMessage = SUCCESS_MESSAGE;
        }

        if (this.afterRecording) {
          this.afterRecording();
        }
      } else {
        this.errorMessage = ERROR_SUBMITTING_MESSAGE;
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
      this.errorMessage = ERROR_MESSAGE;
    },

    removeRecord(idx) {
      this.recordList.splice(idx, 1);
      this.$set(this.selected, "url", null);
      this.$emit("remove-record");
    },

    choiceRecord(record) {
      if (this.selected === record) {
        return;
      }
      this.selected = record;
      this.selectRecord && this.selectRecord(record);
    },

    download() {
      if (!this.selected.url) {
        return;
      }

      const type = this.selected.blob.type.split("/")[1];
      const link = document.createElement("a");
      link.href = this.selected.url;
      link.download = `${this.filename}.${type}`;
      link.click();
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
  padding: 0.75em;
  margin: 0.75em;
}

.recorder-action {
  display: flex;
  align-items: center;
  justify-content: center;

  .vue-recorder-action {
    width: 48px;
    height: 48px;
    border: 1px solid var(--primary-color, #0f6cbd);
    font-size: 18px;
  }

  .vue-recorder-stop {
    width: 32px;
    height: 32px;
    margin-left: 4px;
    border: 1px solid var(--primary-color, #0f6cbd);
    font-size: 12px;
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

.vue-records {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  margin-top: 0.75em;

  .list-actions {
    display: flex;
  }

  .list-actions > .icon-button {
    width: 24px;
    height: 24px;
  }
}

.vue-records__record {
  display: flex;
  width: 100%;
  max-width: 400px;
  justify-content: space-between;
  padding: 0.5em;
  border-radius: 2em;

  &--selected {
    border: 1px solid rgba(100, 100, 100, 0.2);
  }

  .icon-button {
    background-color: transparent;
  }
}

.timing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .time-limit,
  .time-attempt {
    font-size: 0.75em;
  }

  .recorder-timer {
    margin: 0 0.25em;
  }

  .recording-time {
    text-transform: capitalize;
  }
}
</style>
