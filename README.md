# webkitAudioContext-patch

A transparent, polyfill-like code, which upgrades the old webkit implementation of the Audio API to the newer, standard based one.

## Contents of the js files and the fixes in them

### polyfill.js

Includes a polyfill to `Array.from()` method, which is defined in ES6. `Array.from()` is needed for `audio-param-value-patch.js`

### webkit-audio-context-patch.js

Fixes the following from the old API:

* aliased `webkitAudioContext` to `AudioContext`
* aliased `webkitAudioContext.createGainNode()` to `AudioContext.createGain()`
* aliased `OscillatorNode.noteOn()` to `OscillatorNode.start()`
* aliased `OscillatorNode.noteOff()` to `OscillatorNode.stop()`
* aliased `OscillatorNode.type` values from `SINE`, `SQUARE`, `SAWTOOTH`, `TRIANGLE` and `CUSTOM` to their lowercase versions
* fixed first parameter not optional of `OscillatorNode.start()` and `OscillatorNode.stop()` in Firefox under version lesser, than 30

### audio-param-value-patch.js

This is needed for Firefox as a substitute to `AudioParam.value` getter, since it is always returns the defaultValue (https://bugzilla.mozilla.org/show_bug.cgi?id=893020)

**This is based on mohayonao's pseudo-audio-param code, credits should go to him (link can be found in the list of resources)**

The following parameters are patched, but drop a message for me and I will add more:

**OscillatorNode**

	* frequency
	* detune

**GainNode**
	
	* gain

## Links / Resources:

* https://github.com/cwilso/webkitAudioContext-MonkeyPatch
* https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
* https://github.com/mohayonao/pseudo-audio-param
