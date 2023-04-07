# vue-audio-recorder

> New version of audio recorder for Vue.js with vite.
> It allows to record, play, download and store records on a server. It is based on vue-audio-recorder which is not longer being supported by the original author (grishkovelli).

## Default mode

![](https://raw.githubusercontent.com/rhosseinr/vue-audio-recorder/master/screenshot.png)

## Minimal mode

![](https://raw.githubusercontent.com/rhosseinr/vue-audio-recorder/master/minimal.png)

### Features

- Beautiful clean UI
- Time limit
- Records limit
- Individual an audio player
- MP3/WAV support

### Tested in (desktop)

- Edge
- Chrome
- Firefox
- Safari

## Installation

```
npm i vuejs2-audio-recorder --save
```

## AudioRecorder props

| Prop                  | Type     | Description                                                                        |
| --------------------- | -------- | ---------------------------------------------------------------------------------- |
| attempts              | Number   | Number of recording attempts                                                       |
| time                  | Number   | Time limit for the record (minutes)                                                |
| bit-rate              | Number   | Default: 128 (only for MP3)                                                        |
| sample-rate           | Number   | Default: 44100                                                                     |
| filename              | String   | Download/Upload filename                                                           |
| format                | String   | WAV/MP3. Default: mp3                                                              |
| show-download-button  | Boolean  | If it is true show a download button. Default: true                                |
| show-upload-button    | Boolean  | If it is true show an upload button. Default: true                                 |
| after-recording       | Function | Callback fires after click the stop button or exceeding the time limit             |
| select-record-changed | Function | Callback fires after choise a record. Returns the record                           |
| compact               | Boolean  | A minimal interface to record just one audio and play it.                          |
| countdown             | Boolean  | Will show the time remaining instead of current recorded time. Default: false      |
| customPlayer          | Boolean  | show custom player style. Default: false                                           |
| countdownTitle        | String   | Title over time remaining when countdown is set to true. Default: "Time Remaining" |

## AudioPlayer props

| Prop         | Type    | Description                              |
| ------------ | ------- | ---------------------------------------- |
| src          | String  | Specifies the URL of the audio file      |
| customPlayer | Boolean | show custom player style. Default: false |

## CSS Variable

| variable      | Description   |
| ------------- | ------------- |
| primary-color | Primary color |
| danger-color  | Error color   |
| border-color  | Border color  |

## Usage

```js
import RecorderWidget from "vuejs2-audio-recorder";
import PlayerWidget from "vuejs2-audio-recorder";
```

```html
<recorder-widget
  :attempts="3"
  :time="2"
  :afterRecording="afterRec"
  :backendEndpoint="backendEndpoint"
  :customUpload="customUp"
  :customPlayer="customPlayer"
  :countdown="countdown"
  :attempts="attempts"
  compact
/>
```

```html
<player-widget src="/demo/example.mp3" />
```

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification (must be built with node v12.x)
npm run build
```

## PUBLISH TO NPM

```
npm publish --access public
```

## Authors

[Gennady Grishkovtsov](https://www.linkedin.com/in/grishkovtsov/) - Developer

[Olga Zimina](https://www.behance.net/zimin4ik) - UIX Designer

## Contributors

[Jonathan Arias](https://github.com/jonalxh) - Developer

[Hossein Rahimi](https://github.com/rhosseinr) - Developer

## TNX

[Thomas Derflinger](https://github.com/tderflinger/vue-audio-tapir) - Recorder for Vue3
