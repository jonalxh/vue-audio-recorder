<style lang="scss">
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

<template>
	<div class="row">
		<button type="button" class="toggle" @click="toggle">Toggle recorder/player</button>
		<br />

		<form v-if="showRecorder">
			<input type="checkbox" v-model="countdown" /> Enable countdown <br />
			<br />
			<label for="limit-input">Time limit in seconds</label>
			<br />
			<input type="number" v-model="limit" id="limit" />
			<br />
			<br />
			<label for="attempts-input">Attempts limit</label>
			<br />
			<input type="number" v-model="attempts" />
			<br /><br />
		</form>

		<table width="100%" v-if="showRecorder">
			<tr>
				<td>
          Default mode:
					<audio-recorder upload-url="some url" filename="ninja" format="wav" :attempts="attempts" :time="limit" :headers="headers" :before-recording="callback" :pause-recording="callback" :after-recording="callback" :select-record="callback" :before-upload="callback" :successful-upload="callback" :failed-upload="callback" :bit-rate="192" :mic-failed="showMicError" :countdown="countdown" mode="default" />
				</td>
				<td>
          Minimal mode:
					<audio-recorder :time="limit" :before-recording="callback" :pause-recording="callback" :after-recording="callback" :select-record="callback" :before-upload="callback" :successful-upload="callback" :failed-upload="callback" :bit-rate="192" :mic-failed="showMicError" :countdown="countdown" mode="minimal" />
				</td>
			</tr>
		</table>

		<audio-player :src="mp3" v-if="!showRecorder" />
	</div>
</template>

<script>
export default {
	name: "app",
	data() {
		return {
			attempts: 3,
			countdown: false,
			limit: 20,
			mp3: "/demo/example.mp3",
			showRecorder: true,
			headers: {
				"X-Custom-Header": "some data",
			},
		};
	},
	methods: {
		callback(msg) {
			console.debug("Event: ", msg);
		},
		toggle() {
			this.showRecorder = !this.showRecorder;
		},
		showMicError(evt) {
			alert(evt);
		},
	},
};
</script>
