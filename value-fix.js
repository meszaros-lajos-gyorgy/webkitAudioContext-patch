/*
 Fix for AudioParam.value | WebkitAudioContext-patch v1.2.0
 https://github.com/meszaros-lajos-gyorgy/webkitAudioContext-patch
 License: MIT
*/
(function(){
	'use strict';
	
	function getLinearRampToValueAtTime(t, v0, v1, t0, t1){
		if(t <= t0) return v0;
		if(t1 <= t) return v1;
		
		var a = (t - t0) / (t1 - t0);
		
		return v0 + a * (v1 - v0);
	}
	
	function getExponentialRampToValueAtTime(t, v0, v1, t0, t1){
		if(t <= t0) return v0;
		if(t1 <= t) return v1;
		if(v0 === v1) return v0;
		
		var a = (t - t0) / (t1 - t0);
		
		return (
			(0 < v0 && 0 < v1) || (v0 < 0 && v1 < 0)
			? v0 * Math.pow(v1 / v0, a)
			: 0
		);
	}
	
	function getTargetValueAtTime(t, v0, v1, t0, timeConstant){
		return (
			t <= t0
			? v0
			: v1 + (v0 - v1) * Math.exp((t0 - t) / timeConstant)
		);
	}
	
	function getValueCurveAtTime(t, curve, t0, duration){
		if(curve.length === 0) return 0;
		
		var x = (t - t0) / duration;
		var ix = x * (curve.length - 1);
		var i0 = ix | 0;
		var i1 = i0 + 1;
		
		if(curve.length <= i1) return curve[curve.length - 1];
		
		var y0 = curve[i0];
		var y1 = curve[i1];
		var a = ix % 1;
		
		return y0 + a * (y1 - y0);
	}
	
	function find_index(values, target, compareFn){
		if(values.length == 0 || compareFn(target, values[0]) < 0){
			return [undefined, 0];
		}
		if(compareFn(target, values[values.length-1]) > 0 ){
			return [values.length-1, undefined];
		}
		return modified_binary_search(values, 0, values.length - 1, target, compareFn);
	}
	
	function modified_binary_search(values, start, end, target, compareFn){
		if(start > end) return [end, undefined];
		
		var middle = Math.floor((start + end) / 2);
		var middleValue = values[middle];
		
		if(compareFn(middleValue, target) < 0 && values[middle+1] && compareFn(values[middle+1], target) > 0){
			return [middle, middle + 1];
		}else if(compareFn(middleValue, target) > 0){
			return modified_binary_search(values, start, middle - 1, target, compareFn);
		}else if (compareFn(middleValue, target) < 0){
			return modified_binary_search(values, middle + 1, end, target, compareFn);
		}else{
			return [middle];
		}
	}
	
	// ------------
	
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
	
	if(firefoxVersion !== false){
		AudioParam.prototype._events = [];
		AudioParam.prototype._ctx = null;

		var oldSetValueAtTime = AudioParam.prototype.setValueAtTime;
		AudioParam.prototype.setValueAtTime = function(value, time){
			var args = Array.from(arguments);
			if(this._ctx !== null){
				this._insertEvent({
					type: 'setValueAtTime',
					time: time,
					value: value,
					args: args
				});
			}
			return oldSetValueAtTime.apply(this, args);
		};

		var oldLinearRampToValueAtTime = AudioParam.prototype.linearRampToValueAtTime;
		AudioParam.prototype.linearRampToValueAtTime = function(value, time){
			var args = Array.from(arguments);
			if(this._ctx !== null){
				this._insertEvent({
					type: 'linearRampToValueAtTime',
					time: time,
					value: value,
					args: args
				});
			}
			return oldLinearRampToValueAtTime.apply(this, args);
		};

		var oldExponentialRampToValueAtTime = AudioParam.prototype.exponentialRampToValueAtTime;
		AudioParam.prototype.exponentialRampToValueAtTime = function(value, time){
			var args = Array.from(arguments);
			if(this._ctx !== null){
				this._insertEvent({
					type: 'exponentialRampToValueAtTime',
					time: time,
					value: value,
					args: args
				});
			}
			return oldExponentialRampToValueAtTime.apply(this, args);
		};

		var oldSetTargetAtTime = AudioParam.prototype.setTargetAtTime;
		AudioParam.prototype.setTargetAtTime = function(value, time, timeConstant){
			var args = Array.from(arguments);
			if(this._ctx !== null){
				this._insertEvent({
					type: 'setTargetAtTime',
					time: time,
					value: value,
					timeConstant: timeConstant,
					args: args
				});
			}
			return oldSetTargetAtTime.apply(this, args);
		};

		var oldSetValueCurveAtTime = AudioParam.prototype.setValueCurveAtTime;
		AudioParam.prototype.setValueCurveAtTime = function(curve, time, duration){
			var args = Array.from(arguments);
			if(this._ctx !== null){
				this._insertEvent({
					type: 'setValueCurveAtTime',
					time: time,
					curve: curve,
					duration: duration,
					args: args
				});
			}
			return oldSetValueCurveAtTime.apply(this, args);
		};

		var oldCancelScheduledValues = AudioParam.prototype.cancelScheduledValues;
		AudioParam.prototype.cancelScheduledValues = function(time){
			if(this._ctx !== null){
				this._events = this._events.filter(function(eventItem){
					return eventItem.time < time;
				});
			}
			return oldCancelScheduledValues.apply(this, Array.from(arguments));
		};

		AudioParam.prototype._insertEvent = function(eventItem){
			var time = eventItem.time;
			var events = this._events = JSON.parse(JSON.stringify(this._events));
			var replace = 0;
			var i, imax;
			
			if(events.length === 0 || events[events.length - 1].time < time){
				events.push(eventItem);
			}else{
				for(i = 0, imax = events.length; i < imax; i++){
					if(events[i].time === time && events[i].type === eventItem.type){
						replace = 1;
						break;
					}
					if(time < events[i].time){
						break;
					}
				}
				events.splice(i, replace, eventItem);
			}
		};

		AudioParam.prototype._getValueAtTime = function(time){
			var events = this._events;
			var value = this.defaultValue;
			var i, imax;
			var e0, e1, t0;
			
			// TODO: initialize 'target' and 'compareFn' in the constructor to avoid the garbage collector.
			var idx = find_index(events, { time: time }, function(a, b) { return a.time - b.time; });
			var pIdx = idx[0];
			var nIdx = idx[1];
			
			if(idx.length === 1 || pIdx !== undefined){
				i = pIdx;
			}else if(nIdx !== undefined){
				i = nIdx;
			}

			for(i = Math.max(0, i-1), imax = events.length; i < imax; i++){
				e0 = events[i];
				e1 = events[i + 1];
				t0 = Math.min(time, e1 ? e1.time : time);
				
				if (time < e0.time) {
					break;
				}
				
				switch (e0.type) {
					case 'setValueAtTime':
					case 'linearRampToValueAtTime':
					case 'exponentialRampToValueAtTime':
						value = e0.value;
						break;
					case 'setTargetAtTime':
						value = getTargetValueAtTime(t0, value, e0.value, e0.time, e0.timeConstant);
						break;
					case 'setValueCurveAtTime':
						value = getValueCurveAtTime(t0, e0.curve, e0.time, e0.duration);
						break;
				}
				
				if (e1) {
					switch (e1.type) {
						case 'linearRampToValueAtTime':
							value = getLinearRampToValueAtTime(t0, value, e1.value, e0.time, e1.time);
							break;
						case 'exponentialRampToValueAtTime':
							value = getExponentialRampToValueAtTime(t0, value, e1.value, e0.time, e1.time);
							break;
					}
				}
			}

			return value;
		};
		
		var descriptor = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value');
		
		var oldSet = descriptor.set;
		descriptor.set = function(value){
			console.log('set');
			if(this._ctx === null){
				oldSet.apply(this, Array.from(arguments));
			}else{
				this.setValueAtTime(value, this._ctx.currentTime);
			}
		};
		
		var oldGet = descriptor.get;
		descriptor.get = function(){
			return (
				this._ctx === null
				? oldGet.apply(this, Array.from(arguments))
				: this._getValueAtTime(this._ctx.currentTime)
			);
		};
		
		Object.defineProperty(AudioParam.prototype, 'value', descriptor);
	}
})();
