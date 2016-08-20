/*
 WebkitAudioContext-patch
 https://github.com/meszaros-lajos-gyorgy/webkitAudioContext-patch
 License: MIT
*/
(function(){
	'use strict';
	
	var firefoxVersion = false;
	try{
		firefoxVersion = navigator.userAgent
			.match(/Firefox\/([\d.]+)/)[1]
			.split('.')
			.map(function(val){
				return parseInt(val)
			})
		;
	}catch(e){}
	
	if(!window.hasOwnProperty('AudioContext') && window.hasOwnProperty('webkitAudioContext')){
		var a = window.AudioContext = window.webkitAudioContext;
		
		if(!a.prototype.hasOwnProperty('createGain')){
			a.prototype.createGain = a.prototype.createGainNode;
		}
		
		if(!OscillatorNode.prototype.hasOwnProperty('start')){
			OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
		}
		
		if(!OscillatorNode.prototype.hasOwnProperty('stop')){
			OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;
		}
		
		Object.defineProperty(OscillatorNode.prototype, 'type', {
			get : function(){
				return ['sine', 'square', 'sawtooth', 'triangle', 'custom'][this.type];
			},
			set : function(type){
				this.type = OscillatorNode.prototype[type.toUpperCase()];
			}
		});
	}
	
	if(firefoxVersion !== false){
		if(firefoxVersion[0] < 30){
			// make the first parameter optional for firefox <30
			var oldStart = OscillatorNode.prototype.start;
			OscillatorNode.prototype.start = function(t){
				oldStart(t || 0);
			};
			
			var oldStop = OscillatorNode.prototype.stop;
			OscillatorNode.prototype.stop = function(t){
				oldStop(t || 0);
			};
		}
	}
})();
