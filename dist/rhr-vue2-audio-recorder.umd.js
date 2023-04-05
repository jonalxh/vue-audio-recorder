(function(u,h){typeof exports=="object"&&typeof module!="undefined"?h(exports):typeof define=="function"&&define.amd?define(["exports"],h):(u=typeof globalThis!="undefined"?globalThis:u||self,h(u["rhr-vue2-audio-recorder"]={}))})(this,function(u){"use strict";class h{constructor(t){this.backendEndpoint=t}async postBackend(t){try{return!!(await fetch(this.backendEndpoint,{method:"POST",body:t})).ok}catch{return!1}}}function l(e){return e?new Date(e*1e3).toISOString().substring(14,19):null}class E{constructor(t){this.bufferSize=t.bufferSize||4096,this.sampleRate=t.sampleRate,this.samples=t.samples}finish(){this._joinSamples();const t=new ArrayBuffer(44+this.samples.length*2),s=new DataView(t);this._writeString(s,0,"RIFF"),s.setUint32(4,36+this.samples.length*2,!0),this._writeString(s,8,"WAVE"),this._writeString(s,12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,this.sampleRate,!0),s.setUint32(28,this.sampleRate*4,!0),s.setUint16(32,4,!0),s.setUint16(34,16,!0),this._writeString(s,36,"data"),s.setUint32(40,this.samples.length*2,!0),this._floatTo16BitPCM(s,44,this.samples);const r=new Blob([s],{type:"audio/wav"});return{id:Date.now(),blob:r,url:URL.createObjectURL(r)}}_floatTo16BitPCM(t,s,r){for(let i=0;i<r.length;i++,s+=2){const a=Math.max(-1,Math.min(1,r[i]));t.setInt16(s,a<0?a*32768:a*32767,!0)}}_joinSamples(){const t=this.samples.length*this.bufferSize,s=new Float64Array(t);let r=0;for(let i=0;i<this.samples.length;i++){const a=this.samples[i];s.set(a,r),r+=a.length}this.samples=s}_writeString(t,s,r){for(let i=0;i<r.length;i++)t.setUint8(s+i,r.charCodeAt(i))}}class x{constructor(t={}){this.beforeRecording=t.beforeRecording,this.pauseRecording=t.pauseRecording,this.afterRecording=t.afterRecording,this.micFailed=t.micFailed,this.encoderOptions={bitRate:t.bitRate,sampleRate:t.sampleRate},this.bufferSize=4096,this.records=[],this.isPause=!1,this.isRecording=!1,this.duration=0,this.volume=0,this.wavSamples=[],this._duration=0}start(){const t={video:!1,audio:{channelCount:1,echoCancellation:!1}};this.beforeRecording&&this.beforeRecording("start recording"),navigator.mediaDevices.getUserMedia(t).then(this._micCaptured.bind(this)).catch(this._micError.bind(this)),this.isPause=!1,this.isRecording=!0}stop(){this.stream.getTracks().forEach(r=>r.stop()),this.input.disconnect(),this.processor.disconnect(),this.context.close();let t=null;t=new E({bufferSize:this.bufferSize,sampleRate:this.encoderOptions.sampleRate,samples:this.wavSamples}).finish(),this.wavSamples=[],t.duration=l(this.duration),this.records.push(t),this._duration=0,this.duration=0,this.isPause=!1,this.isRecording=!1,this.afterRecording&&this.afterRecording(t)}pause(){this.stream.getTracks().forEach(t=>t.stop()),this.input.disconnect(),this.processor.disconnect(),this._duration=this.duration,this.isPause=!0,this.pauseRecording&&this.pauseRecording("pause recording")}recordList(){return this.records}lastRecord(){return this.records.slice(-1).pop()}_micCaptured(t){this.context=new(window.AudioContext||window.webkitAudioContext),this.duration=this._duration,this.input=this.context.createMediaStreamSource(t),this.processor=this.context.createScriptProcessor(this.bufferSize,1,1),this.stream=t,this.processor.onaudioprocess=s=>{const r=s.inputBuffer.getChannelData(0);let i=0;this.wavSamples.push(new Float32Array(r));for(let a=0;a<r.length;++a)i+=r[a]*r[a];this.duration=parseFloat(this._duration)+parseFloat(this.context.currentTime.toFixed(2)),this.volume=Math.sqrt(i/r.length).toFixed(2)},this.input.connect(this.processor),this.processor.connect(this.context.destination)}_micError(t){this.micFailed&&this.micFailed(t)}}var B=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("button",{staticClass:"icon-button",attrs:{type:"button"},on:{click:function(r){return e.onClick()}}},[s("span",{domProps:{innerHTML:e._s(e.icons[e.name])}})])},P=[],ve="";function d(e,t,s,r,i,a,C,pe){var n=typeof e=="function"?e.options:e;t&&(n.render=t,n.staticRenderFns=s,n._compiled=!0),r&&(n.functional=!0),a&&(n._scopeId="data-v-"+a);var c;if(C?(c=function(o){o=o||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext,!o&&typeof __VUE_SSR_CONTEXT__!="undefined"&&(o=__VUE_SSR_CONTEXT__),i&&i.call(this,o),o&&o._registeredComponents&&o._registeredComponents.add(C)},n._ssrRegister=c):i&&(c=pe?function(){i.call(this,(n.functional?this.parent:this).$root.$options.shadowRoot)}:i),c)if(n.functional){n._injectStyles=c;var _e=n.render;n.render=function(me,$){return c.call($),_e(me,$)}}else{var R=n.beforeCreate;n.beforeCreate=R?[].concat(R,c):[c]}return{exports:e,options:n}}const U={props:{name:{type:String}},data(){return{icons:{download:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M3.5 13h9a.5.5 0 0 1 .09.992L12.5 14h-9a.5.5 0 0 1-.09-.992L3.5 13h9h-9ZM7.91 1.008L8 1a.5.5 0 0 1 .492.41l.008.09v8.792l2.682-2.681a.5.5 0 0 1 .638-.058l.07.058a.5.5 0 0 1 .057.638l-.058.069l-3.535 3.536a.5.5 0 0 1-.638.057l-.07-.057l-3.535-3.536a.5.5 0 0 1 .638-.765l.069.058L7.5 10.292V1.5a.5.5 0 0 1 .41-.492L8 1l-.09.008Z"/></svg>',mic:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M5.5 4.5a2.5 2.5 0 0 1 5 0V8a2.5 2.5 0 0 1-5 0V4.5ZM8 3a1.5 1.5 0 0 0-1.5 1.5V8a1.5 1.5 0 1 0 3 0V4.5A1.5 1.5 0 0 0 8 3ZM4 7.5a.5.5 0 0 1 .5.5a3.5 3.5 0 1 0 7 0a.5.5 0 0 1 1 0a4.5 4.5 0 0 1-4 4.473V13.5a.5.5 0 0 1-1 0v-1.027A4.5 4.5 0 0 1 3.5 8a.5.5 0 0 1 .5-.5Z"/></svg>',pause:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h1.5A1.75 1.75 0 0 0 7 12.25v-8.5A1.75 1.75 0 0 0 5.25 2h-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h1.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-8.5ZM10.75 2A1.75 1.75 0 0 0 9 3.75v8.5c0 .966.784 1.75 1.75 1.75h1.5A1.75 1.75 0 0 0 14 12.25v-8.5A1.75 1.75 0 0 0 12.25 2h-1.5ZM10 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-8.5Z"/></svg>',play:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M5.745 3.064A.5.5 0 0 0 5 3.5v9a.5.5 0 0 0 .745.436l8-4.5a.5.5 0 0 0 0-.871l-8-4.5ZM4 3.5a1.5 1.5 0 0 1 2.235-1.307l8 4.5a1.5 1.5 0 0 1 0 2.615l-8 4.5A1.5 1.5 0 0 1 4 12.5v-9Z"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1V9.5A1.5 1.5 0 0 1 5.5 8h5A1.5 1.5 0 0 1 12 9.5V13a1 1 0 0 0 1-1V5.621a1 1 0 0 0-.293-.707l-1.621-1.621A1 1 0 0 0 10.379 3H10v1.5A1.5 1.5 0 0 1 8.5 6h-2A1.5 1.5 0 0 1 5 4.5V3H4Zm2 0v1.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V3H6Zm5 10V9.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V13h6ZM2 4a2 2 0 0 1 2-2h6.379a2 2 0 0 1 1.414.586l1.621 1.621A2 2 0 0 1 14 5.621V12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"/></svg>',stop:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M12.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h9Zm-9-1A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9Z"/></svg>',volume:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path d="M8.694 2.04A.5.5 0 0 1 9 2.5v11a.5.5 0 0 1-.85.357l-2.927-2.875H3.5a1.5 1.5 0 0 1-1.5-1.5v-2.99a1.5 1.5 0 0 1 1.5-1.5h1.724l2.927-2.85a.5.5 0 0 1 .543-.103zm3.043 1.02l.087.058l.098.085c.063.056.15.138.252.245c.206.213.476.527.746.938a6.542 6.542 0 0 1 1.083 3.618a6.522 6.522 0 0 1-1.083 3.614c-.27.41-.541.724-.746.936l-.142.141l-.187.17l-.033.026a.5.5 0 0 1-.688-.72l.13-.117a5.49 5.49 0 0 0 .83-.985c.46-.7.919-1.73.919-3.065a5.542 5.542 0 0 0-.919-3.069a5.588 5.588 0 0 0-.54-.698l-.17-.176l-.184-.17a.5.5 0 0 1 .547-.832zM8 3.684L5.776 5.851a.5.5 0 0 1-.349.142H3.5a.5.5 0 0 0-.5.5v2.989a.5.5 0 0 0 .5.5h1.927a.5.5 0 0 1 .35.143L8 12.308V3.685zm2.738 1.374l.1.07l.133.126l.054.056c.114.123.26.302.405.54c.292.48.574 1.193.574 2.148c0 .954-.282 1.668-.573 2.148a3.388 3.388 0 0 1-.405.541l-.102.105l-.07.065l-.04.033l-.063.03c-.133.052-.442.139-.64-.108a.5.5 0 0 1 .012-.638l.134-.129l.034-.036c.075-.08.179-.208.284-.382c.21-.345.429-.882.429-1.63c0-.747-.219-1.283-.428-1.627a2.467 2.467 0 0 0-.223-.311l-.095-.105l-.069-.065a.5.5 0 0 1 .55-.83z" fill="currentColor" fill-rule="nonzero"/></svg>',volumeMute:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M8.694 2.04A.5.5 0 0 1 9 2.5v11a.5.5 0 0 1-.85.357l-2.927-2.875H3.5a1.5 1.5 0 0 1-1.5-1.5v-2.99a1.5 1.5 0 0 1 1.5-1.5h1.724l2.927-2.85a.5.5 0 0 1 .543-.103ZM8 3.684L5.777 5.851a.5.5 0 0 1-.35.142H3.5a.5.5 0 0 0-.5.5v2.989a.5.5 0 0 0 .5.5h1.928a.5.5 0 0 1 .35.143L8 12.308V3.685Zm2.147 2.461a.5.5 0 0 1 .707 0l1.147 1.147l1.146-1.147a.5.5 0 1 1 .707.708L12.708 8l1.146 1.146a.5.5 0 1 1-.707.708L12 8.707l-1.147 1.147a.5.5 0 0 1-.707-.708L11.293 8l-1.146-1.146a.5.5 0 0 1 0-.708Z"/></svg>'}}},methods:{onClick(){this.$emit("click")}}},m={};var A=d(U,B,P,!1,T,null,null,null);function T(e){for(let t in m)this[t]=m[t]}var p=function(){return A.exports}(),L=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("button",{staticClass:"submit-button shadow-md",style:{"background-color":e.color},on:{click:e.clickButton}},[e._v(" Submit ")])},k=[],ge="";const F={emits:["submit"],props:{color:{type:String}},methods:{clickButton(){this.$emit("submit")}}},v={};var V=d(F,L,k,!1,I,null,null,null);function I(e){for(let t in v)this[t]=v[t]}var Z=function(){return V.exports}();function _(e,t){const s=t.getBoundingClientRect().width,r=e.target.getBoundingClientRect().left;let i=(e.clientX-r)/s;try{if(!e.target.className.match(/^ar\-line\-control/))return}catch{return}return i=i<0?0:i,i=i>1?1:i,i}var z=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{ref:e.refId,staticClass:"ar-line-control",on:{mousedown:e.onMouseDown}},[s("div",{staticClass:"ar-line-control__head",style:e.calculateSize})])},N=[],fe="";const O={props:{refId:{type:String},eventName:{type:String},percentage:{type:Number,default:0},rowDirection:{type:Boolean,default:!0}},computed:{calculateSize(){const e=this.percentage<1?this.percentage*100:this.percentage;return`${this.rowDirection?"width":"height"}: ${e}%`}},methods:{onMouseDown(e){const t=_(e,this.$refs[this.refId]);this.$emit("change-linehead",t),document.addEventListener("mousemove",this.onMouseMove),document.addEventListener("mouseup",this.onMouseUp)},onMouseUp(e){document.removeEventListener("mouseup",this.onMouseUp),document.removeEventListener("mousemove",this.onMouseMove);const t=_(e,this.$refs[this.refId]);this.$emit("change-linehead",t)},onMouseMove(e){const t=_(e,this.$refs[this.refId]);this.$emit("change-linehead",t)}}},g={};var W=d(O,z,N,!1,j,null,null,null);function j(e){for(let t in g)this[t]=g[t]}var f=function(){return W.exports}(),D=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"ar-volume"},[s("icon-button",{staticClass:"ar-volume__icon",attrs:{name:"volume"}}),s("line-control",{staticClass:"ar-volume-bar",attrs:{"ref-id":"volume",percentage:e.volume},on:{"change-linehead":e.onChangeLinehead}})],1)},H=[],ye="";const G={data(){return{volume:.8}},components:{IconButton:p,LineControl:f},methods:{onChangeLinehead(e){this.$emit("change-volume",e),this.volume=e}}},y={};var q=d(G,D,H,!1,X,null,null,null);function X(e){for(let t in y)this[t]=y[t]}var Y=function(){return q.exports}(),J=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",[s("div",{directives:[{name:"show",rawName:"v-show",value:e.custom,expression:"custom"}],staticClass:"ar-player"},[s("div",{staticClass:"ar-player-actions"},[s("icon-button",{staticClass:"ar-icon ar-icon__lg ar-player__play",class:{"ar-player__play--active":e.isPlaying,disabled:e.disablePlayButton},attrs:{id:"play",name:e.playBtnIcon},on:{click:e.playback}})],1),s("div",{staticClass:"ar-player-bar"},[s("div",{staticClass:"ar-player__time"},[e._v(e._s(e.playedTime))]),s("line-control",{staticClass:"ar-player__progress",attrs:{"ref-id":"progress",percentage:e.progress},on:{"change-linehead":e._onUpdateProgress}}),s("div",{staticClass:"ar-player__time"},[e._v(e._s(e.duration))]),s("volume-control",{class:{disabled:e.disablePlayButton},on:{"change-volume":e._onChangeVolume}})],1),s("audio",{attrs:{id:e.playerUniqId,src:e.audioSource,type:"audio/mpeg"}})]),s("div",{directives:[{name:"show",rawName:"v-show",value:!e.custom,expression:"!custom"}]},[s("figure",{staticClass:"recorder-player"},[s("audio",{staticClass:"mx-auto",attrs:{controls:"",src:e.audioSource,type:"audio/mpeg"}},[e._v(" Your browser does not support the "),s("code",[e._v("audio")]),e._v(" element. ")])])])])},K=[],we="";const Q={name:"PlayerWidget",components:{IconButton:p,LineControl:f,VolumeControl:Y},props:{src:{type:String},record:{type:Object},filename:{type:String},custom:{type:Boolean,default:!1}},data(){return{isPlaying:!1,duration:l(0),playedTime:l(0),progress:0}},mounted(){this.player=document.getElementById(this.playerUniqId);debugger;this.player&&(this.player.addEventListener("ended",()=>{this.isPlaying=!1}),this.player.addEventListener("loadeddata",e=>{this._resetProgress(),this.duration=l(this.player.duration)}),this.player.addEventListener("timeupdate",this._onTimeUpdate),this.$eventBus.$on("remove-record",()=>{this._resetProgress()}))},computed:{disablePlayButton(){return!!this.src},audioSource(){return!this.src&&this.record?this.record.url:this.src},playBtnIcon(){return this.isPlaying?"pause":"play"},playerUniqId(){return`audio-player${this._uid}`}},methods:{playback(){!this.audioSource||(this.isPlaying?this.player.pause():setTimeout(()=>{this.player.play()},0),this.isPlaying=!this.isPlaying)},_resetProgress(){this.isPlaying&&this.player.pause(),this.duration=l(0),this.playedTime=l(0),this.progress=0,this.isPlaying=!1},_onTimeUpdate(){this.playedTime=l(this.player.currentTime),this.progress=this.player.currentTime/this.player.duration*100},_onUpdateProgress(e){e&&(this.player.currentTime=e*this.player.duration)},_onChangeVolume(e){e&&(this.player.volume=e)}}},w={};var ee=d(Q,J,K,!1,te,null,null,null);function te(e){for(let t in w)this[t]=w[t]}var b=function(){return ee.exports}(),se=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"recorder-container"},[s("div",{staticClass:"recorder-action"},[s("icon-button",{attrs:{name:e.recording?"stop":"mic"},on:{click:function(r){return e.toggleRecording()}}}),s("span",{staticClass:"recorder-timer"},[e._v(e._s(e.recordedTime))])],1),s("div",{staticClass:"recorder-message"},[e.instructionMessage?s("span",{staticClass:"color-primary"},[e._v(" "+e._s(e.instructionMessage)+" ")]):e._e(),e.successMessage?s("span",{staticClass:"color-success"},[e._v(" "+e._s(e.successMessage)+" ")]):e._e(),e.errorMessage?s("span",{staticClass:"color-danger"},[e._v(" "+e._s(e.errorMessage)+" ")]):e._e()]),e.compact?e._e():s("player-widget",{attrs:{custom:e.customPlayer,src:e.recordedAudio,record:e.recordedBlob}}),s("submit-button",{attrs:{color:e.buttonColor},on:{submit:e.sendData}})],1)},ie=[],be="";const S="Click icon to start recording message.",re="Click icon again to stop recording.",ae="Failed to use microphone. Please refresh and try again and permit the use of a microphone.",ne="Successfully recorded message!",oe="Successfully submitted audio message! Thank you!",le="Error submitting audio message! Please try again later.",ce={name:"RecorderWidget",components:{IconButton:p,SubmitButton:Z,PlayerWidget:b},props:{time:{type:Number,default:1},bitRate:{type:Number,default:128},sampleRate:{type:Number,default:44100},backendEndpoint:{type:String},buttonColor:{type:String,default:"green"},compact:{type:Boolean,default:!1},customPlayer:{type:Boolean,default:!1},afterRecording:{type:Function},successfulUpload:{type:Function},failedUpload:{type:Function},customUpload:{type:Function,default:null}},data(){return{recording:!1,recordedAudio:null,recordedBlob:null,recorder:null,successMessage:null,errorMessage:null,instructionMessage:S}},computed:{recordedTime(){var e,t;return this.time&&((e=this.recorder)==null?void 0:e.duration)>=this.time*60&&this.toggleRecording(),l((t=this.recorder)==null?void 0:t.duration)}},beforeUnmount(){this.recording&&this.stopRecorder()},methods:{toggleRecording(){this.recording=!this.recording,this.recording?this.initRecorder():this.stopRecording()},initRecorder(){this.recorder=new x({micFailed:this.micFailed,bitRate:this.bitRate,sampleRate:this.sampleRate}),this.recorder.start(),this.successMessage=null,this.errorMessage=null,this.instructionMessage=re,this.service=new h(this.backendEndpoint)},stopRecording(){this.recorder.stop();const e=this.recorder.recordList();this.recordedAudio=e[0].url,this.recordedBlob=e[0].blob,this.recordedAudio&&(this.successMessage=ne,this.instructionMessage=null),this.afterRecording&&this.afterRecording()},async sendData(){if(!this.recordedBlob)return;let e=null;this.customUpload?e=await this.customUpload(this.recordedBlob):e=await this.service.postBackend(this.recordedBlob),e?(this.errorMessage=null,this.successMessage=oe,this.successfulUpload&&this.successfulUpload()):(this.successMessage=null,this.errorMessage=le,this.failedUpload&&this.failedUpload())},micFailed(){this.recording=!1,this.instructionMessage=S,this.errorMessage=ae}}},M={};var ue=d(ce,se,ie,!1,de,null,null,null);function de(e){for(let t in M)this[t]=M[t]}var he=function(){return ue.exports}();u.PlayerWidget=b,u.RecorderWidget=he,Object.defineProperties(u,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});