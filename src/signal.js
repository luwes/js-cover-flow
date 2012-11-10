(function(C) {
	
	C.Signal = function() {
		var callbacks = [];

		this.on = function(func) {
			callbacks.push(func);
		};

		this.trigger = function() {
			var args = Array.prototype.slice.call(arguments);
			for (var i = 0; i < callbacks.length; i++) {
				if (typeof callbacks[i] === "function") {
					callbacks[i].apply(this, args);
				}
			}
		};

		this.off = function(func) {
			if (func) {
				for (var i = 0; i < callbacks.length; i++) {
					if (callbacks[i] === func) {
						callbacks.splice(i, 1);
						i--;
					}
				}
			} else {
				callbacks = [];
			}
		};
	};
	
})(coverflow);
