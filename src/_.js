
var idCounter = 0;

var _ = {

	hasFlash: ((typeof navigator.plugins != 'undefined' &&
		typeof navigator.plugins['Shockwave Flash'] == 'object') ||
		(window.ActiveXObject && (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) !== false)),

	isIE: !!navigator.userAgent.match(/msie/i) ||
		!!navigator.userAgent.match(/Trident\/7\./),

	uniqueId: function(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id;
	},

	bind: function(fn, context) {
		return function() { fn.apply(context); };
	},

	on: function(el, type, fn) {
		if (!el) return;
		var arr = type.split(' ');
		for (var i = 0; i < arr.length; i++) {
			if (el.attachEvent) {
				el.attachEvent('on' + arr[i], fn);
			} else {
				el.addEventListener(arr[i], fn, false);
			}
		}
	},

	off: function(el, type, fn) {
		if (!el) return;
		var arr = type.split(' ');
		for (var i = 0; i < arr.length; i++) {
			if (el.detachEvent) {
				el.detachEvent('on' + arr[i], fn);
			} else {
				el.removeEventListener(arr[i], fn, false);
			}
		}
	},

	extend: function(src, dest) {
		for (var key in dest) {
			src[key] = dest[key];
		}
		return src;
	},

	addClass: function(el, classname) {
		if (el.className.indexOf(classname) === -1) {
			el.className += ' ' + classname;
		}
	},

	css: function(el, props) {
		if (el) {
			for (var key in props) {
				if (typeof props[key] === 'undefined') {
					continue;
				} else if (typeof props[key] == 'number' && !(key == 'zIndex' || key == 'opacity')) {
					if (isNaN(props[key])) {
						continue;
					}
					props[key] = Math.ceil(props[key]) + 'px';
				}
				try {
					el.style[key] = props[key];
				} catch (e) {}
			}
		}
	},

	hexToRgb: function(hex) {
		// Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
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
	},

	ajax: function(xmldocpath, completecallback, errorcallback) {
		var xmlhttp;
		if (window.XMLHttpRequest) {
			// IE>7, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {
			// IE6
			xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
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
			xmlhttp.open('GET', xmldocpath, true);
			xmlhttp.send(null);
		} catch (error) {
			if (errorcallback) {
				errorcallback(xmldocpath);
			}
		}
		return xmlhttp;
	},

	jsonp: function(url, callback, params) {
		
		var query = url.indexOf('?') === -1 ? '?' : '&';
		params = params || {};
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				query += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
			}
		}
		
		var jsonp = _.uniqueId('json_call');
		window[jsonp] = function(data) {
			callback(data);
			window[jsonp] = null;
		};
 
		var script = document.createElement('script');
		if (url.indexOf('callback=?') !== -1) {
			script.src = url.replace('callback=?', 'callback='+jsonp) + query.slice(0, -1);
		} else {
			script.src = url + query + 'callback=' + jsonp;
		}
		script.async = true;
		script.onload = script.onreadystatechange = function() {
			if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
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
	},

	getResizeDimensions: function(wid, hei, maxWid, maxHei) {

		var ratio = Math.min(maxWid / wid, maxHei / hei);
		return { width: wid*ratio, height: hei*ratio, ratio: ratio };
	},

	getCropOffsets: function(wid, hei, newWid, newHei) {

		var ratio = [newWid / wid, newHei / hei];
		return ratio[0] < ratio[1] ?
			{ left: (wid - newWid / ratio[1]) * 0.5, top: 0, ratio: ratio[1] } :
			{ top: (hei - newHei / ratio[0]) * 0.5, left: 0, ratio: ratio[0] } ;
	},

	getChildIndex: function(node) {
		var i = 0;
		while ((node = node.previousSibling) !== null) {
			if (node.nodeType === 1) ++i;
		}
		return i;
	}
};
