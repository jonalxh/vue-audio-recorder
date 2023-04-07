import "./index.css";
class Service {
  constructor(backendEndpoint) {
    this.backendEndpoint = backendEndpoint;
  }
  async postBackend(recordedBlob) {
    try {
      const response = await fetch(this.backendEndpoint, {
        method: "POST",
        body: recordedBlob
      });
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
function convertTimeMMSS(seconds) {
  if (!seconds) {
    return "00:00";
  }
  return new Date(seconds * 1e3).toISOString().substring(14, 19);
}
class WavEncoder {
  constructor(options) {
    this.bufferSize = options.bufferSize || 4096;
    this.sampleRate = options.sampleRate;
    this.samples = options.samples;
  }
  finish() {
    this._joinSamples();
    const buffer = new ArrayBuffer(44 + this.samples.length * 2);
    const view = new DataView(buffer);
    this._writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + this.samples.length * 2, true);
    this._writeString(view, 8, "WAVE");
    this._writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    this._writeString(view, 36, "data");
    view.setUint32(40, this.samples.length * 2, true);
    this._floatTo16BitPCM(view, 44, this.samples);
    const blob = new Blob([view], { type: "audio/wav" });
    return {
      id: Date.now(),
      blob,
      url: URL.createObjectURL(blob)
    };
  }
  _floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
    }
  }
  _joinSamples() {
    const recordLength = this.samples.length * this.bufferSize;
    const joinedSamples = new Float64Array(recordLength);
    let offset = 0;
    for (let i = 0; i < this.samples.length; i++) {
      const sample = this.samples[i];
      joinedSamples.set(sample, offset);
      offset += sample.length;
    }
    this.samples = joinedSamples;
  }
  _writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
class Recorder {
  constructor(options = {}) {
    this.beforeRecording = options.beforeRecording;
    this.pauseRecording = options.pauseRecording;
    this.afterRecording = options.afterRecording;
    this.micFailed = options.micFailed;
    this.encoderOptions = {
      bitRate: options.bitRate,
      sampleRate: options.sampleRate
    };
    this.bufferSize = 4096;
    this.records = [];
    this.isPause = false;
    this.isRecording = false;
    this.duration = 0;
    this.volume = 0;
    this.wavSamples = [];
    this._duration = 0;
  }
  start() {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false
      }
    };
    this.beforeRecording && this.beforeRecording("start recording");
    navigator.mediaDevices.getUserMedia(constraints).then(this._micCaptured.bind(this)).catch(this._micError.bind(this));
    this.isPause = false;
    this.isRecording = true;
  }
  stop() {
    this.stream.getTracks().forEach((track) => track.stop());
    this.input.disconnect();
    this.processor.disconnect();
    this.context.close();
    let record = null;
    const wavEncoder = new WavEncoder({
      bufferSize: this.bufferSize,
      sampleRate: this.encoderOptions.sampleRate,
      samples: this.wavSamples
    });
    record = wavEncoder.finish();
    this.wavSamples = [];
    record.duration = convertTimeMMSS(this.duration);
    this.records.push(record);
    this._duration = 0;
    this.duration = 0;
    this.isPause = false;
    this.isRecording = false;
    this.afterRecording && this.afterRecording(record);
  }
  pause() {
    this.stream.getTracks().forEach((track) => track.stop());
    this.input.disconnect();
    this.processor.disconnect();
    this._duration = this.duration;
    this.isPause = true;
    this.pauseRecording && this.pauseRecording("pause recording");
  }
  recordList() {
    return this.records;
  }
  lastRecord() {
    return this.records.slice(-1).pop();
  }
  _micCaptured(stream) {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.duration = this._duration;
    this.input = this.context.createMediaStreamSource(stream);
    this.processor = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    this.stream = stream;
    this.processor.onaudioprocess = (ev) => {
      const sample = ev.inputBuffer.getChannelData(0);
      let sum = 0;
      this.wavSamples.push(new Float32Array(sample));
      for (let i = 0; i < sample.length; ++i) {
        sum += sample[i] * sample[i];
      }
      this.duration = parseFloat(this._duration) + parseFloat(this.context.currentTime.toFixed(2));
      this.volume = Math.sqrt(sum / sample.length).toFixed(2);
    };
    this.input.connect(this.processor);
    this.processor.connect(this.context.destination);
  }
  _micError(error) {
    this.micFailed && this.micFailed(error);
  }
}
var render$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("button", { staticClass: "icon-button", class: "icon-" + _vm.name, attrs: { "type": "button" }, on: { "click": function($event) {
    return _vm.onClick();
  } } }, [_c("span", { domProps: { "innerHTML": _vm._s(_vm.icons[_vm.name]) } })]);
};
var staticRenderFns$4 = [];
var IconButton_vue_vue_type_style_index_0_lang = "";
function normalizeComponent(scriptExports, render2, staticRenderFns2, functionalTemplate, injectStyles, scopeId, moduleIdentifier, shadowMode) {
  var options = typeof scriptExports === "function" ? scriptExports.options : scriptExports;
  if (render2) {
    options.render = render2;
    options.staticRenderFns = staticRenderFns2;
    options._compiled = true;
  }
  if (functionalTemplate) {
    options.functional = true;
  }
  if (scopeId) {
    options._scopeId = "data-v-" + scopeId;
  }
  var hook;
  if (moduleIdentifier) {
    hook = function(context) {
      context = context || this.$vnode && this.$vnode.ssrContext || this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext;
      if (!context && typeof __VUE_SSR_CONTEXT__ !== "undefined") {
        context = __VUE_SSR_CONTEXT__;
      }
      if (injectStyles) {
        injectStyles.call(this, context);
      }
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    };
    options._ssrRegister = hook;
  } else if (injectStyles) {
    hook = shadowMode ? function() {
      injectStyles.call(
        this,
        (options.functional ? this.parent : this).$root.$options.shadowRoot
      );
    } : injectStyles;
  }
  if (hook) {
    if (options.functional) {
      options._injectStyles = hook;
      var originalRender = options.render;
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }
  return {
    exports: scriptExports,
    options
  };
}
const __vue2_script$4 = {
  props: {
    name: { type: String }
  },
  data() {
    return {
      icons: {
        download: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M3.5 13h9a.5.5 0 0 1 .09.992L12.5 14h-9a.5.5 0 0 1-.09-.992L3.5 13h9h-9ZM7.91 1.008L8 1a.5.5 0 0 1 .492.41l.008.09v8.792l2.682-2.681a.5.5 0 0 1 .638-.058l.07.058a.5.5 0 0 1 .057.638l-.058.069l-3.535 3.536a.5.5 0 0 1-.638.057l-.07-.057l-3.535-3.536a.5.5 0 0 1 .638-.765l.069.058L7.5 10.292V1.5a.5.5 0 0 1 .41-.492L8 1l-.09.008Z"/></svg>',
        upload: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M3.5 2a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9Zm4.854 2.146a.5.5 0 0 0-.708 0l-3.5 3.5a.5.5 0 1 0 .708.708L7.5 5.707V13.5a.5.5 0 0 0 1 0V5.707l2.646 2.647a.5.5 0 0 0 .708-.708l-3.5-3.5Z"/></svg>',
        mic: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M5.5 4.5a2.5 2.5 0 0 1 5 0V8a2.5 2.5 0 0 1-5 0V4.5ZM8 3a1.5 1.5 0 0 0-1.5 1.5V8a1.5 1.5 0 1 0 3 0V4.5A1.5 1.5 0 0 0 8 3ZM4 7.5a.5.5 0 0 1 .5.5a3.5 3.5 0 1 0 7 0a.5.5 0 0 1 1 0a4.5 4.5 0 0 1-4 4.473V13.5a.5.5 0 0 1-1 0v-1.027A4.5 4.5 0 0 1 3.5 8a.5.5 0 0 1 .5-.5Z"/></svg>',
        pause: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h1.5A1.75 1.75 0 0 0 7 12.25v-8.5A1.75 1.75 0 0 0 5.25 2h-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h1.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-8.5ZM10.75 2A1.75 1.75 0 0 0 9 3.75v8.5c0 .966.784 1.75 1.75 1.75h1.5A1.75 1.75 0 0 0 14 12.25v-8.5A1.75 1.75 0 0 0 12.25 2h-1.5ZM10 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-8.5Z"/></svg>',
        play: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M5.745 3.064A.5.5 0 0 0 5 3.5v9a.5.5 0 0 0 .745.436l8-4.5a.5.5 0 0 0 0-.871l-8-4.5ZM4 3.5a1.5 1.5 0 0 1 2.235-1.307l8 4.5a1.5 1.5 0 0 1 0 2.615l-8 4.5A1.5 1.5 0 0 1 4 12.5v-9Z"/></svg>',
        save: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1V9.5A1.5 1.5 0 0 1 5.5 8h5A1.5 1.5 0 0 1 12 9.5V13a1 1 0 0 0 1-1V5.621a1 1 0 0 0-.293-.707l-1.621-1.621A1 1 0 0 0 10.379 3H10v1.5A1.5 1.5 0 0 1 8.5 6h-2A1.5 1.5 0 0 1 5 4.5V3H4Zm2 0v1.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V3H6Zm5 10V9.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V13h6ZM2 4a2 2 0 0 1 2-2h6.379a2 2 0 0 1 1.414.586l1.621 1.621A2 2 0 0 1 14 5.621V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"/></svg>',
        stop: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M12.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h9Zm-9-1A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9Z"/></svg>',
        volume: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path d="M8.694 2.04A.5.5 0 0 1 9 2.5v11a.5.5 0 0 1-.85.357l-2.927-2.875H3.5a1.5 1.5 0 0 1-1.5-1.5v-2.99a1.5 1.5 0 0 1 1.5-1.5h1.724l2.927-2.85a.5.5 0 0 1 .543-.103zm3.043 1.02l.087.058l.098.085c.063.056.15.138.252.245c.206.213.476.527.746.938a6.542 6.542 0 0 1 1.083 3.618a6.522 6.522 0 0 1-1.083 3.614c-.27.41-.541.724-.746.936l-.142.141l-.187.17l-.033.026a.5.5 0 0 1-.688-.72l.13-.117a5.49 5.49 0 0 0 .83-.985c.46-.7.919-1.73.919-3.065a5.542 5.542 0 0 0-.919-3.069a5.588 5.588 0 0 0-.54-.698l-.17-.176l-.184-.17a.5.5 0 0 1 .547-.832zM8 3.684L5.776 5.851a.5.5 0 0 1-.349.142H3.5a.5.5 0 0 0-.5.5v2.989a.5.5 0 0 0 .5.5h1.927a.5.5 0 0 1 .35.143L8 12.308V3.685zm2.738 1.374l.1.07l.133.126l.054.056c.114.123.26.302.405.54c.292.48.574 1.193.574 2.148c0 .954-.282 1.668-.573 2.148a3.388 3.388 0 0 1-.405.541l-.102.105l-.07.065l-.04.033l-.063.03c-.133.052-.442.139-.64-.108a.5.5 0 0 1 .012-.638l.134-.129l.034-.036c.075-.08.179-.208.284-.382c.21-.345.429-.882.429-1.63c0-.747-.219-1.283-.428-1.627a2.467 2.467 0 0 0-.223-.311l-.095-.105l-.069-.065a.5.5 0 0 1 .55-.83z" fill="currentColor" fill-rule="nonzero"/></svg>',
        volumeMute: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M8.694 2.04A.5.5 0 0 1 9 2.5v11a.5.5 0 0 1-.85.357l-2.927-2.875H3.5a1.5 1.5 0 0 1-1.5-1.5v-2.99a1.5 1.5 0 0 1 1.5-1.5h1.724l2.927-2.85a.5.5 0 0 1 .543-.103ZM8 3.684L5.777 5.851a.5.5 0 0 1-.35.142H3.5a.5.5 0 0 0-.5.5v2.989a.5.5 0 0 0 .5.5h1.928a.5.5 0 0 1 .35.143L8 12.308V3.685Zm2.147 2.461a.5.5 0 0 1 .707 0l1.147 1.147l1.146-1.147a.5.5 0 1 1 .707.708L12.708 8l1.146 1.146a.5.5 0 1 1-.707.708L12 8.707l-1.147 1.147a.5.5 0 0 1-.707-.708L11.293 8l-1.146-1.146a.5.5 0 0 1 0-.708Z"/></svg>',
        record: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8Z"/></svg>',
        remove: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M7 3h2a1 1 0 0 0-2 0ZM6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1h4Zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5ZM9.5 6a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5Zm-4.74 6.703A1.5 1.5 0 0 0 6.246 14h3.508a1.5 1.5 0 0 0 1.487-1.297L12.427 4H3.573l1.187 8.703Z"/></svg>'
      }
    };
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
const __cssModules$4 = {};
var __component__$4 = /* @__PURE__ */ normalizeComponent(
  __vue2_script$4,
  render$4,
  staticRenderFns$4,
  false,
  __vue2_injectStyles$4,
  null,
  null,
  null
);
function __vue2_injectStyles$4(context) {
  for (let o in __cssModules$4) {
    this[o] = __cssModules$4[o];
  }
}
var IconButton = /* @__PURE__ */ function() {
  return __component__$4.exports;
}();
function calculateLineHeadPosition(ev, element) {
  const progressWidth = element.getBoundingClientRect().width;
  const leftPosition = ev.target.getBoundingClientRect().left;
  let pos = (ev.clientX - leftPosition) / progressWidth;
  try {
    if (!ev.target.className.match(/^ar\-line\-control/)) {
      return;
    }
  } catch (err) {
    return;
  }
  pos = pos < 0 ? 0 : pos;
  pos = pos > 1 ? 1 : pos;
  return pos;
}
var render$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { ref: _vm.refId, staticClass: "player-line-control", on: { "mousedown": _vm.onMouseDown } }, [_c("div", { staticClass: "player-line-control__head", style: _vm.calculateSize })]);
};
var staticRenderFns$3 = [];
var LineControl_vue_vue_type_style_index_0_lang = "";
const __vue2_script$3 = {
  props: {
    refId: { type: String },
    eventName: { type: String },
    percentage: { type: Number, default: 0 },
    rowDirection: { type: Boolean, default: true }
  },
  computed: {
    calculateSize() {
      const value = this.percentage < 1 ? this.percentage * 100 : this.percentage;
      return `${this.rowDirection ? "width" : "height"}: ${value}%`;
    }
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
      if (ev.buttons == 0)
        return;
      const seekPos = calculateLineHeadPosition(ev, this.$refs[this.refId]);
      this.$emit("change-linehead", seekPos);
    }
  }
};
const __cssModules$3 = {};
var __component__$3 = /* @__PURE__ */ normalizeComponent(
  __vue2_script$3,
  render$3,
  staticRenderFns$3,
  false,
  __vue2_injectStyles$3,
  null,
  null,
  null
);
function __vue2_injectStyles$3(context) {
  for (let o in __cssModules$3) {
    this[o] = __cssModules$3[o];
  }
}
var LineControl = /* @__PURE__ */ function() {
  return __component__$3.exports;
}();
var render$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "player-volume" }, [_c("icon-button", { staticClass: "player-volume__icon", attrs: { "name": "volume" } }), _c("line-control", { staticClass: "player-volume-bar", attrs: { "ref-id": "volume", "percentage": _vm.volume }, on: { "change-linehead": _vm.onChangeLinehead } })], 1);
};
var staticRenderFns$2 = [];
var VolumeControl_vue_vue_type_style_index_0_lang = "";
const __vue2_script$2 = {
  data() {
    return {
      volume: 100
    };
  },
  components: {
    IconButton,
    LineControl
  },
  methods: {
    onChangeLinehead(val) {
      this.$emit("change-volume", val);
      this.volume = val;
    }
  }
};
const __cssModules$2 = {};
var __component__$2 = /* @__PURE__ */ normalizeComponent(
  __vue2_script$2,
  render$2,
  staticRenderFns$2,
  false,
  __vue2_injectStyles$2,
  null,
  null,
  null
);
function __vue2_injectStyles$2(context) {
  for (let o in __cssModules$2) {
    this[o] = __cssModules$2[o];
  }
}
var VolumeControl = /* @__PURE__ */ function() {
  return __component__$2.exports;
}();
var render$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "recorder-player" }, [_vm.custom ? _c("div", { staticClass: "vue-player" }, [_c("div", { staticClass: "vue-player-actions" }, [_c("icon-button", { staticClass: "ar-icon ar-icon__lg vue-player__play", class: {
    "vue-player__play--active": _vm.isPlaying,
    disabled: _vm.disablePlayButton
  }, attrs: { "id": "play", "name": _vm.playBtnIcon }, on: { "click": _vm.playback } })], 1), _c("div", { staticClass: "vue-player-bar" }, [_c("div", { staticClass: "vue-player__time" }, [_vm._v(_vm._s(_vm.playedTime) + " / " + _vm._s(_vm.duration))]), _c("line-control", { staticClass: "vue-player__progress", attrs: { "ref-id": "progress", "percentage": _vm.progress }, on: { "change-linehead": _vm._onUpdateProgress } }), _c("volume-control", { class: { disabled: _vm.disablePlayButton }, on: { "change-volume": _vm._onChangeVolume } })], 1)]) : _vm._e(), _c("figure", { directives: [{ name: "show", rawName: "v-show", value: !_vm.custom, expression: "!custom" }] }, [_c("audio", { ref: "playerRef", staticClass: "mx-auto", attrs: { "controls": "", "src": _vm.audioSource, "type": "audio/mpeg" } }, [_vm._v(" Your browser does not support the "), _c("code", [_vm._v("audio")]), _vm._v(" element. ")])])]);
};
var staticRenderFns$1 = [];
var PlayerWidget_vue_vue_type_style_index_0_lang = "";
const __vue2_script$1 = {
  name: "PlayerWidget",
  components: {
    IconButton,
    LineControl,
    VolumeControl
  },
  props: {
    src: { type: String },
    record: { type: Object },
    filename: { type: String },
    custom: { type: Boolean, default: false }
  },
  data() {
    return {
      isPlaying: false,
      duration: convertTimeMMSS(0),
      playedTime: convertTimeMMSS(0),
      progress: 0
    };
  },
  mounted() {
    this.player = this.$refs.playerRef;
    this.player.addEventListener("ended", () => {
      this.isPlaying = false;
    });
    this.player.addEventListener("loadeddata", (ev) => {
      this._resetProgress();
      this.duration = convertTimeMMSS(this.player.duration);
    });
    this.player.addEventListener("timeupdate", this._onTimeUpdate);
  },
  computed: {
    disablePlayButton() {
      return !this.src;
    },
    audioSource() {
      if (!this.src && this.record) {
        return this.record.url;
      }
      return this.src;
    },
    playBtnIcon() {
      return this.isPlaying ? "pause" : "play";
    }
  },
  methods: {
    playback() {
      if (!this.audioSource) {
        return;
      }
      if (this.isPlaying) {
        this.player.pause();
      } else {
        setTimeout(() => {
          this.player.play();
        }, 0);
      }
      this.isPlaying = !this.isPlaying;
    },
    _resetProgress() {
      if (this.isPlaying) {
        this.player.pause();
      }
      this.duration = convertTimeMMSS(0);
      this.playedTime = convertTimeMMSS(0);
      this.progress = 0;
      this.isPlaying = false;
    },
    _onTimeUpdate() {
      this.playedTime = convertTimeMMSS(this.player.currentTime);
      this.progress = this.player.currentTime / this.player.duration * 100;
    },
    _onUpdateProgress(pos) {
      if (pos) {
        this.currentTime = pos * this.duration;
      }
    },
    _onChangeVolume(val) {
      if (val) {
        this.player.volume = val;
      }
    }
  }
};
const __cssModules$1 = {};
var __component__$1 = /* @__PURE__ */ normalizeComponent(
  __vue2_script$1,
  render$1,
  staticRenderFns$1,
  false,
  __vue2_injectStyles$1,
  null,
  null,
  null
);
function __vue2_injectStyles$1(context) {
  for (let o in __cssModules$1) {
    this[o] = __cssModules$1[o];
  }
}
var PlayerWidget = /* @__PURE__ */ function() {
  return __component__$1.exports;
}();
var render = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "recorder-container" }, [_c("div", { staticClass: "recorder-action" }, [_c("icon-button", { staticClass: "vue-recorder-action", attrs: { "name": _vm.iconButtonType }, on: { "click": function($event) {
    return _vm.toggleRecording();
  } } }), !_vm.compact ? _c("icon-button", { staticClass: "vue-recorder-stop", attrs: { "name": "stop" }, on: { "click": function($event) {
    return _vm.stopRecording();
  } } }) : _vm._e()], 1), _c("div", { staticClass: "timing" }, [_vm.attempts && !_vm.compact ? _c("div", { staticClass: "time-attempt" }, [_vm._v(" Attempts: " + _vm._s(_vm.attemptsLeft) + "/" + _vm._s(_vm.attempts) + " ")]) : _vm._e(), _c("div", { staticClass: "recording-time" }, [_vm.countdown ? _c("span", [_vm._v(" " + _vm._s(_vm.countdownTitle))]) : _vm._e(), _c("span", { staticClass: "recorder-timer" }, [_vm._v(_vm._s(_vm.recordedTime))])]), _vm.time && !_vm.compact ? _c("div", { staticClass: "time-limit" }, [_vm._v(" Record duration is limited: " + _vm._s(_vm.time) + "s ")]) : _vm._e()]), !_vm.compact && _vm.recordList.length > 0 ? _c("div", { staticClass: "vue-records" }, _vm._l(_vm.recordList, function(record, idx) {
    return _c("div", { key: record.id, staticClass: "vue-records__record", class: { "vue-records__record--selected": record.id === _vm.selected.id }, on: { "click": function($event) {
      return _vm.choiceRecord(record);
    } } }, [_c("span", [_vm._v("Record " + _vm._s(idx + 1))]), _c("div", { staticClass: "list-actions" }, [record.id === _vm.selected.id && _vm.showDownloadButton ? _c("icon-button", { attrs: { "id": "download", "name": "download" }, on: { "click": _vm.download } }) : _vm._e(), record.id === _vm.selected.id && _vm.showUploadButton ? _c("icon-button", { staticClass: "submit-button", attrs: { "id": "upload", "name": "upload" }, on: { "click": _vm.sendData } }) : _vm._e(), record.id === _vm.selected.id ? _c("icon-button", { attrs: { "name": "remove" }, on: { "click": function($event) {
      return _vm.removeRecord(idx);
    } } }) : _vm._e()], 1), _c("div", { staticClass: "vue__text" }, [_vm._v(_vm._s(record.duration))])]);
  }), 0) : _vm._e(), _c("player-widget", { attrs: { "custom": _vm.customPlayer, "src": _vm.recordedAudio, "record": _vm.selected } }), _vm.successMessage || _vm.errorMessage ? _c("div", { staticClass: "recorder-message" }, [_vm.successMessage ? _c("span", { staticClass: "color-success" }, [_vm._v(" " + _vm._s(_vm.successMessage) + " ")]) : _vm._e(), _vm.errorMessage ? _c("span", { staticClass: "color-danger" }, [_vm._v(" " + _vm._s(_vm.errorMessage) + " ")]) : _vm._e()]) : _vm._e()], 1);
};
var staticRenderFns = [];
var RecorderWidget_vue_vue_type_style_index_0_lang = "";
const ERROR_MESSAGE = "Failed to use microphone. Please refresh and try again and permit the use of a microphone.";
const SUCCESS_MESSAGE = "Successfully recorded message!";
const SUCCESS_MESSAGE_SUBMIT = "Successfully submitted audio message! Thank you!";
const ERROR_SUBMITTING_MESSAGE = "Error submitting audio message! Please try again later.";
const __vue2_script = {
  name: "RecorderWidget",
  components: {
    IconButton,
    PlayerWidget
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
    countdownTitle: { type: String, default: "Time remaining" }
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
      selected: {}
    };
  },
  computed: {
    recordedTime() {
      var _a, _b, _c;
      if (this.time && ((_a = this.recorder) == null ? void 0 : _a.duration) >= this.time * 60) {
        this.toggleRecording();
      }
      if (this.countdown) {
        return convertTimeMMSS(this.time - ((_b = this.recorder) == null ? void 0 : _b.duration));
      }
      return convertTimeMMSS((_c = this.recorder) == null ? void 0 : _c.duration);
    },
    attemptsLeft() {
      return this.attempts - this.recordList.length;
    },
    iconButtonType() {
      return this.recording && this.compact ? "stop" : this.recording ? "record" : "mic";
    }
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
        sampleRate: this.sampleRate
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
      this.recordList.push(recorded[0]);
      this.selected = recorded[0];
      this.recordedAudio = recorded[0].url;
      this.recordedBlob = recorded[0].blob;
      if (this.recordedAudio) {
        this.successMessage = SUCCESS_MESSAGE;
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
    }
  }
};
const __cssModules = {};
var __component__ = /* @__PURE__ */ normalizeComponent(
  __vue2_script,
  render,
  staticRenderFns,
  false,
  __vue2_injectStyles,
  null,
  null,
  null
);
function __vue2_injectStyles(context) {
  for (let o in __cssModules) {
    this[o] = __cssModules[o];
  }
}
var RecorderWidget = /* @__PURE__ */ function() {
  return __component__.exports;
}();
export { PlayerWidget, RecorderWidget };
