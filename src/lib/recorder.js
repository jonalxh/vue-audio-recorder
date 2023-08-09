import { convertTimeMMSS } from "./Utils";
import WavEncoder from "./WavEncoder";

export default class Recorder {
  constructor(options = {}) {
    this.beforeRecording = options.beforeRecording;
    this.pauseRecording = options.pauseRecording;
    this.afterRecording = options.afterRecording;
    this.micFailed = options.micFailed;

    this.encoderOptions = {
      bitRate: options.bitRate,
      sampleRate: options.sampleRate,
    };

    this.bufferSize = 4096;
    this.records = [];

    this.isPause = false;
    this.isRecording = false;

    this.duration = 0;
    this.volume = 0;

    this.wavSamples = [];

    this.waveDuration = 0;
  }

  start() {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false,
      },
    };

    this.beforeRecording && this.beforeRecording("start recording");

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this.micCaptured.bind(this))
      .catch(this.micError.bind(this));

    this.isPause = false;
    this.isRecording = true;
  }

  stop() {
    if (!!!this.stream || this.context.state == "closed") return;
    this.stream.getTracks().forEach((track) => track.stop());
    this.input.disconnect();
    this.processor.disconnect();
    this.context.close();
    const wavEncoder = new WavEncoder({
      bufferSize: this.bufferSize,
      sampleRate: this.encoderOptions.sampleRate,
      samples: this.wavSamples,
    });
    const record = wavEncoder.finish();
    this.wavSamples = [];

    record.duration = convertTimeMMSS(this.duration);
    this.records.push(record);

    this.waveDuration = 0;
    this.duration = 0;

    this.isPause = false;
    this.isRecording = false;

    this.afterRecording && this.afterRecording(record);
  }

  pause() {
    this.stream.getTracks().forEach((track) => track.stop());
    this.input.disconnect();
    this.processor.disconnect();

    this.waveDuration = this.duration;
    this.isPause = true;

    this.pauseRecording && this.pauseRecording("pause recording");
  }

  recordList() {
    return this.records;
  }

  lastRecord() {
    return this.records.slice(-1).pop();
  }

  micCaptured(stream) {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.duration = this.waveDuration;
    this.input = this.context.createMediaStreamSource(stream);
    this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    this.stream = stream;

    this.processor.onaudioprocess = (ev) => {
      const sample = ev.inputBuffer.getChannelData(0);
      let sum = 0.0;

      this.wavSamples.push(new Float32Array(sample));

      for (let i = 0; i < sample.length; ++i) {
        sum += sample[i] * sample[i];
      }

      this.duration =
        parseFloat(this.waveDuration) +
        parseFloat(this.context.currentTime.toFixed(2));
      this.volume = Math.sqrt(sum / sample.length).toFixed(2);
    };

    this.input.connect(this.processor);
    this.processor.connect(this.context.destination);
  }

  micError(error) {
    this.micFailed && this.micFailed(error);
  }
}
