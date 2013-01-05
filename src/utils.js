(function(C) {
	
	C.Utils = function() {
	};

	C.Utils.hasFlash = ((typeof navigator.plugins != "undefined" &&
		typeof navigator.plugins["Shockwave Flash"] == "object") ||
		(window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) !== false));

	C.Utils.isIE = navigator.userAgent.match(/msie/i) !== null;

	C.Utils.ajax = function(xmldocpath, completecallback, errorcallback) {
		var xmlhttp;
		if (window.XMLHttpRequest) {
			// IE>7, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {
			// IE6
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				if (xmlhttp.status === 200) {
					if (completecallback) {
						completecallback(xmlhttp);
					}
				} else {
					if (errorcallback) {
						errorcallback(xmldocpath);
					}
				}
			}
		};
		try {
			xmlhttp.open("GET", xmldocpath, true);
			xmlhttp.send(null);
		} catch (error) {
			if (errorcallback) {
				errorcallback(xmldocpath);
			}
		}
		return xmlhttp;
	};
	
	C.Utils.jsonp = function(url, callback, params) {
			
		var query = url.indexOf('?') === -1 ? "?" : "&";
		params = params || {};
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
			}
		}
		
		var jsonp = C.Utils.uniqueId("json_call");
		window[jsonp] = function(data) {
			callback(data);
			window[jsonp] = null;
		};
 
		var script = document.createElement('script');
		if (url.indexOf('callback=?') !== -1) {
			script.src = url.replace('callback=?', 'callback='+jsonp) + query.slice(0, -1);
		} else {
			script.src = url + query + "callback=" + jsonp;
		}
		script.async = true;
		script.onload = script.onreadystatechange = function() {
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
				script.onload = script.onreadystatechange = null;
				if (script && script.parentNode) {
					script.parentNode.removeChild(script);
				}
			}
		};
		
		var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
		// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
		// This arises when a base node is used (#2709 and #4378).
		head.insertBefore(script, head.firstChild);
	};
	
	C.Utils.extend = function(destination, source) {
		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	};

	var idCounter = 0;
	C.Utils.uniqueId = function(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id;
	};
	
	C.Utils.css = function(element, props) {
		if (element) {
			for (var key in props) {
				if (typeof props[key] === "undefined") {
					continue;
				} else if (typeof props[key] == "number" && !(key == "zIndex" || key == "opacity")) {
					if (isNaN(props[key])) {
						continue;
					}
					props[key] = Math.ceil(props[key]) + "px";
				}
				try {
					element.style[key] = props[key];
				} catch (e) {}
			}
		}
	};

	C.Utils.addClass = function(element, classname) {
		if (element.className.indexOf(classname) === -1) {
			element.className += " " + classname;
		}
	};

	C.Utils.hexToRgb = function(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	};
	
})(coverflow);


if (!Array.indexOf) {
	Array.prototype.indexOf = function(obj) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	};
}
