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
var render$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("button", { staticClass: "icon-button", class: "icon-" + _vm.name, attrs: { "type": "button" }, on: { "click": function($event) {
    return _vm.onClick();
  } } }, [_c("span", { domProps: { "innerHTML": _vm._s(_vm.icons[_vm.name]) } })]);
};
var staticRenderFns$6 = [];
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
const __vue2_script$6 = {
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
        remove: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M7 3h2a1 1 0 0 0-2 0ZM6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1h4Zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0v-5ZM9.5 6a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5Zm-4.74 6.703A1.5 1.5 0 0 0 6.246 14h3.508a1.5 1.5 0 0 0 1.487-1.297L12.427 4H3.573l1.187 8.703Z"/></svg>',
        backward: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M8.354 12.146a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5a.5.5 0 1 1 .708.708L4.207 8l4.147 4.146Zm4 0a.5.5 0 0 1-.708.708l-4.5-4.5a.5.5 0 0 1 0-.708l4.5-4.5a.5.5 0 0 1 .708.708L8.207 8l4.147 4.146Z"/></svg>',
        forward: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M7.646 3.854a.5.5 0 1 1 .708-.708l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708L11.793 8L7.646 3.854Zm-4 0a.5.5 0 1 1 .708-.708l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708L7.793 8L3.646 3.854Z"/></svg>'
      }
    };
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
const __cssModules$6 = {};
var __component__$6 = /* @__PURE__ */ normalizeComponent(
  __vue2_script$6,
  render$6,
  staticRenderFns$6,
  false,
  __vue2_injectStyles$6,
  null,
  null,
  null
);
function __vue2_injectStyles$6(context) {
  for (let o in __cssModules$6) {
    this[o] = __cssModules$6[o];
  }
}
var IconButton = /* @__PURE__ */ function() {
  return __component__$6.exports;
}();
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var wavesurfer = { exports: {} };
/*!
 * wavesurfer.js 6.6.3 (2023-04-04)
 * https://wavesurfer-js.org
 * @license BSD-3-Clause
 */
(function(module, exports) {
  (function webpackUniversalModuleDefinition(root, factory) {
    module.exports = factory();
  })(self, () => {
    return (() => {
      var __webpack_modules__ = {
        "./src/drawer.canvasentry.js": (module2, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var _style = _interopRequireDefault(__webpack_require__2("./src/util/style.js"));
          var _getId = _interopRequireDefault(__webpack_require__2("./src/util/get-id.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          var CanvasEntry = /* @__PURE__ */ function() {
            function CanvasEntry2() {
              _classCallCheck(this, CanvasEntry2);
              this.wave = null;
              this.waveCtx = null;
              this.progress = null;
              this.progressCtx = null;
              this.start = 0;
              this.end = 1;
              this.id = (0, _getId.default)(typeof this.constructor.name !== "undefined" ? this.constructor.name.toLowerCase() + "_" : "canvasentry_");
              this.canvasContextAttributes = {};
            }
            _createClass(CanvasEntry2, [{
              key: "initWave",
              value: function initWave(element) {
                this.wave = element;
                this.waveCtx = this.wave.getContext("2d", this.canvasContextAttributes);
              }
            }, {
              key: "initProgress",
              value: function initProgress(element) {
                this.progress = element;
                this.progressCtx = this.progress.getContext("2d", this.canvasContextAttributes);
              }
            }, {
              key: "updateDimensions",
              value: function updateDimensions(elementWidth, totalWidth, width, height) {
                this.start = this.wave.offsetLeft / totalWidth || 0;
                this.end = this.start + elementWidth / totalWidth;
                this.wave.width = width;
                this.wave.height = height;
                var elementSize = {
                  width: elementWidth + "px"
                };
                (0, _style.default)(this.wave, elementSize);
                if (this.hasProgressCanvas) {
                  this.progress.width = width;
                  this.progress.height = height;
                  (0, _style.default)(this.progress, elementSize);
                }
              }
            }, {
              key: "clearWave",
              value: function clearWave() {
                this.waveCtx.clearRect(0, 0, this.waveCtx.canvas.width, this.waveCtx.canvas.height);
                if (this.hasProgressCanvas) {
                  this.progressCtx.clearRect(0, 0, this.progressCtx.canvas.width, this.progressCtx.canvas.height);
                }
              }
            }, {
              key: "setFillStyles",
              value: function setFillStyles(waveColor, progressColor) {
                this.waveCtx.fillStyle = this.getFillStyle(this.waveCtx, waveColor);
                if (this.hasProgressCanvas) {
                  this.progressCtx.fillStyle = this.getFillStyle(this.progressCtx, progressColor);
                }
              }
            }, {
              key: "getFillStyle",
              value: function getFillStyle(ctx, color) {
                if (typeof color == "string" || color instanceof CanvasGradient) {
                  return color;
                }
                var waveGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
                color.forEach(function(value, index) {
                  return waveGradient.addColorStop(index / color.length, value);
                });
                return waveGradient;
              }
            }, {
              key: "applyCanvasTransforms",
              value: function applyCanvasTransforms(vertical) {
                if (vertical) {
                  this.waveCtx.setTransform(0, 1, 1, 0, 0, 0);
                  if (this.hasProgressCanvas) {
                    this.progressCtx.setTransform(0, 1, 1, 0, 0, 0);
                  }
                }
              }
            }, {
              key: "fillRects",
              value: function fillRects(x, y, width, height, radius) {
                this.fillRectToContext(this.waveCtx, x, y, width, height, radius);
                if (this.hasProgressCanvas) {
                  this.fillRectToContext(this.progressCtx, x, y, width, height, radius);
                }
              }
            }, {
              key: "fillRectToContext",
              value: function fillRectToContext(ctx, x, y, width, height, radius) {
                if (!ctx) {
                  return;
                }
                if (radius) {
                  this.drawRoundedRect(ctx, x, y, width, height, radius);
                } else {
                  ctx.fillRect(x, y, width, height);
                }
              }
            }, {
              key: "drawRoundedRect",
              value: function drawRoundedRect(ctx, x, y, width, height, radius) {
                if (height === 0) {
                  return;
                }
                if (height < 0) {
                  height *= -1;
                  y -= height;
                }
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();
              }
            }, {
              key: "drawLines",
              value: function drawLines(peaks, absmax, halfH, offsetY, start, end) {
                this.drawLineToContext(this.waveCtx, peaks, absmax, halfH, offsetY, start, end);
                if (this.hasProgressCanvas) {
                  this.drawLineToContext(this.progressCtx, peaks, absmax, halfH, offsetY, start, end);
                }
              }
            }, {
              key: "drawLineToContext",
              value: function drawLineToContext(ctx, peaks, absmax, halfH, offsetY, start, end) {
                if (!ctx) {
                  return;
                }
                var length = peaks.length / 2;
                var first = Math.round(length * this.start);
                var last = Math.round(length * this.end) + 1;
                var canvasStart = first;
                var canvasEnd = last;
                var scale = this.wave.width / (canvasEnd - canvasStart - 1);
                var halfOffset = halfH + offsetY;
                var absmaxHalf = absmax / halfH;
                ctx.beginPath();
                ctx.moveTo((canvasStart - first) * scale, halfOffset);
                ctx.lineTo((canvasStart - first) * scale, halfOffset - Math.round((peaks[2 * canvasStart] || 0) / absmaxHalf));
                var i, peak, h;
                for (i = canvasStart; i < canvasEnd; i++) {
                  peak = peaks[2 * i] || 0;
                  h = Math.round(peak / absmaxHalf);
                  ctx.lineTo((i - first) * scale + this.halfPixel, halfOffset - h);
                }
                var j = canvasEnd - 1;
                for (j; j >= canvasStart; j--) {
                  peak = peaks[2 * j + 1] || 0;
                  h = Math.round(peak / absmaxHalf);
                  ctx.lineTo((j - first) * scale + this.halfPixel, halfOffset - h);
                }
                ctx.lineTo((canvasStart - first) * scale, halfOffset - Math.round((peaks[2 * canvasStart + 1] || 0) / absmaxHalf));
                ctx.closePath();
                ctx.fill();
              }
            }, {
              key: "destroy",
              value: function destroy() {
                this.waveCtx = null;
                this.wave = null;
                this.progressCtx = null;
                this.progress = null;
              }
            }, {
              key: "getImage",
              value: function getImage(format, quality, type) {
                var _this = this;
                if (type === "blob") {
                  return new Promise(function(resolve) {
                    _this.wave.toBlob(resolve, format, quality);
                  });
                } else if (type === "dataURL") {
                  return this.wave.toDataURL(format, quality);
                }
              }
            }]);
            return CanvasEntry2;
          }();
          exports2["default"] = CanvasEntry;
          module2.exports = exports2.default;
        },
        "./src/drawer.js": (module2, exports2, __webpack_require__2) => {
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var util = _interopRequireWildcard(__webpack_require__2("./src/util/index.js"));
          function _getRequireWildcardCache(nodeInterop) {
            if (typeof WeakMap !== "function")
              return null;
            var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
            var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
            return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
              return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
            })(nodeInterop);
          }
          function _interopRequireWildcard(obj, nodeInterop) {
            if (!nodeInterop && obj && obj.__esModule) {
              return obj;
            }
            if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
              return { default: obj };
            }
            var cache = _getRequireWildcardCache(nodeInterop);
            if (cache && cache.has(obj)) {
              return cache.get(obj);
            }
            var newObj = {};
            var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var key in obj) {
              if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
                if (desc && (desc.get || desc.set)) {
                  Object.defineProperty(newObj, key, desc);
                } else {
                  newObj[key] = obj[key];
                }
              }
            }
            newObj.default = obj;
            if (cache) {
              cache.set(obj, newObj);
            }
            return newObj;
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function");
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
            Object.defineProperty(subClass, "prototype", { writable: false });
            if (superClass)
              _setPrototypeOf(subClass, superClass);
          }
          function _setPrototypeOf(o, p) {
            _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
              o2.__proto__ = p2;
              return o2;
            };
            return _setPrototypeOf(o, p);
          }
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = _getPrototypeOf(Derived), result;
              if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return _possibleConstructorReturn(this, result);
            };
          }
          function _possibleConstructorReturn(self2, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
            return _assertThisInitialized(self2);
          }
          function _assertThisInitialized(self2) {
            if (self2 === void 0) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return self2;
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct)
              return false;
            if (Reflect.construct.sham)
              return false;
            if (typeof Proxy === "function")
              return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              }));
              return true;
            } catch (e) {
              return false;
            }
          }
          function _getPrototypeOf(o) {
            _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
              return o2.__proto__ || Object.getPrototypeOf(o2);
            };
            return _getPrototypeOf(o);
          }
          var Drawer = /* @__PURE__ */ function(_util$Observer) {
            _inherits(Drawer2, _util$Observer);
            var _super = _createSuper(Drawer2);
            function Drawer2(container, params) {
              var _this;
              _classCallCheck(this, Drawer2);
              _this = _super.call(this);
              _this.container = util.withOrientation(container, params.vertical);
              _this.params = params;
              _this.width = 0;
              _this.height = params.height * _this.params.pixelRatio;
              _this.lastPos = 0;
              _this.wrapper = null;
              return _this;
            }
            _createClass(Drawer2, [{
              key: "style",
              value: function style(el, styles) {
                return util.style(el, styles);
              }
            }, {
              key: "createWrapper",
              value: function createWrapper() {
                this.wrapper = util.withOrientation(this.container.appendChild(document.createElement("wave")), this.params.vertical);
                this.style(this.wrapper, {
                  display: "block",
                  position: "relative",
                  userSelect: "none",
                  webkitUserSelect: "none",
                  height: this.params.height + "px"
                });
                if (this.params.fillParent || this.params.scrollParent) {
                  this.style(this.wrapper, {
                    width: "100%",
                    cursor: this.params.hideCursor ? "none" : "auto",
                    overflowX: this.params.hideScrollbar ? "hidden" : "auto",
                    overflowY: "hidden"
                  });
                }
                this.setupWrapperEvents();
              }
            }, {
              key: "handleEvent",
              value: function handleEvent(e, noPrevent) {
                !noPrevent && e.preventDefault();
                var clientX = util.withOrientation(e.targetTouches ? e.targetTouches[0] : e, this.params.vertical).clientX;
                var bbox = this.wrapper.getBoundingClientRect();
                var nominalWidth = this.width;
                var parentWidth = this.getWidth();
                var progressPixels = this.getProgressPixels(bbox, clientX);
                var progress;
                if (!this.params.fillParent && nominalWidth < parentWidth) {
                  progress = progressPixels * (this.params.pixelRatio / nominalWidth) || 0;
                } else {
                  progress = (progressPixels + this.wrapper.scrollLeft) / this.wrapper.scrollWidth || 0;
                }
                return util.clamp(progress, 0, 1);
              }
            }, {
              key: "getProgressPixels",
              value: function getProgressPixels(wrapperBbox, clientX) {
                if (this.params.rtl) {
                  return wrapperBbox.right - clientX;
                } else {
                  return clientX - wrapperBbox.left;
                }
              }
            }, {
              key: "setupWrapperEvents",
              value: function setupWrapperEvents() {
                var _this2 = this;
                this.wrapper.addEventListener("click", function(e) {
                  var orientedEvent = util.withOrientation(e, _this2.params.vertical);
                  var scrollbarHeight = _this2.wrapper.offsetHeight - _this2.wrapper.clientHeight;
                  if (scrollbarHeight !== 0) {
                    var bbox = _this2.wrapper.getBoundingClientRect();
                    if (orientedEvent.clientY >= bbox.bottom - scrollbarHeight) {
                      return;
                    }
                  }
                  if (_this2.params.interact) {
                    _this2.fireEvent("click", e, _this2.handleEvent(e));
                  }
                });
                this.wrapper.addEventListener("dblclick", function(e) {
                  if (_this2.params.interact) {
                    _this2.fireEvent("dblclick", e, _this2.handleEvent(e));
                  }
                });
                this.wrapper.addEventListener("scroll", function(e) {
                  return _this2.fireEvent("scroll", e);
                });
              }
            }, {
              key: "drawPeaks",
              value: function drawPeaks(peaks, length, start, end) {
                if (!this.setWidth(length)) {
                  this.clearWave();
                }
                this.params.barWidth ? this.drawBars(peaks, 0, start, end) : this.drawWave(peaks, 0, start, end);
              }
            }, {
              key: "resetScroll",
              value: function resetScroll() {
                if (this.wrapper !== null) {
                  this.wrapper.scrollLeft = 0;
                }
              }
            }, {
              key: "recenter",
              value: function recenter(percent) {
                var position = this.wrapper.scrollWidth * percent;
                this.recenterOnPosition(position, true);
              }
            }, {
              key: "recenterOnPosition",
              value: function recenterOnPosition(position, immediate) {
                var scrollLeft = this.wrapper.scrollLeft;
                var half = ~~(this.wrapper.clientWidth / 2);
                var maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
                var target = position - half;
                var offset = target - scrollLeft;
                if (maxScroll == 0) {
                  return;
                }
                if (!immediate && -half <= offset && offset < half) {
                  var rate = this.params.autoCenterRate;
                  rate /= half;
                  rate *= maxScroll;
                  offset = Math.max(-rate, Math.min(rate, offset));
                  target = scrollLeft + offset;
                }
                target = Math.max(0, Math.min(maxScroll, target));
                if (target != scrollLeft) {
                  this.wrapper.scrollLeft = target;
                }
              }
            }, {
              key: "getScrollX",
              value: function getScrollX() {
                var x = 0;
                if (this.wrapper) {
                  var pixelRatio = this.params.pixelRatio;
                  x = Math.round(this.wrapper.scrollLeft * pixelRatio);
                  if (this.params.scrollParent) {
                    var maxScroll = ~~(this.wrapper.scrollWidth * pixelRatio - this.getWidth());
                    x = Math.min(maxScroll, Math.max(0, x));
                  }
                }
                return x;
              }
            }, {
              key: "getWidth",
              value: function getWidth() {
                return Math.round(this.container.clientWidth * this.params.pixelRatio);
              }
            }, {
              key: "setWidth",
              value: function setWidth(width) {
                if (this.width == width) {
                  return false;
                }
                this.width = width;
                if (this.params.fillParent || this.params.scrollParent) {
                  this.style(this.wrapper, {
                    width: ""
                  });
                } else {
                  var newWidth = ~~(this.width / this.params.pixelRatio) + "px";
                  this.style(this.wrapper, {
                    width: newWidth
                  });
                }
                this.updateSize();
                return true;
              }
            }, {
              key: "setHeight",
              value: function setHeight(height) {
                if (height == this.height) {
                  return false;
                }
                this.height = height;
                this.style(this.wrapper, {
                  height: ~~(this.height / this.params.pixelRatio) + "px"
                });
                this.updateSize();
                return true;
              }
            }, {
              key: "progress",
              value: function progress(_progress) {
                var minPxDelta = 1 / this.params.pixelRatio;
                var pos = Math.round(_progress * this.width) * minPxDelta;
                if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
                  this.lastPos = pos;
                  if (this.params.scrollParent && this.params.autoCenter) {
                    var newPos = ~~(this.wrapper.scrollWidth * _progress);
                    this.recenterOnPosition(newPos, this.params.autoCenterImmediately);
                  }
                  this.updateProgress(pos);
                }
              }
            }, {
              key: "destroy",
              value: function destroy() {
                this.unAll();
                if (this.wrapper) {
                  if (this.wrapper.parentNode == this.container.domElement) {
                    this.container.removeChild(this.wrapper.domElement);
                  }
                  this.wrapper = null;
                }
              }
            }, {
              key: "updateCursor",
              value: function updateCursor() {
              }
            }, {
              key: "updateSize",
              value: function updateSize() {
              }
            }, {
              key: "drawBars",
              value: function drawBars(peaks, channelIndex, start, end) {
              }
            }, {
              key: "drawWave",
              value: function drawWave(peaks, channelIndex, start, end) {
              }
            }, {
              key: "clearWave",
              value: function clearWave() {
              }
            }, {
              key: "updateProgress",
              value: function updateProgress(position) {
              }
            }]);
            return Drawer2;
          }(util.Observer);
          exports2["default"] = Drawer;
          module2.exports = exports2.default;
        },
        "./src/drawer.multicanvas.js": (module2, exports2, __webpack_require__2) => {
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var _drawer = _interopRequireDefault(__webpack_require__2("./src/drawer.js"));
          var util = _interopRequireWildcard(__webpack_require__2("./src/util/index.js"));
          var _drawer2 = _interopRequireDefault(__webpack_require__2("./src/drawer.canvasentry.js"));
          function _getRequireWildcardCache(nodeInterop) {
            if (typeof WeakMap !== "function")
              return null;
            var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
            var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
            return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
              return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
            })(nodeInterop);
          }
          function _interopRequireWildcard(obj, nodeInterop) {
            if (!nodeInterop && obj && obj.__esModule) {
              return obj;
            }
            if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
              return { default: obj };
            }
            var cache = _getRequireWildcardCache(nodeInterop);
            if (cache && cache.has(obj)) {
              return cache.get(obj);
            }
            var newObj = {};
            var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var key in obj) {
              if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
                if (desc && (desc.get || desc.set)) {
                  Object.defineProperty(newObj, key, desc);
                } else {
                  newObj[key] = obj[key];
                }
              }
            }
            newObj.default = obj;
            if (cache) {
              cache.set(obj, newObj);
            }
            return newObj;
          }
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function");
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
            Object.defineProperty(subClass, "prototype", { writable: false });
            if (superClass)
              _setPrototypeOf(subClass, superClass);
          }
          function _setPrototypeOf(o, p) {
            _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
              o2.__proto__ = p2;
              return o2;
            };
            return _setPrototypeOf(o, p);
          }
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = _getPrototypeOf(Derived), result;
              if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return _possibleConstructorReturn(this, result);
            };
          }
          function _possibleConstructorReturn(self2, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
            return _assertThisInitialized(self2);
          }
          function _assertThisInitialized(self2) {
            if (self2 === void 0) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return self2;
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct)
              return false;
            if (Reflect.construct.sham)
              return false;
            if (typeof Proxy === "function")
              return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              }));
              return true;
            } catch (e) {
              return false;
            }
          }
          function _getPrototypeOf(o) {
            _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
              return o2.__proto__ || Object.getPrototypeOf(o2);
            };
            return _getPrototypeOf(o);
          }
          var MultiCanvas = /* @__PURE__ */ function(_Drawer) {
            _inherits(MultiCanvas2, _Drawer);
            var _super = _createSuper(MultiCanvas2);
            function MultiCanvas2(container, params) {
              var _this;
              _classCallCheck(this, MultiCanvas2);
              _this = _super.call(this, container, params);
              _this.maxCanvasWidth = params.maxCanvasWidth;
              _this.maxCanvasElementWidth = Math.round(params.maxCanvasWidth / params.pixelRatio);
              _this.hasProgressCanvas = params.waveColor != params.progressColor;
              _this.halfPixel = 0.5 / params.pixelRatio;
              _this.canvases = [];
              _this.progressWave = null;
              _this.EntryClass = _drawer2.default;
              _this.canvasContextAttributes = params.drawingContextAttributes;
              _this.overlap = 2 * Math.ceil(params.pixelRatio / 2);
              _this.barRadius = params.barRadius || 0;
              _this.vertical = params.vertical;
              return _this;
            }
            _createClass(MultiCanvas2, [{
              key: "init",
              value: function init() {
                this.createWrapper();
                this.createElements();
              }
            }, {
              key: "createElements",
              value: function createElements() {
                this.progressWave = util.withOrientation(this.wrapper.appendChild(document.createElement("wave")), this.params.vertical);
                this.style(this.progressWave, {
                  position: "absolute",
                  zIndex: 3,
                  left: 0,
                  top: 0,
                  bottom: 0,
                  overflow: "hidden",
                  width: "0",
                  display: "none",
                  boxSizing: "border-box",
                  borderRightStyle: "solid",
                  pointerEvents: "none"
                });
                this.addCanvas();
                this.updateCursor();
              }
            }, {
              key: "updateCursor",
              value: function updateCursor() {
                this.style(this.progressWave, {
                  borderRightWidth: this.params.cursorWidth + "px",
                  borderRightColor: this.params.cursorColor
                });
              }
            }, {
              key: "updateSize",
              value: function updateSize() {
                var _this2 = this;
                var totalWidth = Math.round(this.width / this.params.pixelRatio);
                var requiredCanvases = Math.ceil(totalWidth / (this.maxCanvasElementWidth + this.overlap));
                while (this.canvases.length < requiredCanvases) {
                  this.addCanvas();
                }
                while (this.canvases.length > requiredCanvases) {
                  this.removeCanvas();
                }
                var canvasWidth = this.maxCanvasWidth + this.overlap;
                var lastCanvas = this.canvases.length - 1;
                this.canvases.forEach(function(entry, i) {
                  if (i == lastCanvas) {
                    canvasWidth = _this2.width - _this2.maxCanvasWidth * lastCanvas;
                  }
                  _this2.updateDimensions(entry, canvasWidth, _this2.height);
                  entry.clearWave();
                });
              }
            }, {
              key: "addCanvas",
              value: function addCanvas() {
                var entry = new this.EntryClass();
                entry.canvasContextAttributes = this.canvasContextAttributes;
                entry.hasProgressCanvas = this.hasProgressCanvas;
                entry.halfPixel = this.halfPixel;
                var leftOffset = this.maxCanvasElementWidth * this.canvases.length;
                var wave = util.withOrientation(this.wrapper.appendChild(document.createElement("canvas")), this.params.vertical);
                this.style(wave, {
                  position: "absolute",
                  zIndex: 2,
                  left: leftOffset + "px",
                  top: 0,
                  bottom: 0,
                  height: "100%",
                  pointerEvents: "none"
                });
                entry.initWave(wave);
                if (this.hasProgressCanvas) {
                  var progress = util.withOrientation(this.progressWave.appendChild(document.createElement("canvas")), this.params.vertical);
                  this.style(progress, {
                    position: "absolute",
                    left: leftOffset + "px",
                    top: 0,
                    bottom: 0,
                    height: "100%"
                  });
                  entry.initProgress(progress);
                }
                this.canvases.push(entry);
              }
            }, {
              key: "removeCanvas",
              value: function removeCanvas() {
                var lastEntry = this.canvases[this.canvases.length - 1];
                lastEntry.wave.parentElement.removeChild(lastEntry.wave.domElement);
                if (this.hasProgressCanvas) {
                  lastEntry.progress.parentElement.removeChild(lastEntry.progress.domElement);
                }
                if (lastEntry) {
                  lastEntry.destroy();
                  lastEntry = null;
                }
                this.canvases.pop();
              }
            }, {
              key: "updateDimensions",
              value: function updateDimensions(entry, width, height) {
                var elementWidth = Math.round(width / this.params.pixelRatio);
                var totalWidth = Math.round(this.width / this.params.pixelRatio);
                entry.updateDimensions(elementWidth, totalWidth, width, height);
                this.style(this.progressWave, {
                  display: "block"
                });
              }
            }, {
              key: "clearWave",
              value: function clearWave() {
                var _this3 = this;
                util.frame(function() {
                  _this3.canvases.forEach(function(entry) {
                    return entry.clearWave();
                  });
                })();
              }
            }, {
              key: "drawBars",
              value: function drawBars(peaks, channelIndex, start, end) {
                var _this4 = this;
                return this.prepareDraw(peaks, channelIndex, start, end, function(_ref) {
                  var absmax = _ref.absmax, hasMinVals = _ref.hasMinVals;
                  _ref.height;
                  var offsetY = _ref.offsetY, halfH = _ref.halfH, peaks2 = _ref.peaks, ch = _ref.channelIndex;
                  if (start === void 0) {
                    return;
                  }
                  var peakIndexScale = hasMinVals ? 2 : 1;
                  var length = peaks2.length / peakIndexScale;
                  var bar = _this4.params.barWidth * _this4.params.pixelRatio;
                  var gap = _this4.params.barGap === null ? Math.max(_this4.params.pixelRatio, ~~(bar / 2)) : Math.max(_this4.params.pixelRatio, _this4.params.barGap * _this4.params.pixelRatio);
                  var step = bar + gap;
                  var scale = length / _this4.width;
                  var first = start;
                  var last = end;
                  var peakIndex = first;
                  for (peakIndex; peakIndex < last; peakIndex += step) {
                    var peak = 0;
                    var peakIndexRange = Math.floor(peakIndex * scale) * peakIndexScale;
                    var peakIndexEnd = Math.floor((peakIndex + step) * scale) * peakIndexScale;
                    do {
                      var newPeak = Math.abs(peaks2[peakIndexRange]);
                      if (newPeak > peak) {
                        peak = newPeak;
                      }
                      peakIndexRange += peakIndexScale;
                    } while (peakIndexRange < peakIndexEnd);
                    var h = Math.round(peak / absmax * halfH);
                    if (_this4.params.barMinHeight) {
                      h = Math.max(h, _this4.params.barMinHeight);
                    }
                    _this4.fillRect(peakIndex + _this4.halfPixel, halfH - h + offsetY, bar + _this4.halfPixel, h * 2, _this4.barRadius, ch);
                  }
                });
              }
            }, {
              key: "drawWave",
              value: function drawWave(peaks, channelIndex, start, end) {
                var _this5 = this;
                return this.prepareDraw(peaks, channelIndex, start, end, function(_ref2) {
                  var absmax = _ref2.absmax, hasMinVals = _ref2.hasMinVals;
                  _ref2.height;
                  var offsetY = _ref2.offsetY, halfH = _ref2.halfH, peaks2 = _ref2.peaks, channelIndex2 = _ref2.channelIndex;
                  if (!hasMinVals) {
                    var reflectedPeaks = [];
                    var len = peaks2.length;
                    var i = 0;
                    for (i; i < len; i++) {
                      reflectedPeaks[2 * i] = peaks2[i];
                      reflectedPeaks[2 * i + 1] = -peaks2[i];
                    }
                    peaks2 = reflectedPeaks;
                  }
                  if (start !== void 0) {
                    _this5.drawLine(peaks2, absmax, halfH, offsetY, start, end, channelIndex2);
                  }
                  _this5.fillRect(0, halfH + offsetY - _this5.halfPixel, _this5.width, _this5.halfPixel, _this5.barRadius, channelIndex2);
                });
              }
            }, {
              key: "drawLine",
              value: function drawLine(peaks, absmax, halfH, offsetY, start, end, channelIndex) {
                var _this6 = this;
                var _ref3 = this.params.splitChannelsOptions.channelColors[channelIndex] || {}, waveColor = _ref3.waveColor, progressColor = _ref3.progressColor;
                this.canvases.forEach(function(entry, i) {
                  _this6.setFillStyles(entry, waveColor, progressColor);
                  _this6.applyCanvasTransforms(entry, _this6.params.vertical);
                  entry.drawLines(peaks, absmax, halfH, offsetY, start, end);
                });
              }
            }, {
              key: "fillRect",
              value: function fillRect(x, y, width, height, radius, channelIndex) {
                var startCanvas = Math.floor(x / this.maxCanvasWidth);
                var endCanvas = Math.min(Math.ceil((x + width) / this.maxCanvasWidth) + 1, this.canvases.length);
                var i = startCanvas;
                for (i; i < endCanvas; i++) {
                  var entry = this.canvases[i];
                  var leftOffset = i * this.maxCanvasWidth;
                  var intersection = {
                    x1: Math.max(x, i * this.maxCanvasWidth),
                    y1: y,
                    x2: Math.min(x + width, i * this.maxCanvasWidth + entry.wave.width),
                    y2: y + height
                  };
                  if (intersection.x1 < intersection.x2) {
                    var _ref4 = this.params.splitChannelsOptions.channelColors[channelIndex] || {}, waveColor = _ref4.waveColor, progressColor = _ref4.progressColor;
                    this.setFillStyles(entry, waveColor, progressColor);
                    this.applyCanvasTransforms(entry, this.params.vertical);
                    entry.fillRects(intersection.x1 - leftOffset, intersection.y1, intersection.x2 - intersection.x1, intersection.y2 - intersection.y1, radius);
                  }
                }
              }
            }, {
              key: "hideChannel",
              value: function hideChannel(channelIndex) {
                return this.params.splitChannels && this.params.splitChannelsOptions.filterChannels.includes(channelIndex);
              }
            }, {
              key: "prepareDraw",
              value: function prepareDraw(peaks, channelIndex, start, end, fn, drawIndex, normalizedMax) {
                var _this7 = this;
                return util.frame(function() {
                  if (peaks[0] instanceof Array) {
                    var channels = peaks;
                    if (_this7.params.splitChannels) {
                      var filteredChannels = channels.filter(function(c, i) {
                        return !_this7.hideChannel(i);
                      });
                      if (!_this7.params.splitChannelsOptions.overlay) {
                        _this7.setHeight(Math.max(filteredChannels.length, 1) * _this7.params.height * _this7.params.pixelRatio);
                      }
                      var overallAbsMax;
                      if (_this7.params.splitChannelsOptions && _this7.params.splitChannelsOptions.relativeNormalization) {
                        overallAbsMax = util.max(channels.map(function(channelPeaks) {
                          return util.absMax(channelPeaks);
                        }));
                      }
                      return channels.forEach(function(channelPeaks, i) {
                        return _this7.prepareDraw(channelPeaks, i, start, end, fn, filteredChannels.indexOf(channelPeaks), overallAbsMax);
                      });
                    }
                    peaks = channels[0];
                  }
                  if (_this7.hideChannel(channelIndex)) {
                    return;
                  }
                  var absmax = 1 / _this7.params.barHeight;
                  if (_this7.params.normalize) {
                    absmax = normalizedMax === void 0 ? util.absMax(peaks) : normalizedMax;
                  }
                  var hasMinVals = [].some.call(peaks, function(val) {
                    return val < 0;
                  });
                  var height = _this7.params.height * _this7.params.pixelRatio;
                  var halfH = height / 2;
                  var offsetY = height * drawIndex || 0;
                  if (_this7.params.splitChannelsOptions && _this7.params.splitChannelsOptions.overlay) {
                    offsetY = 0;
                  }
                  return fn({
                    absmax,
                    hasMinVals,
                    height,
                    offsetY,
                    halfH,
                    peaks,
                    channelIndex
                  });
                })();
              }
            }, {
              key: "setFillStyles",
              value: function setFillStyles(entry) {
                var waveColor = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.params.waveColor;
                var progressColor = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : this.params.progressColor;
                entry.setFillStyles(waveColor, progressColor);
              }
            }, {
              key: "applyCanvasTransforms",
              value: function applyCanvasTransforms(entry) {
                var vertical = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                entry.applyCanvasTransforms(vertical);
              }
            }, {
              key: "getImage",
              value: function getImage(format, quality, type) {
                if (type === "blob") {
                  return Promise.all(this.canvases.map(function(entry) {
                    return entry.getImage(format, quality, type);
                  }));
                } else if (type === "dataURL") {
                  var images = this.canvases.map(function(entry) {
                    return entry.getImage(format, quality, type);
                  });
                  return images.length > 1 ? images : images[0];
                }
              }
            }, {
              key: "updateProgress",
              value: function updateProgress(position) {
                this.style(this.progressWave, {
                  width: position + "px"
                });
              }
            }]);
            return MultiCanvas2;
          }(_drawer.default);
          exports2["default"] = MultiCanvas;
          module2.exports = exports2.default;
        },
        "./src/mediaelement-webaudio.js": (module2, exports2, __webpack_require__2) => {
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var _mediaelement = _interopRequireDefault(__webpack_require__2("./src/mediaelement.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          function _get() {
            if (typeof Reflect !== "undefined" && Reflect.get) {
              _get = Reflect.get.bind();
            } else {
              _get = function _get2(target, property, receiver) {
                var base = _superPropBase(target, property);
                if (!base)
                  return;
                var desc = Object.getOwnPropertyDescriptor(base, property);
                if (desc.get) {
                  return desc.get.call(arguments.length < 3 ? target : receiver);
                }
                return desc.value;
              };
            }
            return _get.apply(this, arguments);
          }
          function _superPropBase(object, property) {
            while (!Object.prototype.hasOwnProperty.call(object, property)) {
              object = _getPrototypeOf(object);
              if (object === null)
                break;
            }
            return object;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function");
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
            Object.defineProperty(subClass, "prototype", { writable: false });
            if (superClass)
              _setPrototypeOf(subClass, superClass);
          }
          function _setPrototypeOf(o, p) {
            _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
              o2.__proto__ = p2;
              return o2;
            };
            return _setPrototypeOf(o, p);
          }
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = _getPrototypeOf(Derived), result;
              if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return _possibleConstructorReturn(this, result);
            };
          }
          function _possibleConstructorReturn(self2, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
            return _assertThisInitialized(self2);
          }
          function _assertThisInitialized(self2) {
            if (self2 === void 0) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return self2;
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct)
              return false;
            if (Reflect.construct.sham)
              return false;
            if (typeof Proxy === "function")
              return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              }));
              return true;
            } catch (e) {
              return false;
            }
          }
          function _getPrototypeOf(o) {
            _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
              return o2.__proto__ || Object.getPrototypeOf(o2);
            };
            return _getPrototypeOf(o);
          }
          var MediaElementWebAudio = /* @__PURE__ */ function(_MediaElement) {
            _inherits(MediaElementWebAudio2, _MediaElement);
            var _super = _createSuper(MediaElementWebAudio2);
            function MediaElementWebAudio2(params) {
              var _this;
              _classCallCheck(this, MediaElementWebAudio2);
              _this = _super.call(this, params);
              _this.params = params;
              _this.sourceMediaElement = null;
              return _this;
            }
            _createClass(MediaElementWebAudio2, [{
              key: "init",
              value: function init() {
                this.setPlaybackRate(this.params.audioRate);
                this.createTimer();
                this.createVolumeNode();
                this.createScriptNode();
                this.createAnalyserNode();
              }
            }, {
              key: "_load",
              value: function _load(media, peaks, preload) {
                _get(_getPrototypeOf(MediaElementWebAudio2.prototype), "_load", this).call(this, media, peaks, preload);
                this.createMediaElementSource(media);
              }
            }, {
              key: "createMediaElementSource",
              value: function createMediaElementSource(mediaElement) {
                this.sourceMediaElement = this.ac.createMediaElementSource(mediaElement);
                this.sourceMediaElement.connect(this.analyser);
              }
            }, {
              key: "play",
              value: function play(start, end) {
                this.resumeAudioContext();
                return _get(_getPrototypeOf(MediaElementWebAudio2.prototype), "play", this).call(this, start, end);
              }
            }, {
              key: "destroy",
              value: function destroy() {
                _get(_getPrototypeOf(MediaElementWebAudio2.prototype), "destroy", this).call(this);
                this.destroyWebAudio();
              }
            }]);
            return MediaElementWebAudio2;
          }(_mediaelement.default);
          exports2["default"] = MediaElementWebAudio;
          module2.exports = exports2.default;
        },
        "./src/mediaelement.js": (module2, exports2, __webpack_require__2) => {
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var _webaudio = _interopRequireDefault(__webpack_require__2("./src/webaudio.js"));
          var util = _interopRequireWildcard(__webpack_require__2("./src/util/index.js"));
          function _getRequireWildcardCache(nodeInterop) {
            if (typeof WeakMap !== "function")
              return null;
            var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
            var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
            return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
              return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
            })(nodeInterop);
          }
          function _interopRequireWildcard(obj, nodeInterop) {
            if (!nodeInterop && obj && obj.__esModule) {
              return obj;
            }
            if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
              return { default: obj };
            }
            var cache = _getRequireWildcardCache(nodeInterop);
            if (cache && cache.has(obj)) {
              return cache.get(obj);
            }
            var newObj = {};
            var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var key in obj) {
              if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
                if (desc && (desc.get || desc.set)) {
                  Object.defineProperty(newObj, key, desc);
                } else {
                  newObj[key] = obj[key];
                }
              }
            }
            newObj.default = obj;
            if (cache) {
              cache.set(obj, newObj);
            }
            return newObj;
          }
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          function _get() {
            if (typeof Reflect !== "undefined" && Reflect.get) {
              _get = Reflect.get.bind();
            } else {
              _get = function _get2(target, property, receiver) {
                var base = _superPropBase(target, property);
                if (!base)
                  return;
                var desc = Object.getOwnPropertyDescriptor(base, property);
                if (desc.get) {
                  return desc.get.call(arguments.length < 3 ? target : receiver);
                }
                return desc.value;
              };
            }
            return _get.apply(this, arguments);
          }
          function _superPropBase(object, property) {
            while (!Object.prototype.hasOwnProperty.call(object, property)) {
              object = _getPrototypeOf(object);
              if (object === null)
                break;
            }
            return object;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function");
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
            Object.defineProperty(subClass, "prototype", { writable: false });
            if (superClass)
              _setPrototypeOf(subClass, superClass);
          }
          function _setPrototypeOf(o, p) {
            _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
              o2.__proto__ = p2;
              return o2;
            };
            return _setPrototypeOf(o, p);
          }
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = _getPrototypeOf(Derived), result;
              if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return _possibleConstructorReturn(this, result);
            };
          }
          function _possibleConstructorReturn(self2, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
            return _assertThisInitialized(self2);
          }
          function _assertThisInitialized(self2) {
            if (self2 === void 0) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return self2;
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct)
              return false;
            if (Reflect.construct.sham)
              return false;
            if (typeof Proxy === "function")
              return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              }));
              return true;
            } catch (e) {
              return false;
            }
          }
          function _getPrototypeOf(o) {
            _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
              return o2.__proto__ || Object.getPrototypeOf(o2);
            };
            return _getPrototypeOf(o);
          }
          var MediaElement = /* @__PURE__ */ function(_WebAudio) {
            _inherits(MediaElement2, _WebAudio);
            var _super = _createSuper(MediaElement2);
            function MediaElement2(params) {
              var _this;
              _classCallCheck(this, MediaElement2);
              _this = _super.call(this, params);
              _this.params = params;
              _this.media = {
                currentTime: 0,
                duration: 0,
                paused: true,
                playbackRate: 1,
                play: function play() {
                },
                pause: function pause() {
                },
                volume: 0
              };
              _this.mediaType = params.mediaType.toLowerCase();
              _this.elementPosition = params.elementPosition;
              _this.peaks = null;
              _this.playbackRate = 1;
              _this.volume = 1;
              _this.isMuted = false;
              _this.buffer = null;
              _this.onPlayEnd = null;
              _this.mediaListeners = {};
              return _this;
            }
            _createClass(MediaElement2, [{
              key: "init",
              value: function init() {
                this.setPlaybackRate(this.params.audioRate);
                this.createTimer();
              }
            }, {
              key: "_setupMediaListeners",
              value: function _setupMediaListeners() {
                var _this2 = this;
                this.mediaListeners.error = function() {
                  _this2.fireEvent("error", "Error loading media element");
                };
                this.mediaListeners.waiting = function() {
                  _this2.fireEvent("waiting");
                };
                this.mediaListeners.canplay = function() {
                  _this2.fireEvent("canplay");
                };
                this.mediaListeners.ended = function() {
                  _this2.fireEvent("finish");
                };
                this.mediaListeners.play = function() {
                  _this2.fireEvent("play");
                };
                this.mediaListeners.pause = function() {
                  _this2.fireEvent("pause");
                };
                this.mediaListeners.seeked = function(event) {
                  _this2.fireEvent("seek");
                };
                this.mediaListeners.volumechange = function(event) {
                  _this2.isMuted = _this2.media.muted;
                  if (_this2.isMuted) {
                    _this2.volume = 0;
                  } else {
                    _this2.volume = _this2.media.volume;
                  }
                  _this2.fireEvent("volume");
                };
                Object.keys(this.mediaListeners).forEach(function(id) {
                  _this2.media.removeEventListener(id, _this2.mediaListeners[id]);
                  _this2.media.addEventListener(id, _this2.mediaListeners[id]);
                });
              }
            }, {
              key: "createTimer",
              value: function createTimer() {
                var _this3 = this;
                var onAudioProcess = function onAudioProcess2() {
                  if (_this3.isPaused()) {
                    return;
                  }
                  _this3.fireEvent("audioprocess", _this3.getCurrentTime());
                  util.frame(onAudioProcess2)();
                };
                this.on("play", onAudioProcess);
                this.on("pause", function() {
                  _this3.fireEvent("audioprocess", _this3.getCurrentTime());
                });
              }
            }, {
              key: "load",
              value: function load(url, container, peaks, preload) {
                var media = document.createElement(this.mediaType);
                media.controls = this.params.mediaControls;
                media.autoplay = this.params.autoplay || false;
                media.preload = preload == null ? "auto" : preload;
                media.src = url;
                media.style.width = "100%";
                var prevMedia = container.querySelector(this.mediaType);
                if (prevMedia) {
                  container.removeChild(prevMedia);
                }
                container.appendChild(media);
                this._load(media, peaks, preload);
              }
            }, {
              key: "loadElt",
              value: function loadElt(elt, peaks) {
                elt.controls = this.params.mediaControls;
                elt.autoplay = this.params.autoplay || false;
                this._load(elt, peaks, elt.preload);
              }
            }, {
              key: "_load",
              value: function _load(media, peaks, preload) {
                if (!(media instanceof HTMLMediaElement) || typeof media.addEventListener === "undefined") {
                  throw new Error("media parameter is not a valid media element");
                }
                if (typeof media.load == "function" && !(peaks && preload == "none")) {
                  media.load();
                }
                this.media = media;
                this._setupMediaListeners();
                this.peaks = peaks;
                this.onPlayEnd = null;
                this.buffer = null;
                this.isMuted = media.muted;
                this.setPlaybackRate(this.playbackRate);
                this.setVolume(this.volume);
              }
            }, {
              key: "isPaused",
              value: function isPaused() {
                return !this.media || this.media.paused;
              }
            }, {
              key: "getDuration",
              value: function getDuration() {
                if (this.explicitDuration) {
                  return this.explicitDuration;
                }
                var duration = (this.buffer || this.media).duration;
                if (duration >= Infinity) {
                  duration = this.media.seekable.end(0);
                }
                return duration;
              }
            }, {
              key: "getCurrentTime",
              value: function getCurrentTime() {
                return this.media && this.media.currentTime;
              }
            }, {
              key: "getPlayedPercents",
              value: function getPlayedPercents() {
                return this.getCurrentTime() / this.getDuration() || 0;
              }
            }, {
              key: "getPlaybackRate",
              value: function getPlaybackRate() {
                return this.playbackRate || this.media.playbackRate;
              }
            }, {
              key: "setPlaybackRate",
              value: function setPlaybackRate(value) {
                this.playbackRate = value || 1;
                this.media.playbackRate = this.playbackRate;
              }
            }, {
              key: "seekTo",
              value: function seekTo(start) {
                if (start != null && !isNaN(start)) {
                  this.media.currentTime = start;
                }
                this.clearPlayEnd();
              }
            }, {
              key: "play",
              value: function play(start, end) {
                this.seekTo(start);
                var promise = this.media.play();
                end && this.setPlayEnd(end);
                return promise;
              }
            }, {
              key: "pause",
              value: function pause() {
                var promise;
                if (this.media) {
                  promise = this.media.pause();
                }
                this.clearPlayEnd();
                return promise;
              }
            }, {
              key: "setPlayEnd",
              value: function setPlayEnd(end) {
                var _this4 = this;
                this.clearPlayEnd();
                this._onPlayEnd = function(time) {
                  if (time >= end) {
                    _this4.pause();
                    _this4.seekTo(end);
                  }
                };
                this.on("audioprocess", this._onPlayEnd);
              }
            }, {
              key: "clearPlayEnd",
              value: function clearPlayEnd() {
                if (this._onPlayEnd) {
                  this.un("audioprocess", this._onPlayEnd);
                  this._onPlayEnd = null;
                }
              }
            }, {
              key: "getPeaks",
              value: function getPeaks(length, first, last) {
                if (this.buffer) {
                  return _get(_getPrototypeOf(MediaElement2.prototype), "getPeaks", this).call(this, length, first, last);
                }
                return this.peaks || [];
              }
            }, {
              key: "setSinkId",
              value: function setSinkId(deviceId) {
                if (deviceId) {
                  if (!this.media.setSinkId) {
                    return Promise.reject(new Error("setSinkId is not supported in your browser"));
                  }
                  return this.media.setSinkId(deviceId);
                }
                return Promise.reject(new Error("Invalid deviceId: " + deviceId));
              }
            }, {
              key: "getVolume",
              value: function getVolume() {
                return this.volume;
              }
            }, {
              key: "setVolume",
              value: function setVolume(value) {
                this.volume = value;
                if (this.media.volume !== this.volume) {
                  this.media.volume = this.volume;
                }
              }
            }, {
              key: "setMute",
              value: function setMute(muted) {
                this.isMuted = this.media.muted = muted;
              }
            }, {
              key: "destroy",
              value: function destroy() {
                var _this5 = this;
                this.pause();
                this.unAll();
                this.destroyed = true;
                Object.keys(this.mediaListeners).forEach(function(id) {
                  if (_this5.media) {
                    _this5.media.removeEventListener(id, _this5.mediaListeners[id]);
                  }
                });
                if (this.params.removeMediaElementOnDestroy && this.media && this.media.parentNode) {
                  this.media.parentNode.removeChild(this.media);
                }
                this.media = null;
              }
            }]);
            return MediaElement2;
          }(_webaudio.default);
          exports2["default"] = MediaElement;
          module2.exports = exports2.default;
        },
        "./src/peakcache.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          var PeakCache = /* @__PURE__ */ function() {
            function PeakCache2() {
              _classCallCheck(this, PeakCache2);
              this.clearPeakCache();
            }
            _createClass(PeakCache2, [{
              key: "clearPeakCache",
              value: function clearPeakCache() {
                this.peakCacheRanges = [];
                this.peakCacheLength = -1;
              }
            }, {
              key: "addRangeToPeakCache",
              value: function addRangeToPeakCache(length, start, end) {
                if (length != this.peakCacheLength) {
                  this.clearPeakCache();
                  this.peakCacheLength = length;
                }
                var uncachedRanges = [];
                var i = 0;
                while (i < this.peakCacheRanges.length && this.peakCacheRanges[i] < start) {
                  i++;
                }
                if (i % 2 == 0) {
                  uncachedRanges.push(start);
                }
                while (i < this.peakCacheRanges.length && this.peakCacheRanges[i] <= end) {
                  uncachedRanges.push(this.peakCacheRanges[i]);
                  i++;
                }
                if (i % 2 == 0) {
                  uncachedRanges.push(end);
                }
                uncachedRanges = uncachedRanges.filter(function(item, pos, arr) {
                  if (pos == 0) {
                    return item != arr[pos + 1];
                  } else if (pos == arr.length - 1) {
                    return item != arr[pos - 1];
                  }
                  return item != arr[pos - 1] && item != arr[pos + 1];
                });
                this.peakCacheRanges = this.peakCacheRanges.concat(uncachedRanges);
                this.peakCacheRanges = this.peakCacheRanges.sort(function(a, b) {
                  return a - b;
                }).filter(function(item, pos, arr) {
                  if (pos == 0) {
                    return item != arr[pos + 1];
                  } else if (pos == arr.length - 1) {
                    return item != arr[pos - 1];
                  }
                  return item != arr[pos - 1] && item != arr[pos + 1];
                });
                var uncachedRangePairs = [];
                for (i = 0; i < uncachedRanges.length; i += 2) {
                  uncachedRangePairs.push([uncachedRanges[i], uncachedRanges[i + 1]]);
                }
                return uncachedRangePairs;
              }
            }, {
              key: "getCacheRanges",
              value: function getCacheRanges() {
                var peakCacheRangePairs = [];
                var i;
                for (i = 0; i < this.peakCacheRanges.length; i += 2) {
                  peakCacheRangePairs.push([this.peakCacheRanges[i], this.peakCacheRanges[i + 1]]);
                }
                return peakCacheRangePairs;
              }
            }]);
            return PeakCache2;
          }();
          exports2["default"] = PeakCache;
          module2.exports = exports2.default;
        },
        "./src/util/absMax.js": (module2, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = absMax;
          var _max = _interopRequireDefault(__webpack_require__2("./src/util/max.js"));
          var _min = _interopRequireDefault(__webpack_require__2("./src/util/min.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function absMax(values) {
            var max = (0, _max.default)(values);
            var min = (0, _min.default)(values);
            return -min > max ? -min : max;
          }
          module2.exports = exports2.default;
        },
        "./src/util/clamp.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = clamp;
          function clamp(val, min, max) {
            return Math.min(Math.max(min, val), max);
          }
          module2.exports = exports2.default;
        },
        "./src/util/fetch.js": (module2, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = fetchFile;
          var _observer = _interopRequireDefault(__webpack_require__2("./src/util/observer.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          var ProgressHandler = /* @__PURE__ */ function() {
            function ProgressHandler2(instance, contentLength, response) {
              _classCallCheck(this, ProgressHandler2);
              this.instance = instance;
              this.instance._reader = response.body.getReader();
              this.total = parseInt(contentLength, 10);
              this.loaded = 0;
            }
            _createClass(ProgressHandler2, [{
              key: "start",
              value: function start(controller) {
                var _this = this;
                var read = function read2() {
                  _this.instance._reader.read().then(function(_ref) {
                    var done = _ref.done, value = _ref.value;
                    if (done) {
                      if (_this.total === 0) {
                        _this.instance.onProgress.call(_this.instance, {
                          loaded: _this.loaded,
                          total: _this.total,
                          lengthComputable: false
                        });
                      }
                      controller.close();
                      return;
                    }
                    _this.loaded += value.byteLength;
                    _this.instance.onProgress.call(_this.instance, {
                      loaded: _this.loaded,
                      total: _this.total,
                      lengthComputable: !(_this.total === 0)
                    });
                    controller.enqueue(value);
                    read2();
                  }).catch(function(error) {
                    controller.error(error);
                  });
                };
                read();
              }
            }]);
            return ProgressHandler2;
          }();
          function fetchFile(options) {
            if (!options) {
              throw new Error("fetch options missing");
            } else if (!options.url) {
              throw new Error("fetch url missing");
            }
            var instance = new _observer.default();
            var fetchHeaders = new Headers();
            var fetchRequest = new Request(options.url);
            instance.controller = new AbortController();
            if (options && options.requestHeaders) {
              options.requestHeaders.forEach(function(header) {
                fetchHeaders.append(header.key, header.value);
              });
            }
            var responseType = options.responseType || "json";
            var fetchOptions = {
              method: options.method || "GET",
              headers: fetchHeaders,
              mode: options.mode || "cors",
              credentials: options.credentials || "same-origin",
              cache: options.cache || "default",
              redirect: options.redirect || "follow",
              referrer: options.referrer || "client",
              signal: instance.controller.signal
            };
            fetch(fetchRequest, fetchOptions).then(function(response) {
              instance.response = response;
              var progressAvailable = true;
              if (!response.body) {
                progressAvailable = false;
              }
              var contentLength = response.headers.get("content-length");
              if (contentLength === null) {
                progressAvailable = false;
              }
              if (!progressAvailable) {
                return response;
              }
              instance.onProgress = function(e) {
                instance.fireEvent("progress", e);
              };
              return new Response(new ReadableStream(new ProgressHandler(instance, contentLength, response)), fetchOptions);
            }).then(function(response) {
              var errMsg;
              if (response.ok) {
                switch (responseType) {
                  case "arraybuffer":
                    return response.arrayBuffer();
                  case "json":
                    return response.json();
                  case "blob":
                    return response.blob();
                  case "text":
                    return response.text();
                  default:
                    errMsg = "Unknown responseType: " + responseType;
                    break;
                }
              }
              if (!errMsg) {
                errMsg = "HTTP error status: " + response.status;
              }
              throw new Error(errMsg);
            }).then(function(response) {
              instance.fireEvent("success", response);
            }).catch(function(error) {
              instance.fireEvent("error", error);
            });
            instance.fetchRequest = fetchRequest;
            return instance;
          }
          module2.exports = exports2.default;
        },
        "./src/util/frame.js": (module2, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = frame;
          var _requestAnimationFrame = _interopRequireDefault(__webpack_require__2("./src/util/request-animation-frame.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function frame(func) {
            return function() {
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              return (0, _requestAnimationFrame.default)(function() {
                return func.apply(void 0, args);
              });
            };
          }
          module2.exports = exports2.default;
        },
        "./src/util/get-id.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = getId;
          function getId(prefix) {
            if (prefix === void 0) {
              prefix = "wavesurfer_";
            }
            return prefix + Math.random().toString(32).substring(2);
          }
          module2.exports = exports2.default;
        },
        "./src/util/index.js": (__unused_webpack_module, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          Object.defineProperty(exports2, "Observer", {
            enumerable: true,
            get: function get() {
              return _observer.default;
            }
          });
          Object.defineProperty(exports2, "absMax", {
            enumerable: true,
            get: function get() {
              return _absMax.default;
            }
          });
          Object.defineProperty(exports2, "clamp", {
            enumerable: true,
            get: function get() {
              return _clamp.default;
            }
          });
          Object.defineProperty(exports2, "debounce", {
            enumerable: true,
            get: function get() {
              return _debounce.default;
            }
          });
          Object.defineProperty(exports2, "fetchFile", {
            enumerable: true,
            get: function get() {
              return _fetch.default;
            }
          });
          Object.defineProperty(exports2, "frame", {
            enumerable: true,
            get: function get() {
              return _frame.default;
            }
          });
          Object.defineProperty(exports2, "getId", {
            enumerable: true,
            get: function get() {
              return _getId.default;
            }
          });
          Object.defineProperty(exports2, "ignoreSilenceMode", {
            enumerable: true,
            get: function get() {
              return _silenceMode.default;
            }
          });
          Object.defineProperty(exports2, "max", {
            enumerable: true,
            get: function get() {
              return _max.default;
            }
          });
          Object.defineProperty(exports2, "min", {
            enumerable: true,
            get: function get() {
              return _min.default;
            }
          });
          Object.defineProperty(exports2, "preventClick", {
            enumerable: true,
            get: function get() {
              return _preventClick.default;
            }
          });
          Object.defineProperty(exports2, "requestAnimationFrame", {
            enumerable: true,
            get: function get() {
              return _requestAnimationFrame.default;
            }
          });
          Object.defineProperty(exports2, "style", {
            enumerable: true,
            get: function get() {
              return _style.default;
            }
          });
          Object.defineProperty(exports2, "withOrientation", {
            enumerable: true,
            get: function get() {
              return _orientation.default;
            }
          });
          var _getId = _interopRequireDefault(__webpack_require__2("./src/util/get-id.js"));
          var _max = _interopRequireDefault(__webpack_require__2("./src/util/max.js"));
          var _min = _interopRequireDefault(__webpack_require__2("./src/util/min.js"));
          var _absMax = _interopRequireDefault(__webpack_require__2("./src/util/absMax.js"));
          var _observer = _interopRequireDefault(__webpack_require__2("./src/util/observer.js"));
          var _style = _interopRequireDefault(__webpack_require__2("./src/util/style.js"));
          var _requestAnimationFrame = _interopRequireDefault(__webpack_require__2("./src/util/request-animation-frame.js"));
          var _frame = _interopRequireDefault(__webpack_require__2("./src/util/frame.js"));
          var _debounce = _interopRequireDefault(__webpack_require__2("./node_modules/debounce/index.js"));
          var _preventClick = _interopRequireDefault(__webpack_require__2("./src/util/prevent-click.js"));
          var _fetch = _interopRequireDefault(__webpack_require__2("./src/util/fetch.js"));
          var _clamp = _interopRequireDefault(__webpack_require__2("./src/util/clamp.js"));
          var _orientation = _interopRequireDefault(__webpack_require__2("./src/util/orientation.js"));
          var _silenceMode = _interopRequireDefault(__webpack_require__2("./src/util/silence-mode.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
        },
        "./src/util/max.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = max;
          function max(values) {
            var largest = -Infinity;
            Object.keys(values).forEach(function(i) {
              if (values[i] > largest) {
                largest = values[i];
              }
            });
            return largest;
          }
          module2.exports = exports2.default;
        },
        "./src/util/min.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = min;
          function min(values) {
            var smallest = Number(Infinity);
            Object.keys(values).forEach(function(i) {
              if (values[i] < smallest) {
                smallest = values[i];
              }
            });
            return smallest;
          }
          module2.exports = exports2.default;
        },
        "./src/util/observer.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          var Observer = /* @__PURE__ */ function() {
            function Observer2() {
              _classCallCheck(this, Observer2);
              this._disabledEventEmissions = [];
              this.handlers = null;
            }
            _createClass(Observer2, [{
              key: "on",
              value: function on(event, fn) {
                var _this = this;
                if (!this.handlers) {
                  this.handlers = {};
                }
                var handlers = this.handlers[event];
                if (!handlers) {
                  handlers = this.handlers[event] = [];
                }
                handlers.push(fn);
                return {
                  name: event,
                  callback: fn,
                  un: function un(e, fn2) {
                    return _this.un(e, fn2);
                  }
                };
              }
            }, {
              key: "un",
              value: function un(event, fn) {
                if (!this.handlers) {
                  return;
                }
                var handlers = this.handlers[event];
                var i;
                if (handlers) {
                  if (fn) {
                    for (i = handlers.length - 1; i >= 0; i--) {
                      if (handlers[i] == fn) {
                        handlers.splice(i, 1);
                      }
                    }
                  } else {
                    handlers.length = 0;
                  }
                }
              }
            }, {
              key: "unAll",
              value: function unAll() {
                this.handlers = null;
              }
            }, {
              key: "once",
              value: function once(event, handler) {
                var _this2 = this;
                var fn = function fn2() {
                  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                  }
                  handler.apply(_this2, args);
                  setTimeout(function() {
                    _this2.un(event, fn2);
                  }, 0);
                };
                return this.on(event, fn);
              }
            }, {
              key: "setDisabledEventEmissions",
              value: function setDisabledEventEmissions(eventNames) {
                this._disabledEventEmissions = eventNames;
              }
            }, {
              key: "_isDisabledEventEmission",
              value: function _isDisabledEventEmission(event) {
                return this._disabledEventEmissions && this._disabledEventEmissions.includes(event);
              }
            }, {
              key: "fireEvent",
              value: function fireEvent(event) {
                for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                  args[_key2 - 1] = arguments[_key2];
                }
                if (!this.handlers || this._isDisabledEventEmission(event)) {
                  return;
                }
                var handlers = this.handlers[event];
                handlers && handlers.forEach(function(fn) {
                  fn.apply(void 0, args);
                });
              }
            }]);
            return Observer2;
          }();
          exports2["default"] = Observer;
          module2.exports = exports2.default;
        },
        "./src/util/orientation.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = withOrientation;
          var verticalPropMap = {
            width: "height",
            height: "width",
            overflowX: "overflowY",
            overflowY: "overflowX",
            clientWidth: "clientHeight",
            clientHeight: "clientWidth",
            clientX: "clientY",
            clientY: "clientX",
            scrollWidth: "scrollHeight",
            scrollLeft: "scrollTop",
            offsetLeft: "offsetTop",
            offsetTop: "offsetLeft",
            offsetHeight: "offsetWidth",
            offsetWidth: "offsetHeight",
            left: "top",
            right: "bottom",
            top: "left",
            bottom: "right",
            borderRightStyle: "borderBottomStyle",
            borderRightWidth: "borderBottomWidth",
            borderRightColor: "borderBottomColor"
          };
          function mapProp(prop, vertical) {
            if (Object.prototype.hasOwnProperty.call(verticalPropMap, prop)) {
              return vertical ? verticalPropMap[prop] : prop;
            } else {
              return prop;
            }
          }
          var isProxy = Symbol("isProxy");
          function withOrientation(target, vertical) {
            if (target[isProxy]) {
              return target;
            } else {
              return new Proxy(target, {
                get: function get(obj, prop, receiver) {
                  if (prop === isProxy) {
                    return true;
                  } else if (prop === "domElement") {
                    return obj;
                  } else if (prop === "style") {
                    return withOrientation(obj.style, vertical);
                  } else if (prop === "canvas") {
                    return withOrientation(obj.canvas, vertical);
                  } else if (prop === "getBoundingClientRect") {
                    return function() {
                      return withOrientation(obj.getBoundingClientRect.apply(obj, arguments), vertical);
                    };
                  } else if (prop === "getContext") {
                    return function() {
                      return withOrientation(obj.getContext.apply(obj, arguments), vertical);
                    };
                  } else {
                    var value = obj[mapProp(prop, vertical)];
                    return typeof value == "function" ? value.bind(obj) : value;
                  }
                },
                set: function set(obj, prop, value) {
                  obj[mapProp(prop, vertical)] = value;
                  return true;
                }
              });
            }
          }
          module2.exports = exports2.default;
        },
        "./src/util/prevent-click.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = preventClick;
          function preventClickHandler(event) {
            event.stopPropagation();
            document.body.removeEventListener("click", preventClickHandler, true);
          }
          function preventClick(values) {
            document.body.addEventListener("click", preventClickHandler, true);
          }
          module2.exports = exports2.default;
        },
        "./src/util/request-animation-frame.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var _default = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
            return setTimeout(callback, 1e3 / 60);
          }).bind(window);
          exports2["default"] = _default;
          module2.exports = exports2.default;
        },
        "./src/util/silence-mode.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = ignoreSilenceMode;
          function ignoreSilenceMode() {
            var silentAC = new AudioContext();
            var silentBS = silentAC.createBufferSource();
            silentBS.buffer = silentAC.createBuffer(1, 1, 44100);
            silentBS.connect(silentAC.destination);
            silentBS.start();
            var audioData = "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnABGiAAQBCqgCRMAAgEAH///////////////7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq//////////////////9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";
            var tmp = document.createElement("div");
            tmp.innerHTML = '<audio x-webkit-airplay="deny"></audio>';
            var audioSilentMode = tmp.children.item(0);
            audioSilentMode.src = audioData;
            audioSilentMode.preload = "auto";
            audioSilentMode.type = "audio/mpeg";
            audioSilentMode.disableRemotePlayback = true;
            audioSilentMode.play();
            audioSilentMode.remove();
            tmp.remove();
          }
          module2.exports = exports2.default;
        },
        "./src/util/style.js": (module2, exports2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = style;
          function style(el, styles) {
            Object.keys(styles).forEach(function(prop) {
              if (el.style[prop] !== styles[prop]) {
                el.style[prop] = styles[prop];
              }
            });
            return el;
          }
          module2.exports = exports2.default;
        },
        "./src/wavesurfer.js": (module2, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var util = _interopRequireWildcard(__webpack_require__2("./src/util/index.js"));
          var _drawer = _interopRequireDefault(__webpack_require__2("./src/drawer.multicanvas.js"));
          var _webaudio = _interopRequireDefault(__webpack_require__2("./src/webaudio.js"));
          var _mediaelement = _interopRequireDefault(__webpack_require__2("./src/mediaelement.js"));
          var _peakcache = _interopRequireDefault(__webpack_require__2("./src/peakcache.js"));
          var _mediaelementWebaudio = _interopRequireDefault(__webpack_require__2("./src/mediaelement-webaudio.js"));
          function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
          }
          function _getRequireWildcardCache(nodeInterop) {
            if (typeof WeakMap !== "function")
              return null;
            var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
            var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
            return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
              return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
            })(nodeInterop);
          }
          function _interopRequireWildcard(obj, nodeInterop) {
            if (!nodeInterop && obj && obj.__esModule) {
              return obj;
            }
            if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
              return { default: obj };
            }
            var cache = _getRequireWildcardCache(nodeInterop);
            if (cache && cache.has(obj)) {
              return cache.get(obj);
            }
            var newObj = {};
            var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var key in obj) {
              if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
                if (desc && (desc.get || desc.set)) {
                  Object.defineProperty(newObj, key, desc);
                } else {
                  newObj[key] = obj[key];
                }
              }
            }
            newObj.default = obj;
            if (cache) {
              cache.set(obj, newObj);
            }
            return newObj;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function");
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
            Object.defineProperty(subClass, "prototype", { writable: false });
            if (superClass)
              _setPrototypeOf(subClass, superClass);
          }
          function _setPrototypeOf(o, p) {
            _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
              o2.__proto__ = p2;
              return o2;
            };
            return _setPrototypeOf(o, p);
          }
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = _getPrototypeOf(Derived), result;
              if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return _possibleConstructorReturn(this, result);
            };
          }
          function _possibleConstructorReturn(self2, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
            return _assertThisInitialized(self2);
          }
          function _assertThisInitialized(self2) {
            if (self2 === void 0) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return self2;
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct)
              return false;
            if (Reflect.construct.sham)
              return false;
            if (typeof Proxy === "function")
              return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              }));
              return true;
            } catch (e) {
              return false;
            }
          }
          function _getPrototypeOf(o) {
            _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
              return o2.__proto__ || Object.getPrototypeOf(o2);
            };
            return _getPrototypeOf(o);
          }
          function _defineProperty(obj, key, value) {
            key = _toPropertyKey(key);
            if (key in obj) {
              Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
            } else {
              obj[key] = value;
            }
            return obj;
          }
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          var WaveSurfer2 = /* @__PURE__ */ function(_util$Observer) {
            _inherits(WaveSurfer3, _util$Observer);
            var _super = _createSuper(WaveSurfer3);
            function WaveSurfer3(params) {
              var _this;
              _classCallCheck(this, WaveSurfer3);
              _this = _super.call(this);
              _defineProperty(_assertThisInitialized(_this), "defaultParams", {
                audioContext: null,
                audioScriptProcessor: null,
                audioRate: 1,
                autoCenter: true,
                autoCenterRate: 5,
                autoCenterImmediately: false,
                backend: "WebAudio",
                backgroundColor: null,
                barHeight: 1,
                barRadius: 0,
                barGap: null,
                barMinHeight: null,
                container: null,
                cursorColor: "#333",
                cursorWidth: 1,
                dragSelection: true,
                drawingContextAttributes: {
                  desynchronized: false
                },
                duration: null,
                fillParent: true,
                forceDecode: false,
                height: 128,
                hideScrollbar: false,
                hideCursor: false,
                ignoreSilenceMode: false,
                interact: true,
                loopSelection: true,
                maxCanvasWidth: 4e3,
                mediaContainer: null,
                mediaControls: false,
                mediaType: "audio",
                minPxPerSec: 20,
                normalize: false,
                partialRender: false,
                pixelRatio: window.devicePixelRatio || screen.deviceXDPI / screen.logicalXDPI,
                plugins: [],
                progressColor: "#555",
                removeMediaElementOnDestroy: true,
                renderer: _drawer.default,
                responsive: false,
                rtl: false,
                scrollParent: false,
                skipLength: 2,
                splitChannels: false,
                splitChannelsOptions: {
                  overlay: false,
                  channelColors: {},
                  filterChannels: [],
                  relativeNormalization: false,
                  splitDragSelection: false
                },
                vertical: false,
                waveColor: "#999",
                xhr: {}
              });
              _defineProperty(_assertThisInitialized(_this), "backends", {
                MediaElement: _mediaelement.default,
                WebAudio: _webaudio.default,
                MediaElementWebAudio: _mediaelementWebaudio.default
              });
              _defineProperty(_assertThisInitialized(_this), "util", util);
              _this.params = Object.assign({}, _this.defaultParams, params);
              _this.params.splitChannelsOptions = Object.assign({}, _this.defaultParams.splitChannelsOptions, params.splitChannelsOptions);
              _this.container = "string" == typeof params.container ? document.querySelector(_this.params.container) : _this.params.container;
              if (!_this.container) {
                throw new Error("Container element not found");
              }
              if (_this.params.mediaContainer == null) {
                _this.mediaContainer = _this.container;
              } else if (typeof _this.params.mediaContainer == "string") {
                _this.mediaContainer = document.querySelector(_this.params.mediaContainer);
              } else {
                _this.mediaContainer = _this.params.mediaContainer;
              }
              if (!_this.mediaContainer) {
                throw new Error("Media Container element not found");
              }
              if (_this.params.maxCanvasWidth <= 1) {
                throw new Error("maxCanvasWidth must be greater than 1");
              } else if (_this.params.maxCanvasWidth % 2 == 1) {
                throw new Error("maxCanvasWidth must be an even number");
              }
              if (_this.params.rtl === true) {
                if (_this.params.vertical === true) {
                  util.style(_this.container, {
                    transform: "rotateX(180deg)"
                  });
                } else {
                  util.style(_this.container, {
                    transform: "rotateY(180deg)"
                  });
                }
              }
              if (_this.params.backgroundColor) {
                _this.setBackgroundColor(_this.params.backgroundColor);
              }
              _this.savedVolume = 0;
              _this.isMuted = false;
              _this.tmpEvents = [];
              _this.currentRequest = null;
              _this.arraybuffer = null;
              _this.drawer = null;
              _this.backend = null;
              _this.peakCache = null;
              if (typeof _this.params.renderer !== "function") {
                throw new Error("Renderer parameter is invalid");
              }
              _this.Drawer = _this.params.renderer;
              if (_this.params.backend == "AudioElement") {
                _this.params.backend = "MediaElement";
              }
              if ((_this.params.backend == "WebAudio" || _this.params.backend === "MediaElementWebAudio") && !_webaudio.default.prototype.supportsWebAudio.call(null)) {
                _this.params.backend = "MediaElement";
              }
              _this.Backend = _this.backends[_this.params.backend];
              _this.initialisedPluginList = {};
              _this.isDestroyed = false;
              _this.isReady = false;
              var prevWidth = 0;
              _this._onResize = util.debounce(function() {
                if (_this.drawer.wrapper && prevWidth != _this.drawer.wrapper.clientWidth && !_this.params.scrollParent) {
                  prevWidth = _this.drawer.wrapper.clientWidth;
                  if (prevWidth) {
                    _this.drawer.fireEvent("redraw");
                  }
                }
              }, typeof _this.params.responsive === "number" ? _this.params.responsive : 100);
              return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
            }
            _createClass(WaveSurfer3, [{
              key: "init",
              value: function init() {
                this.registerPlugins(this.params.plugins);
                this.createDrawer();
                this.createBackend();
                this.createPeakCache();
                return this;
              }
            }, {
              key: "registerPlugins",
              value: function registerPlugins(plugins) {
                var _this2 = this;
                plugins.forEach(function(plugin) {
                  return _this2.addPlugin(plugin);
                });
                plugins.forEach(function(plugin) {
                  if (!plugin.deferInit) {
                    _this2.initPlugin(plugin.name);
                  }
                });
                this.fireEvent("plugins-registered", plugins);
                return this;
              }
            }, {
              key: "getActivePlugins",
              value: function getActivePlugins() {
                return this.initialisedPluginList;
              }
            }, {
              key: "addPlugin",
              value: function addPlugin(plugin) {
                var _this3 = this;
                if (!plugin.name) {
                  throw new Error("Plugin does not have a name!");
                }
                if (!plugin.instance) {
                  throw new Error("Plugin ".concat(plugin.name, " does not have an instance property!"));
                }
                if (plugin.staticProps) {
                  Object.keys(plugin.staticProps).forEach(function(pluginStaticProp) {
                    _this3[pluginStaticProp] = plugin.staticProps[pluginStaticProp];
                  });
                }
                var Instance = plugin.instance;
                var observerPrototypeKeys = Object.getOwnPropertyNames(util.Observer.prototype);
                observerPrototypeKeys.forEach(function(key) {
                  Instance.prototype[key] = util.Observer.prototype[key];
                });
                this[plugin.name] = new Instance(plugin.params || {}, this);
                this.fireEvent("plugin-added", plugin.name);
                return this;
              }
            }, {
              key: "initPlugin",
              value: function initPlugin(name) {
                if (!this[name]) {
                  throw new Error("Plugin ".concat(name, " has not been added yet!"));
                }
                if (this.initialisedPluginList[name]) {
                  this.destroyPlugin(name);
                }
                this[name].init();
                this.initialisedPluginList[name] = true;
                this.fireEvent("plugin-initialised", name);
                return this;
              }
            }, {
              key: "destroyPlugin",
              value: function destroyPlugin(name) {
                if (!this[name]) {
                  throw new Error("Plugin ".concat(name, " has not been added yet and cannot be destroyed!"));
                }
                if (!this.initialisedPluginList[name]) {
                  throw new Error("Plugin ".concat(name, " is not active and cannot be destroyed!"));
                }
                if (typeof this[name].destroy !== "function") {
                  throw new Error("Plugin ".concat(name, " does not have a destroy function!"));
                }
                this[name].destroy();
                delete this.initialisedPluginList[name];
                this.fireEvent("plugin-destroyed", name);
                return this;
              }
            }, {
              key: "destroyAllPlugins",
              value: function destroyAllPlugins() {
                var _this4 = this;
                Object.keys(this.initialisedPluginList).forEach(function(name) {
                  return _this4.destroyPlugin(name);
                });
              }
            }, {
              key: "createDrawer",
              value: function createDrawer() {
                var _this5 = this;
                this.drawer = new this.Drawer(this.container, this.params);
                this.drawer.init();
                this.fireEvent("drawer-created", this.drawer);
                if (this.params.responsive !== false) {
                  window.addEventListener("resize", this._onResize, true);
                  window.addEventListener("orientationchange", this._onResize, true);
                }
                this.drawer.on("redraw", function() {
                  _this5.drawBuffer();
                  _this5.drawer.progress(_this5.backend.getPlayedPercents());
                });
                this.drawer.on("click", function(e, progress) {
                  setTimeout(function() {
                    return _this5.seekTo(progress);
                  }, 0);
                });
                this.drawer.on("scroll", function(e) {
                  if (_this5.params.partialRender) {
                    _this5.drawBuffer();
                  }
                  _this5.fireEvent("scroll", e);
                });
              }
            }, {
              key: "createBackend",
              value: function createBackend() {
                var _this6 = this;
                if (this.backend) {
                  this.backend.destroy();
                }
                this.backend = new this.Backend(this.params);
                this.backend.init();
                this.fireEvent("backend-created", this.backend);
                this.backend.on("finish", function() {
                  _this6.drawer.progress(_this6.backend.getPlayedPercents());
                  _this6.fireEvent("finish");
                });
                this.backend.on("play", function() {
                  return _this6.fireEvent("play");
                });
                this.backend.on("pause", function() {
                  return _this6.fireEvent("pause");
                });
                this.backend.on("audioprocess", function(time) {
                  _this6.drawer.progress(_this6.backend.getPlayedPercents());
                  _this6.fireEvent("audioprocess", time);
                });
                if (this.params.backend === "MediaElement" || this.params.backend === "MediaElementWebAudio") {
                  this.backend.on("seek", function() {
                    _this6.drawer.progress(_this6.backend.getPlayedPercents());
                  });
                  this.backend.on("volume", function() {
                    var newVolume = _this6.getVolume();
                    _this6.fireEvent("volume", newVolume);
                    if (_this6.backend.isMuted !== _this6.isMuted) {
                      _this6.isMuted = _this6.backend.isMuted;
                      _this6.fireEvent("mute", _this6.isMuted);
                    }
                  });
                }
              }
            }, {
              key: "createPeakCache",
              value: function createPeakCache() {
                if (this.params.partialRender) {
                  this.peakCache = new _peakcache.default();
                }
              }
            }, {
              key: "getDuration",
              value: function getDuration() {
                return this.backend.getDuration();
              }
            }, {
              key: "getCurrentTime",
              value: function getCurrentTime() {
                return this.backend.getCurrentTime();
              }
            }, {
              key: "setCurrentTime",
              value: function setCurrentTime(seconds) {
                if (seconds >= this.getDuration()) {
                  this.seekTo(1);
                } else {
                  this.seekTo(seconds / this.getDuration());
                }
              }
            }, {
              key: "play",
              value: function play(start, end) {
                var _this7 = this;
                if (this.params.ignoreSilenceMode) {
                  util.ignoreSilenceMode();
                }
                this.fireEvent("interaction", function() {
                  return _this7.play(start, end);
                });
                return this.backend.play(start, end);
              }
            }, {
              key: "setPlayEnd",
              value: function setPlayEnd(position) {
                this.backend.setPlayEnd(position);
              }
            }, {
              key: "pause",
              value: function pause() {
                if (!this.backend.isPaused()) {
                  return this.backend.pause();
                }
              }
            }, {
              key: "playPause",
              value: function playPause() {
                return this.backend.isPaused() ? this.play() : this.pause();
              }
            }, {
              key: "isPlaying",
              value: function isPlaying() {
                return !this.backend.isPaused();
              }
            }, {
              key: "skipBackward",
              value: function skipBackward(seconds) {
                this.skip(-seconds || -this.params.skipLength);
              }
            }, {
              key: "skipForward",
              value: function skipForward(seconds) {
                this.skip(seconds || this.params.skipLength);
              }
            }, {
              key: "skip",
              value: function skip(offset) {
                var duration = this.getDuration() || 1;
                var position = this.getCurrentTime() || 0;
                position = Math.max(0, Math.min(duration, position + (offset || 0)));
                this.seekAndCenter(position / duration);
              }
            }, {
              key: "seekAndCenter",
              value: function seekAndCenter(progress) {
                this.seekTo(progress);
                this.drawer.recenter(progress);
              }
            }, {
              key: "seekTo",
              value: function seekTo(progress) {
                var _this8 = this;
                if (typeof progress !== "number" || !isFinite(progress) || progress < 0 || progress > 1) {
                  throw new Error("Error calling wavesurfer.seekTo, parameter must be a number between 0 and 1!");
                }
                this.fireEvent("interaction", function() {
                  return _this8.seekTo(progress);
                });
                var isWebAudioBackend = this.params.backend === "WebAudio";
                var paused = this.backend.isPaused();
                if (isWebAudioBackend && !paused) {
                  this.backend.pause();
                }
                var oldScrollParent = this.params.scrollParent;
                this.params.scrollParent = false;
                this.backend.seekTo(progress * this.getDuration());
                this.drawer.progress(progress);
                if (isWebAudioBackend && !paused) {
                  this.backend.play();
                }
                this.params.scrollParent = oldScrollParent;
                this.fireEvent("seek", progress);
              }
            }, {
              key: "stop",
              value: function stop() {
                this.pause();
                this.seekTo(0);
                this.drawer.progress(0);
              }
            }, {
              key: "setSinkId",
              value: function setSinkId(deviceId) {
                return this.backend.setSinkId(deviceId);
              }
            }, {
              key: "setVolume",
              value: function setVolume(newVolume) {
                if (this.isMuted === true) {
                  this.savedVolume = newVolume;
                  return;
                }
                this.backend.setVolume(newVolume);
                this.fireEvent("volume", newVolume);
              }
            }, {
              key: "getVolume",
              value: function getVolume() {
                return this.backend.getVolume();
              }
            }, {
              key: "setPlaybackRate",
              value: function setPlaybackRate(rate) {
                this.backend.setPlaybackRate(rate);
              }
            }, {
              key: "getPlaybackRate",
              value: function getPlaybackRate() {
                return this.backend.getPlaybackRate();
              }
            }, {
              key: "toggleMute",
              value: function toggleMute() {
                this.setMute(!this.isMuted);
              }
            }, {
              key: "setMute",
              value: function setMute(mute) {
                if (mute === this.isMuted) {
                  this.fireEvent("mute", this.isMuted);
                  return;
                }
                if (this.backend.setMute) {
                  this.backend.setMute(mute);
                  this.isMuted = mute;
                } else {
                  if (mute) {
                    this.savedVolume = this.backend.getVolume();
                    this.backend.setVolume(0);
                    this.isMuted = true;
                    this.fireEvent("volume", 0);
                  } else {
                    this.backend.setVolume(this.savedVolume);
                    this.isMuted = false;
                    this.fireEvent("volume", this.savedVolume);
                  }
                }
                this.fireEvent("mute", this.isMuted);
              }
            }, {
              key: "getMute",
              value: function getMute() {
                return this.isMuted;
              }
            }, {
              key: "getFilters",
              value: function getFilters() {
                return this.backend.filters || [];
              }
            }, {
              key: "toggleScroll",
              value: function toggleScroll() {
                this.params.scrollParent = !this.params.scrollParent;
                this.drawBuffer();
              }
            }, {
              key: "toggleInteraction",
              value: function toggleInteraction() {
                this.params.interact = !this.params.interact;
              }
            }, {
              key: "getWaveColor",
              value: function getWaveColor() {
                var channelIdx = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
                if (this.params.splitChannelsOptions.channelColors[channelIdx]) {
                  return this.params.splitChannelsOptions.channelColors[channelIdx].waveColor;
                }
                return this.params.waveColor;
              }
            }, {
              key: "setWaveColor",
              value: function setWaveColor(color) {
                var channelIdx = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
                if (this.params.splitChannelsOptions.channelColors[channelIdx]) {
                  this.params.splitChannelsOptions.channelColors[channelIdx].waveColor = color;
                } else {
                  this.params.waveColor = color;
                }
                this.drawBuffer();
              }
            }, {
              key: "getProgressColor",
              value: function getProgressColor() {
                var channelIdx = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
                if (this.params.splitChannelsOptions.channelColors[channelIdx]) {
                  return this.params.splitChannelsOptions.channelColors[channelIdx].progressColor;
                }
                return this.params.progressColor;
              }
            }, {
              key: "setProgressColor",
              value: function setProgressColor(color, channelIdx) {
                if (this.params.splitChannelsOptions.channelColors[channelIdx]) {
                  this.params.splitChannelsOptions.channelColors[channelIdx].progressColor = color;
                } else {
                  this.params.progressColor = color;
                }
                this.drawBuffer();
              }
            }, {
              key: "getBackgroundColor",
              value: function getBackgroundColor() {
                return this.params.backgroundColor;
              }
            }, {
              key: "setBackgroundColor",
              value: function setBackgroundColor(color) {
                this.params.backgroundColor = color;
                util.style(this.container, {
                  background: this.params.backgroundColor
                });
              }
            }, {
              key: "getCursorColor",
              value: function getCursorColor() {
                return this.params.cursorColor;
              }
            }, {
              key: "setCursorColor",
              value: function setCursorColor(color) {
                this.params.cursorColor = color;
                this.drawer.updateCursor();
              }
            }, {
              key: "getHeight",
              value: function getHeight() {
                return this.params.height;
              }
            }, {
              key: "setHeight",
              value: function setHeight(height) {
                this.params.height = height;
                this.drawer.setHeight(height * this.params.pixelRatio);
                this.drawBuffer();
              }
            }, {
              key: "setFilteredChannels",
              value: function setFilteredChannels(channelIndices) {
                this.params.splitChannelsOptions.filterChannels = channelIndices;
                this.drawBuffer();
              }
            }, {
              key: "drawBuffer",
              value: function drawBuffer() {
                var nominalWidth = Math.round(this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio);
                var parentWidth = this.drawer.getWidth();
                var width = nominalWidth;
                var start = 0;
                var end = Math.max(start + parentWidth, width);
                if (this.params.fillParent && (!this.params.scrollParent || nominalWidth < parentWidth)) {
                  width = parentWidth;
                  start = 0;
                  end = width;
                }
                var peaks;
                if (this.params.partialRender) {
                  var newRanges = this.peakCache.addRangeToPeakCache(width, start, end);
                  var i;
                  for (i = 0; i < newRanges.length; i++) {
                    peaks = this.backend.getPeaks(width, newRanges[i][0], newRanges[i][1]);
                    this.drawer.drawPeaks(peaks, width, newRanges[i][0], newRanges[i][1]);
                  }
                } else {
                  peaks = this.backend.getPeaks(width, start, end);
                  this.drawer.drawPeaks(peaks, width, start, end);
                }
                this.fireEvent("redraw", peaks, width);
              }
            }, {
              key: "zoom",
              value: function zoom(pxPerSec) {
                if (!pxPerSec) {
                  this.params.minPxPerSec = this.defaultParams.minPxPerSec;
                  this.params.scrollParent = false;
                } else {
                  this.params.minPxPerSec = pxPerSec;
                  this.params.scrollParent = true;
                }
                this.drawBuffer();
                this.drawer.progress(this.backend.getPlayedPercents());
                this.drawer.recenter(this.getCurrentTime() / this.getDuration());
                this.fireEvent("zoom", pxPerSec);
              }
            }, {
              key: "loadArrayBuffer",
              value: function loadArrayBuffer(arraybuffer) {
                var _this9 = this;
                this.decodeArrayBuffer(arraybuffer, function(data) {
                  if (!_this9.isDestroyed) {
                    _this9.loadDecodedBuffer(data);
                  }
                });
              }
            }, {
              key: "loadDecodedBuffer",
              value: function loadDecodedBuffer(buffer) {
                this.backend.load(buffer);
                this.drawBuffer();
                this.isReady = true;
                this.fireEvent("ready");
              }
            }, {
              key: "loadBlob",
              value: function loadBlob(blob) {
                var _this10 = this;
                var reader = new FileReader();
                reader.addEventListener("progress", function(e) {
                  return _this10.onProgress(e);
                });
                reader.addEventListener("load", function(e) {
                  return _this10.loadArrayBuffer(e.target.result);
                });
                reader.addEventListener("error", function() {
                  return _this10.fireEvent("error", "Error reading file");
                });
                reader.readAsArrayBuffer(blob);
                this.empty();
              }
            }, {
              key: "load",
              value: function load(url, peaks, preload, duration) {
                if (!url) {
                  throw new Error("url parameter cannot be empty");
                }
                this.empty();
                if (preload) {
                  var preloadIgnoreReasons = {
                    "Preload is not 'auto', 'none' or 'metadata'": ["auto", "metadata", "none"].indexOf(preload) === -1,
                    "Peaks are not provided": !peaks,
                    "Backend is not of type 'MediaElement' or 'MediaElementWebAudio'": ["MediaElement", "MediaElementWebAudio"].indexOf(this.params.backend) === -1,
                    "Url is not of type string": typeof url !== "string"
                  };
                  var activeReasons = Object.keys(preloadIgnoreReasons).filter(function(reason) {
                    return preloadIgnoreReasons[reason];
                  });
                  if (activeReasons.length) {
                    console.warn("Preload parameter of wavesurfer.load will be ignored because:\n	- " + activeReasons.join("\n	- "));
                    preload = null;
                  }
                }
                if (this.params.backend === "WebAudio" && url instanceof HTMLMediaElement) {
                  url = url.src;
                }
                switch (this.params.backend) {
                  case "WebAudio":
                    return this.loadBuffer(url, peaks, duration);
                  case "MediaElement":
                  case "MediaElementWebAudio":
                    return this.loadMediaElement(url, peaks, preload, duration);
                }
              }
            }, {
              key: "loadBuffer",
              value: function loadBuffer(url, peaks, duration) {
                var _this11 = this;
                var load = function load2(action) {
                  if (action) {
                    _this11.tmpEvents.push(_this11.once("ready", action));
                  }
                  return _this11.getArrayBuffer(url, function(data) {
                    return _this11.loadArrayBuffer(data);
                  });
                };
                if (peaks) {
                  this.backend.setPeaks(peaks, duration);
                  this.drawBuffer();
                  this.fireEvent("waveform-ready");
                  this.tmpEvents.push(this.once("interaction", load));
                } else {
                  return load();
                }
              }
            }, {
              key: "loadMediaElement",
              value: function loadMediaElement(urlOrElt, peaks, preload, duration) {
                var _this12 = this;
                var url = urlOrElt;
                if (typeof urlOrElt === "string") {
                  this.backend.load(url, this.mediaContainer, peaks, preload);
                } else {
                  var elt = urlOrElt;
                  this.backend.loadElt(elt, peaks);
                  url = elt.src;
                }
                this.tmpEvents.push(this.backend.once("canplay", function() {
                  if (!_this12.backend.destroyed) {
                    _this12.drawBuffer();
                    _this12.isReady = true;
                    _this12.fireEvent("ready");
                  }
                }), this.backend.once("error", function(err) {
                  return _this12.fireEvent("error", err);
                }));
                if (peaks) {
                  this.backend.setPeaks(peaks, duration);
                  this.drawBuffer();
                  this.fireEvent("waveform-ready");
                }
                if ((!peaks || this.params.forceDecode) && this.backend.supportsWebAudio()) {
                  this.getArrayBuffer(url, function(arraybuffer) {
                    _this12.decodeArrayBuffer(arraybuffer, function(buffer) {
                      _this12.backend.buffer = buffer;
                      _this12.backend.setPeaks(null);
                      _this12.drawBuffer();
                      _this12.fireEvent("waveform-ready");
                    });
                  });
                }
              }
            }, {
              key: "decodeArrayBuffer",
              value: function decodeArrayBuffer(arraybuffer, callback) {
                var _this13 = this;
                if (!this.isDestroyed) {
                  this.arraybuffer = arraybuffer;
                  this.backend.decodeArrayBuffer(arraybuffer, function(data) {
                    if (!_this13.isDestroyed && _this13.arraybuffer == arraybuffer) {
                      callback(data);
                      _this13.arraybuffer = null;
                    }
                  }, function() {
                    return _this13.fireEvent("error", "Error decoding audiobuffer");
                  });
                }
              }
            }, {
              key: "getArrayBuffer",
              value: function getArrayBuffer(url, callback) {
                var _this14 = this;
                var options = Object.assign({
                  url,
                  responseType: "arraybuffer"
                }, this.params.xhr);
                var request = util.fetchFile(options);
                this.currentRequest = request;
                this.tmpEvents.push(request.on("progress", function(e) {
                  _this14.onProgress(e);
                }), request.on("success", function(data) {
                  callback(data);
                  _this14.currentRequest = null;
                }), request.on("error", function(e) {
                  _this14.fireEvent("error", e);
                  _this14.currentRequest = null;
                }));
                return request;
              }
            }, {
              key: "onProgress",
              value: function onProgress(e) {
                var percentComplete;
                if (e.lengthComputable) {
                  percentComplete = e.loaded / e.total;
                } else {
                  percentComplete = e.loaded / (e.loaded + 1e6);
                }
                this.fireEvent("loading", Math.round(percentComplete * 100), e.target);
              }
            }, {
              key: "exportPCM",
              value: function exportPCM(length, accuracy, noWindow, start, end) {
                length = length || 1024;
                start = start || 0;
                accuracy = accuracy || 1e4;
                noWindow = noWindow || false;
                var peaks = this.backend.getPeaks(length, start, end);
                var arr = [].map.call(peaks, function(val) {
                  return Math.round(val * accuracy) / accuracy;
                });
                return new Promise(function(resolve, reject) {
                  if (!noWindow) {
                    var blobJSON = new Blob([JSON.stringify(arr)], {
                      type: "application/json;charset=utf-8"
                    });
                    var objURL = URL.createObjectURL(blobJSON);
                    window.open(objURL);
                    URL.revokeObjectURL(objURL);
                  }
                  resolve(arr);
                });
              }
            }, {
              key: "exportImage",
              value: function exportImage(format, quality, type) {
                if (!format) {
                  format = "image/png";
                }
                if (!quality) {
                  quality = 1;
                }
                if (!type) {
                  type = "dataURL";
                }
                return this.drawer.getImage(format, quality, type);
              }
            }, {
              key: "cancelAjax",
              value: function cancelAjax() {
                if (this.currentRequest && this.currentRequest.controller) {
                  if (this.currentRequest._reader) {
                    this.currentRequest._reader.cancel().catch(function(err) {
                    });
                  }
                  this.currentRequest.controller.abort();
                  this.currentRequest = null;
                }
              }
            }, {
              key: "clearTmpEvents",
              value: function clearTmpEvents() {
                this.tmpEvents.forEach(function(e) {
                  return e.un();
                });
              }
            }, {
              key: "empty",
              value: function empty() {
                if (!this.backend.isPaused()) {
                  this.stop();
                  this.backend.disconnectSource();
                }
                this.isReady = false;
                this.cancelAjax();
                this.clearTmpEvents();
                this.drawer.progress(0);
                this.drawer.setWidth(0);
                this.drawer.drawPeaks({
                  length: this.drawer.getWidth()
                }, 0);
              }
            }, {
              key: "destroy",
              value: function destroy() {
                this.destroyAllPlugins();
                this.fireEvent("destroy");
                this.cancelAjax();
                this.clearTmpEvents();
                this.unAll();
                if (this.params.responsive !== false) {
                  window.removeEventListener("resize", this._onResize, true);
                  window.removeEventListener("orientationchange", this._onResize, true);
                }
                if (this.backend) {
                  this.backend.destroy();
                  this.backend = null;
                }
                if (this.drawer) {
                  this.drawer.destroy();
                }
                this.isDestroyed = true;
                this.isReady = false;
                this.arraybuffer = null;
              }
            }], [{
              key: "create",
              value: function create(params) {
                var wavesurfer2 = new WaveSurfer3(params);
                return wavesurfer2.init();
              }
            }]);
            return WaveSurfer3;
          }(util.Observer);
          exports2["default"] = WaveSurfer2;
          _defineProperty(WaveSurfer2, "VERSION", "6.6.3");
          _defineProperty(WaveSurfer2, "util", util);
          module2.exports = exports2.default;
        },
        "./src/webaudio.js": (module2, exports2, __webpack_require__2) => {
          Object.defineProperty(exports2, "__esModule", {
            value: true
          });
          exports2["default"] = void 0;
          var util = _interopRequireWildcard(__webpack_require__2("./src/util/index.js"));
          function _getRequireWildcardCache(nodeInterop) {
            if (typeof WeakMap !== "function")
              return null;
            var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
            var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
            return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
              return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
            })(nodeInterop);
          }
          function _interopRequireWildcard(obj, nodeInterop) {
            if (!nodeInterop && obj && obj.__esModule) {
              return obj;
            }
            if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
              return { default: obj };
            }
            var cache = _getRequireWildcardCache(nodeInterop);
            if (cache && cache.has(obj)) {
              return cache.get(obj);
            }
            var newObj = {};
            var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
            for (var key in obj) {
              if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
                if (desc && (desc.get || desc.set)) {
                  Object.defineProperty(newObj, key, desc);
                } else {
                  newObj[key] = obj[key];
                }
              }
            }
            newObj.default = obj;
            if (cache) {
              cache.set(obj, newObj);
            }
            return newObj;
          }
          function _typeof(obj) {
            "@babel/helpers - typeof";
            return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
              return typeof obj2;
            } : function(obj2) {
              return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
            }, _typeof(obj);
          }
          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function _defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor)
                descriptor.writable = true;
              Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
            }
          }
          function _createClass(Constructor, protoProps, staticProps) {
            if (protoProps)
              _defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
              _defineProperties(Constructor, staticProps);
            Object.defineProperty(Constructor, "prototype", { writable: false });
            return Constructor;
          }
          function _inherits(subClass, superClass) {
            if (typeof superClass !== "function" && superClass !== null) {
              throw new TypeError("Super expression must either be null or a function");
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
            Object.defineProperty(subClass, "prototype", { writable: false });
            if (superClass)
              _setPrototypeOf(subClass, superClass);
          }
          function _setPrototypeOf(o, p) {
            _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
              o2.__proto__ = p2;
              return o2;
            };
            return _setPrototypeOf(o, p);
          }
          function _createSuper(Derived) {
            var hasNativeReflectConstruct = _isNativeReflectConstruct();
            return function _createSuperInternal() {
              var Super = _getPrototypeOf(Derived), result;
              if (hasNativeReflectConstruct) {
                var NewTarget = _getPrototypeOf(this).constructor;
                result = Reflect.construct(Super, arguments, NewTarget);
              } else {
                result = Super.apply(this, arguments);
              }
              return _possibleConstructorReturn(this, result);
            };
          }
          function _possibleConstructorReturn(self2, call) {
            if (call && (_typeof(call) === "object" || typeof call === "function")) {
              return call;
            } else if (call !== void 0) {
              throw new TypeError("Derived constructors may only return object or undefined");
            }
            return _assertThisInitialized(self2);
          }
          function _assertThisInitialized(self2) {
            if (self2 === void 0) {
              throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            return self2;
          }
          function _isNativeReflectConstruct() {
            if (typeof Reflect === "undefined" || !Reflect.construct)
              return false;
            if (Reflect.construct.sham)
              return false;
            if (typeof Proxy === "function")
              return true;
            try {
              Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
              }));
              return true;
            } catch (e) {
              return false;
            }
          }
          function _getPrototypeOf(o) {
            _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
              return o2.__proto__ || Object.getPrototypeOf(o2);
            };
            return _getPrototypeOf(o);
          }
          function _defineProperty(obj, key, value) {
            key = _toPropertyKey(key);
            if (key in obj) {
              Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
            } else {
              obj[key] = value;
            }
            return obj;
          }
          function _toPropertyKey(arg) {
            var key = _toPrimitive(arg, "string");
            return _typeof(key) === "symbol" ? key : String(key);
          }
          function _toPrimitive(input, hint) {
            if (_typeof(input) !== "object" || input === null)
              return input;
            var prim = input[Symbol.toPrimitive];
            if (prim !== void 0) {
              var res = prim.call(input, hint || "default");
              if (_typeof(res) !== "object")
                return res;
              throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return (hint === "string" ? String : Number)(input);
          }
          var PLAYING = "playing";
          var PAUSED = "paused";
          var FINISHED = "finished";
          var WebAudio = /* @__PURE__ */ function(_util$Observer) {
            _inherits(WebAudio2, _util$Observer);
            var _super = _createSuper(WebAudio2);
            function WebAudio2(params) {
              var _defineProperty2, _this$states;
              var _this;
              _classCallCheck(this, WebAudio2);
              _this = _super.call(this);
              _defineProperty(_assertThisInitialized(_this), "audioContext", null);
              _defineProperty(_assertThisInitialized(_this), "stateBehaviors", (_defineProperty2 = {}, _defineProperty(_defineProperty2, PLAYING, {
                init: function init() {
                  this.addOnAudioProcess();
                },
                getPlayedPercents: function getPlayedPercents() {
                  var duration = this.getDuration();
                  return this.getCurrentTime() / duration || 0;
                },
                getCurrentTime: function getCurrentTime() {
                  return this.startPosition + this.getPlayedTime();
                }
              }), _defineProperty(_defineProperty2, PAUSED, {
                init: function init() {
                },
                getPlayedPercents: function getPlayedPercents() {
                  var duration = this.getDuration();
                  return this.getCurrentTime() / duration || 0;
                },
                getCurrentTime: function getCurrentTime() {
                  return this.startPosition;
                }
              }), _defineProperty(_defineProperty2, FINISHED, {
                init: function init() {
                  this.fireEvent("finish");
                },
                getPlayedPercents: function getPlayedPercents() {
                  return 1;
                },
                getCurrentTime: function getCurrentTime() {
                  return this.getDuration();
                }
              }), _defineProperty2));
              _this.params = params;
              _this.ac = params.audioContext || (_this.supportsWebAudio() ? _this.getAudioContext() : {});
              _this.lastPlay = _this.ac.currentTime;
              _this.startPosition = 0;
              _this.scheduledPause = null;
              _this.states = (_this$states = {}, _defineProperty(_this$states, PLAYING, Object.create(_this.stateBehaviors[PLAYING])), _defineProperty(_this$states, PAUSED, Object.create(_this.stateBehaviors[PAUSED])), _defineProperty(_this$states, FINISHED, Object.create(_this.stateBehaviors[FINISHED])), _this$states);
              _this.buffer = null;
              _this.filters = [];
              _this.gainNode = null;
              _this.mergedPeaks = null;
              _this.offlineAc = null;
              _this.peaks = null;
              _this.playbackRate = 1;
              _this.analyser = null;
              _this.scriptNode = null;
              _this.source = null;
              _this.splitPeaks = [];
              _this.state = null;
              _this.explicitDuration = params.duration;
              _this.sinkStreamDestination = null;
              _this.sinkAudioElement = null;
              _this.destroyed = false;
              return _this;
            }
            _createClass(WebAudio2, [{
              key: "supportsWebAudio",
              value: function supportsWebAudio() {
                return !!(window.AudioContext || window.webkitAudioContext);
              }
            }, {
              key: "getAudioContext",
              value: function getAudioContext() {
                if (!window.WaveSurferAudioContext) {
                  window.WaveSurferAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                return window.WaveSurferAudioContext;
              }
            }, {
              key: "getOfflineAudioContext",
              value: function getOfflineAudioContext(sampleRate) {
                if (!window.WaveSurferOfflineAudioContext) {
                  window.WaveSurferOfflineAudioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, sampleRate);
                }
                return window.WaveSurferOfflineAudioContext;
              }
            }, {
              key: "init",
              value: function init() {
                this.createVolumeNode();
                this.createScriptNode();
                this.createAnalyserNode();
                this.setState(PAUSED);
                this.setPlaybackRate(this.params.audioRate);
                this.setLength(0);
              }
            }, {
              key: "disconnectFilters",
              value: function disconnectFilters() {
                if (this.filters) {
                  this.filters.forEach(function(filter) {
                    filter && filter.disconnect();
                  });
                  this.filters = null;
                  this.analyser.connect(this.gainNode);
                }
              }
            }, {
              key: "setState",
              value: function setState(state) {
                if (this.state !== this.states[state]) {
                  this.state = this.states[state];
                  this.state.init.call(this);
                }
              }
            }, {
              key: "setFilter",
              value: function setFilter() {
                for (var _len = arguments.length, filters = new Array(_len), _key = 0; _key < _len; _key++) {
                  filters[_key] = arguments[_key];
                }
                this.setFilters(filters);
              }
            }, {
              key: "setFilters",
              value: function setFilters(filters) {
                this.disconnectFilters();
                if (filters && filters.length) {
                  this.filters = filters;
                  this.analyser.disconnect();
                  filters.reduce(function(prev, curr) {
                    prev.connect(curr);
                    return curr;
                  }, this.analyser).connect(this.gainNode);
                }
              }
            }, {
              key: "createScriptNode",
              value: function createScriptNode() {
                if (this.params.audioScriptProcessor) {
                  this.scriptNode = this.params.audioScriptProcessor;
                  this.scriptNode.connect(this.ac.destination);
                }
              }
            }, {
              key: "addOnAudioProcess",
              value: function addOnAudioProcess() {
                var _this2 = this;
                var loop = function loop2() {
                  var time = _this2.getCurrentTime();
                  if (time >= _this2.getDuration() && _this2.state !== _this2.states[FINISHED]) {
                    _this2.setState(FINISHED);
                    _this2.fireEvent("pause");
                  } else if (time >= _this2.scheduledPause && _this2.state !== _this2.states[PAUSED]) {
                    _this2.pause();
                  } else if (_this2.state === _this2.states[PLAYING]) {
                    _this2.fireEvent("audioprocess", time);
                    util.frame(loop2)();
                  }
                };
                loop();
              }
            }, {
              key: "createAnalyserNode",
              value: function createAnalyserNode() {
                this.analyser = this.ac.createAnalyser();
                this.analyser.connect(this.gainNode);
              }
            }, {
              key: "createVolumeNode",
              value: function createVolumeNode() {
                if (this.ac.createGain) {
                  this.gainNode = this.ac.createGain();
                } else {
                  this.gainNode = this.ac.createGainNode();
                }
                this.gainNode.connect(this.ac.destination);
              }
            }, {
              key: "setSinkId",
              value: function setSinkId(deviceId) {
                if (deviceId) {
                  if (!this.sinkAudioElement) {
                    this.sinkAudioElement = new window.Audio();
                    this.sinkAudioElement.autoplay = true;
                  }
                  if (!this.sinkAudioElement.setSinkId) {
                    return Promise.reject(new Error("setSinkId is not supported in your browser"));
                  }
                  if (!this.sinkStreamDestination) {
                    this.sinkStreamDestination = this.ac.createMediaStreamDestination();
                  }
                  this.gainNode.disconnect();
                  this.gainNode.connect(this.sinkStreamDestination);
                  this.sinkAudioElement.srcObject = this.sinkStreamDestination.stream;
                  return this.sinkAudioElement.setSinkId(deviceId);
                } else {
                  return Promise.reject(new Error("Invalid deviceId: " + deviceId));
                }
              }
            }, {
              key: "setVolume",
              value: function setVolume(value) {
                this.gainNode.gain.setValueAtTime(value, this.ac.currentTime);
              }
            }, {
              key: "getVolume",
              value: function getVolume() {
                return this.gainNode.gain.value;
              }
            }, {
              key: "decodeArrayBuffer",
              value: function decodeArrayBuffer(arraybuffer, callback, errback) {
                if (!this.offlineAc) {
                  this.offlineAc = this.getOfflineAudioContext(this.ac && this.ac.sampleRate ? this.ac.sampleRate : 44100);
                }
                if ("webkitAudioContext" in window) {
                  this.offlineAc.decodeAudioData(arraybuffer, function(data) {
                    return callback(data);
                  }, errback);
                } else {
                  this.offlineAc.decodeAudioData(arraybuffer).then(function(data) {
                    return callback(data);
                  }).catch(function(err) {
                    return errback(err);
                  });
                }
              }
            }, {
              key: "setPeaks",
              value: function setPeaks(peaks, duration) {
                if (duration != null) {
                  this.explicitDuration = duration;
                }
                this.peaks = peaks;
              }
            }, {
              key: "setLength",
              value: function setLength(length) {
                if (this.mergedPeaks && length == 2 * this.mergedPeaks.length - 1 + 2) {
                  return;
                }
                this.splitPeaks = [];
                this.mergedPeaks = [];
                var channels = this.buffer ? this.buffer.numberOfChannels : 1;
                var c;
                for (c = 0; c < channels; c++) {
                  this.splitPeaks[c] = [];
                  this.splitPeaks[c][2 * (length - 1)] = 0;
                  this.splitPeaks[c][2 * (length - 1) + 1] = 0;
                }
                this.mergedPeaks[2 * (length - 1)] = 0;
                this.mergedPeaks[2 * (length - 1) + 1] = 0;
              }
            }, {
              key: "getPeaks",
              value: function getPeaks(length, first, last) {
                if (this.peaks) {
                  return this.peaks;
                }
                if (!this.buffer) {
                  return [];
                }
                first = first || 0;
                last = last || length - 1;
                this.setLength(length);
                if (!this.buffer) {
                  return this.params.splitChannels ? this.splitPeaks : this.mergedPeaks;
                }
                if (!this.buffer.length) {
                  var newBuffer = this.createBuffer(1, 4096, this.sampleRate);
                  this.buffer = newBuffer.buffer;
                }
                var sampleSize = this.buffer.length / length;
                var sampleStep = ~~(sampleSize / 10) || 1;
                var channels = this.buffer.numberOfChannels;
                var c;
                for (c = 0; c < channels; c++) {
                  var peaks = this.splitPeaks[c];
                  var chan = this.buffer.getChannelData(c);
                  var i = void 0;
                  for (i = first; i <= last; i++) {
                    var start = ~~(i * sampleSize);
                    var end = ~~(start + sampleSize);
                    var min = chan[start];
                    var max = min;
                    var j = void 0;
                    for (j = start; j < end; j += sampleStep) {
                      var value = chan[j];
                      if (value > max) {
                        max = value;
                      }
                      if (value < min) {
                        min = value;
                      }
                    }
                    peaks[2 * i] = max;
                    peaks[2 * i + 1] = min;
                    if (c == 0 || max > this.mergedPeaks[2 * i]) {
                      this.mergedPeaks[2 * i] = max;
                    }
                    if (c == 0 || min < this.mergedPeaks[2 * i + 1]) {
                      this.mergedPeaks[2 * i + 1] = min;
                    }
                  }
                }
                return this.params.splitChannels ? this.splitPeaks : this.mergedPeaks;
              }
            }, {
              key: "getPlayedPercents",
              value: function getPlayedPercents() {
                return this.state.getPlayedPercents.call(this);
              }
            }, {
              key: "disconnectSource",
              value: function disconnectSource() {
                if (this.source) {
                  this.source.disconnect();
                }
              }
            }, {
              key: "destroyWebAudio",
              value: function destroyWebAudio() {
                this.disconnectFilters();
                this.disconnectSource();
                this.gainNode.disconnect();
                this.scriptNode && this.scriptNode.disconnect();
                this.analyser.disconnect();
                if (this.params.closeAudioContext) {
                  if (typeof this.ac.close === "function" && this.ac.state != "closed") {
                    this.ac.close();
                  }
                  this.ac = null;
                  if (!this.params.audioContext) {
                    window.WaveSurferAudioContext = null;
                  } else {
                    this.params.audioContext = null;
                  }
                  window.WaveSurferOfflineAudioContext = null;
                }
                if (this.sinkStreamDestination) {
                  this.sinkAudioElement.pause();
                  this.sinkAudioElement.srcObject = null;
                  this.sinkStreamDestination.disconnect();
                  this.sinkStreamDestination = null;
                }
              }
            }, {
              key: "destroy",
              value: function destroy() {
                if (!this.isPaused()) {
                  this.pause();
                }
                this.unAll();
                this.buffer = null;
                this.destroyed = true;
                this.destroyWebAudio();
              }
            }, {
              key: "load",
              value: function load(buffer) {
                this.startPosition = 0;
                this.lastPlay = this.ac.currentTime;
                this.buffer = buffer;
                this.createSource();
              }
            }, {
              key: "createSource",
              value: function createSource() {
                this.disconnectSource();
                this.source = this.ac.createBufferSource();
                this.source.start = this.source.start || this.source.noteGrainOn;
                this.source.stop = this.source.stop || this.source.noteOff;
                this.setPlaybackRate(this.playbackRate);
                this.source.buffer = this.buffer;
                this.source.connect(this.analyser);
              }
            }, {
              key: "resumeAudioContext",
              value: function resumeAudioContext() {
                if (this.ac.state == "suspended") {
                  this.ac.resume && this.ac.resume();
                }
              }
            }, {
              key: "isPaused",
              value: function isPaused() {
                return this.state !== this.states[PLAYING];
              }
            }, {
              key: "getDuration",
              value: function getDuration() {
                if (this.explicitDuration) {
                  return this.explicitDuration;
                }
                if (!this.buffer) {
                  return 0;
                }
                return this.buffer.duration;
              }
            }, {
              key: "seekTo",
              value: function seekTo(start, end) {
                if (!this.buffer) {
                  return;
                }
                this.scheduledPause = null;
                if (start == null) {
                  start = this.getCurrentTime();
                  if (start >= this.getDuration()) {
                    start = 0;
                  }
                }
                if (end == null) {
                  end = this.getDuration();
                }
                this.startPosition = start;
                this.lastPlay = this.ac.currentTime;
                if (this.state === this.states[FINISHED]) {
                  this.setState(PAUSED);
                }
                return {
                  start,
                  end
                };
              }
            }, {
              key: "getPlayedTime",
              value: function getPlayedTime() {
                return (this.ac.currentTime - this.lastPlay) * this.playbackRate;
              }
            }, {
              key: "play",
              value: function play(start, end) {
                if (!this.buffer) {
                  return;
                }
                this.createSource();
                var adjustedTime = this.seekTo(start, end);
                start = adjustedTime.start;
                end = adjustedTime.end;
                this.scheduledPause = end;
                this.source.start(0, start);
                this.resumeAudioContext();
                this.setState(PLAYING);
                this.fireEvent("play");
              }
            }, {
              key: "pause",
              value: function pause() {
                this.scheduledPause = null;
                this.startPosition += this.getPlayedTime();
                try {
                  this.source && this.source.stop(0);
                } catch (err) {
                }
                this.setState(PAUSED);
                this.fireEvent("pause");
              }
            }, {
              key: "getCurrentTime",
              value: function getCurrentTime() {
                return this.state.getCurrentTime.call(this);
              }
            }, {
              key: "getPlaybackRate",
              value: function getPlaybackRate() {
                return this.playbackRate;
              }
            }, {
              key: "setPlaybackRate",
              value: function setPlaybackRate(value) {
                this.playbackRate = value || 1;
                this.source && this.source.playbackRate.setValueAtTime(this.playbackRate, this.ac.currentTime);
              }
            }, {
              key: "setPlayEnd",
              value: function setPlayEnd(end) {
                this.scheduledPause = end;
              }
            }]);
            return WebAudio2;
          }(util.Observer);
          exports2["default"] = WebAudio;
          module2.exports = exports2.default;
        },
        "./node_modules/debounce/index.js": (module2) => {
          function debounce(func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            if (null == wait)
              wait = 100;
            function later() {
              var last = Date.now() - timestamp;
              if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
              } else {
                timeout = null;
                if (!immediate) {
                  result = func.apply(context, args);
                  context = args = null;
                }
              }
            }
            var debounced = function() {
              context = this;
              args = arguments;
              timestamp = Date.now();
              var callNow = immediate && !timeout;
              if (!timeout)
                timeout = setTimeout(later, wait);
              if (callNow) {
                result = func.apply(context, args);
                context = args = null;
              }
              return result;
            };
            debounced.clear = function() {
              if (timeout) {
                clearTimeout(timeout);
                timeout = null;
              }
            };
            debounced.flush = function() {
              if (timeout) {
                result = func.apply(context, args);
                context = args = null;
                clearTimeout(timeout);
                timeout = null;
              }
            };
            return debounced;
          }
          debounce.debounce = debounce;
          module2.exports = debounce;
        }
      };
      var __webpack_module_cache__ = {};
      function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== void 0) {
          return cachedModule.exports;
        }
        var module2 = __webpack_module_cache__[moduleId] = {
          exports: {}
        };
        __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
        return module2.exports;
      }
      var __webpack_exports__ = __webpack_require__("./src/wavesurfer.js");
      return __webpack_exports__;
    })();
  });
})(wavesurfer);
var WaveSurfer = /* @__PURE__ */ getDefaultExportFromCjs(wavesurfer.exports);
var render$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "wave-container" }, [_c("div", { ref: "waveform", attrs: { "id": "waveform" } }), _vm.isReady ? _c("div", { staticClass: "wave-controls" }, [_c("icon-button", { directives: [{ name: "show", rawName: "v-show", value: !_vm.compact, expression: "!compact" }], attrs: { "name": "backward" }, on: { "click": function($event) {
    return _vm.wavesurfer.skipBackward();
  } } }), _c("icon-button", { attrs: { "name": _vm.playing ? "pause" : "play" }, on: { "click": function($event) {
    return _vm.wavesurfer.playPause();
  } } }), _c("icon-button", { directives: [{ name: "show", rawName: "v-show", value: !_vm.compact, expression: "!compact" }], attrs: { "name": "forward" }, on: { "click": function($event) {
    return _vm.wavesurfer.skipForward();
  } } }), _c("icon-button", { directives: [{ name: "show", rawName: "v-show", value: !_vm.compact, expression: "!compact" }], attrs: { "name": _vm.isMute ? "volumeMute" : "volume" }, on: { "click": function($event) {
    return _vm.wavesurfer.toggleMute();
  } } }), _c("div", { directives: [{ name: "show", rawName: "v-show", value: !_vm.compact, expression: "!compact" }], staticClass: "vue-player__time" }, [_vm._v(" " + _vm._s(_vm.currentTime) + " / " + _vm._s(_vm.duration) + " ")])], 1) : _vm._e()]);
};
var staticRenderFns$5 = [];
var AudioVisualizer_vue_vue_type_style_index_0_lang = "";
const __vue2_script$5 = {
  name: "AudioVisualizer",
  components: { IconButton },
  props: {
    src: { type: String },
    compact: { type: Boolean, default: false }
  },
  data() {
    return {
      wavesurfer: null
    };
  },
  computed: {
    isReady() {
      return this.wavesurfer;
    },
    duration() {
      if (this.isReady) {
        return convertTimeMMSS(this.wavesurfer.getDuration());
      }
      return convertTimeMMSS(0);
    },
    currentTime() {
      if (this.isReady) {
        return convertTimeMMSS(this.wavesurfer.getCurrentTime());
      }
      return convertTimeMMSS(0);
    },
    isMute() {
      if (this.isReady) {
        return this.wavesurfer.getMute();
      }
      return false;
    },
    playing() {
      if (this.isReady) {
        return this.wavesurfer.isPlaying();
      }
      return false;
    }
  },
  watch: {
    src: {
      deep: true,
      handler() {
        if (this.src) {
          this.wavesurfer.load(this.src);
        }
      }
    }
  },
  mounted() {
    document.createElement("canvas").getContext("2d");
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      waveColor: "#0f6cbd",
      progressColor: "#0e4775",
      cursorColor: "#666",
      cursorWidth: 1,
      barWidth: 2,
      barHeight: 1,
      barGap: null,
      height: 32,
      normalize: true,
      hideScrollbar: true,
      responsive: true,
      fillParent: true
    });
  }
};
const __cssModules$5 = {};
var __component__$5 = /* @__PURE__ */ normalizeComponent(
  __vue2_script$5,
  render$5,
  staticRenderFns$5,
  false,
  __vue2_injectStyles$5,
  null,
  null,
  null
);
function __vue2_injectStyles$5(context) {
  for (let o in __cssModules$5) {
    this[o] = __cssModules$5[o];
  }
}
var AudioVisualizer = /* @__PURE__ */ function() {
  return __component__$5.exports;
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
var render$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { ref: _vm.refId, staticClass: "player-line-control", on: { "mousedown": _vm.onMouseDown } }, [_c("div", { staticClass: "player-line-control__head", style: _vm.calculateSize })]);
};
var staticRenderFns$4 = [];
var LineControl_vue_vue_type_style_index_0_lang = "";
const __vue2_script$4 = {
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
var LineControl = /* @__PURE__ */ function() {
  return __component__$4.exports;
}();
var render$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "player-volume" }, [_c("icon-button", { staticClass: "player-volume__icon", attrs: { "name": "volume" } }), _c("line-control", { staticClass: "player-volume-bar", attrs: { "ref-id": "volume", "percentage": _vm.volume }, on: { "change-linehead": _vm.onChangeLinehead } })], 1);
};
var staticRenderFns$3 = [];
var VolumeControl_vue_vue_type_style_index_0_lang = "";
const __vue2_script$3 = {
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
var VolumeControl = /* @__PURE__ */ function() {
  return __component__$3.exports;
}();
var render$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "recorder-player" }, [_c("div", { staticClass: "vue-player" }, [_c("div", { staticClass: "vue-player-actions" }, [_c("icon-button", { staticClass: "ar-icon ar-icon__lg vue-player__play", class: {
    "vue-player__play--active": _vm.isPlaying
  }, attrs: { "id": "play", "name": _vm.playBtnIcon }, on: { "click": _vm.playback } })], 1), _c("div", { staticClass: "vue-player-bar" }, [_c("div", { directives: [{ name: "show", rawName: "v-show", value: !_vm.compact, expression: "!compact" }], staticClass: "vue-player__time" }, [_vm._v(" " + _vm._s(_vm.playedTime) + " / " + _vm._s(_vm.duration) + " ")]), _c("line-control", { staticClass: "vue-player__progress", attrs: { "ref-id": "progress", "percentage": _vm.progress }, on: { "change-linehead": _vm._onUpdateProgress } }), _c("volume-control", { on: { "change-volume": _vm._onChangeVolume } })], 1)]), _c("audio", { ref: "playerRef", attrs: { "src": _vm.audioSource, "type": "audio/mpeg" } })]);
};
var staticRenderFns$2 = [];
var CustomPlayer_vue_vue_type_style_index_0_lang = "";
const __vue2_script$2 = {
  name: "PlayerWidget",
  components: {
    IconButton,
    LineControl,
    VolumeControl
  },
  props: {
    src: { type: String },
    compact: { type: Boolean, default: false }
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
    audioSource() {
      if (this.src) {
        return this.src;
      }
      return "";
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
var CustomPlayer = /* @__PURE__ */ function() {
  return __component__$2.exports;
}();
var render$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.customPlayer ? _c("custom-player", { attrs: { "src": _vm.audioSource, "compact": _vm.compact, "disabled": _vm.disablePlayer } }) : _vm.wavePlayer ? _c("audio-visualizer", { attrs: { "src": _vm.audioSource, "compact": _vm.compact, "disabled": _vm.disablePlayer } }) : _c("figure", [_c("audio", { ref: "playerRef", staticClass: "mx-auto", attrs: { "controls": "", "src": _vm.audioSource, "type": "audio/mpeg" } }, [_vm._v(" Your browser does not support the "), _c("code", [_vm._v("audio")]), _vm._v(" element. ")])]);
};
var staticRenderFns$1 = [];
var PlayerWidget_vue_vue_type_style_index_0_lang = "";
const __vue2_script$1 = {
  name: "PlayerWidget",
  components: {
    AudioVisualizer,
    CustomPlayer
  },
  props: {
    record: { type: Object },
    src: { type: String },
    customPlayer: { type: Boolean, default: false },
    wavePlayer: { type: Boolean, default: false },
    compact: { type: Boolean, default: false }
  },
  data() {
    return {
      isPlaying: false,
      duration: convertTimeMMSS(0),
      playedTime: convertTimeMMSS(0),
      progress: 0
    };
  },
  computed: {
    disablePlayer() {
      return this.objectNullOrEmpty(this.record) && !this.src;
    },
    audioSource() {
      if (this.record) {
        return this.record.url;
      } else if (this.src) {
        return this.src;
      }
      return "";
    }
  },
  methods: {
    objectNullOrEmpty(obj) {
      if (!obj)
        return true;
      return Object.keys(obj).length === 0;
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
  return _c("div", { staticClass: "recorder-container" }, [_c("div", { class: { compact: _vm.compact } }, [_c("div", { staticClass: "recorder-action" }, [_c("icon-button", { staticClass: "vue-recorder-action", attrs: { "name": _vm.iconButtonType, "disabled": _vm.attemptsLeft == 0 }, on: { "click": function($event) {
    return _vm.toggleRecording();
  } } }), !_vm.compact ? _c("icon-button", { staticClass: "vue-recorder-stop", attrs: { "name": "stop", "disabled": _vm.attemptsLeft == 0 }, on: { "click": function($event) {
    return _vm.stopRecording();
  } } }) : _vm._e()], 1), _c("div", { staticClass: "timing" }, [_vm.attempts && !_vm.compact ? _c("div", { staticClass: "time-attempt" }, [_vm._v(" Attempts: " + _vm._s(_vm.attemptsLeft) + "/" + _vm._s(_vm.attempts) + " ")]) : _vm._e(), _c("div", { staticClass: "recording-time" }, [_vm.countdown ? _c("span", [_vm._v(" " + _vm._s(_vm.countdownTitle))]) : _vm._e(), _c("span", { staticClass: "recorder-timer" }, [_vm._v(_vm._s(_vm.recordedTime))])]), _vm.time && !_vm.compact ? _c("div", { staticClass: "time-limit" }, [_vm._v(" Record duration is limited: " + _vm._s(_vm.time) + "s ")]) : _vm._e()])]), !_vm.compact && _vm.recordList.length > 0 ? _c("div", { staticClass: "vue-records" }, _vm._l(_vm.recordList, function(record, idx) {
    return _c("div", { key: record.id, staticClass: "vue-records__record", class: { "vue-records__record--selected": record.id === _vm.selected.id }, on: { "click": function($event) {
      return _vm.choiceRecord(record);
    } } }, [_c("span", [_vm._v("Record " + _vm._s(idx + 1))]), _c("div", { staticClass: "list-actions" }, [record.id === _vm.selected.id && _vm.showDownloadButton ? _c("icon-button", { attrs: { "id": "download", "name": "download" }, on: { "click": _vm.download } }) : _vm._e(), record.id === _vm.selected.id && _vm.showUploadButton ? _c("icon-button", { staticClass: "submit-button", attrs: { "id": "upload", "name": "upload" }, on: { "click": _vm.sendData } }) : _vm._e(), record.id === _vm.selected.id ? _c("icon-button", { attrs: { "name": "remove" }, on: { "click": function($event) {
      return _vm.removeRecord(idx);
    } } }) : _vm._e()], 1), _c("div", { staticClass: "vue__text" }, [_vm._v(_vm._s(record.duration))])]);
  }), 0) : _vm._e(), _c("player-widget", { attrs: { "custom-player": _vm.customPlayer, "wavePlayer": _vm.wavePlayer, "record": _vm.selected, "compact": _vm.compact } }), _vm.successMessage || _vm.errorMessage ? _c("div", { staticClass: "recorder-message" }, [_vm.successMessage ? _c("span", { staticClass: "color-success" }, [_vm._v(" " + _vm._s(_vm.successMessage) + " ")]) : _vm._e(), _vm.errorMessage ? _c("span", { staticClass: "color-danger" }, [_vm._v(" " + _vm._s(_vm.errorMessage) + " ")]) : _vm._e()]) : _vm._e()], 1);
};
var staticRenderFns = [];
var RecorderWidget_vue_vue_type_style_index_0_lang = "";
const ERROR_MESSAGE = "Failed to use microphone. Please refresh and try again and permit the use of a microphone.";
const SUCCESS_MESSAGE = "Successfully recorded message!";
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
    filename: { type: String, default: "audio" },
    countdownTitle: { type: String, default: "Time remaining" },
    backendEndpoint: { type: String },
    showDownloadButton: { type: Boolean, default: true },
    showUploadButton: { type: Boolean, default: true },
    compact: { type: Boolean, default: false },
    customPlayer: { type: Boolean, default: false },
    wavePlayer: { type: Boolean, default: false },
    countdown: { type: Boolean, default: false },
    selectRecordChanged: { type: Function, default: null },
    customUpload: { type: Function, default: null }
  },
  data() {
    return {
      recording: false,
      recorder: null,
      successMessage: null,
      errorMessage: null,
      recordList: [],
      selected: {}
    };
  },
  computed: {
    recordedTime() {
      var _a, _b;
      if (this.countdown) {
        return convertTimeMMSS(this.time - ((_a = this.recorder) == null ? void 0 : _a.duration));
      }
      return convertTimeMMSS((_b = this.recorder) == null ? void 0 : _b.duration);
    },
    attemptsLeft() {
      return this.attempts - this.recordList.length;
    },
    iconButtonType() {
      return this.recording && this.compact ? "stop" : this.recording ? "record" : "mic";
    }
  },
  watch: {
    "recorder.duration": {
      deep: true,
      handler() {
        var _a;
        if (this.time && ((_a = this.recorder) == null ? void 0 : _a.duration) >= this.time) {
          this.toggleRecording();
        }
      }
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
      this.$emit("beforeRecording");
    },
    stopRecording() {
      this.recording = false;
      this.recorder.stop();
      const recorded = this.recorder.recordList();
      this.selected = recorded[0];
      if (this.selected && this.selected.url) {
        this.recordList.push(this.selected);
        this.successMessage = SUCCESS_MESSAGE;
        this.$emit("afterRecording", this.selected);
      } else {
        this.errorMessage = ERROR_SUBMITTING_MESSAGE;
      }
    },
    async sendData() {
      if (!this.selected) {
        return;
      }
      this.customUpload(this.selected.blob);
    },
    micFailed() {
      this.recording = false;
      this.errorMessage = ERROR_MESSAGE;
      this.$emit("micFailed");
    },
    removeRecord(idx) {
      this.recordList.splice(idx, 1);
      this.$set(this.selected, "url", null);
      this.$emit("removeRecord", idx);
    },
    choiceRecord(record) {
      if (this.selected === record) {
        return;
      }
      this.$emit("selectRecordChanged", record);
    },
    download() {
      if (this.selected && !this.selected.url) {
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
