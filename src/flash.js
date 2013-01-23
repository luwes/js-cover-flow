(function(C) {

	C.flash = function(api) {

		var swf;

		function setup() {

			var html = '<object id="' + api.id + '-coverflow-flash" data="' + api.config.flash + '" width="100%" height="100%" type="application/x-shockwave-flash">' +
				'<param name="movie" value="' + api.config.flash + '" />' +
				'<param name="wmode" value="' + api.config.wmode + '" />' +
				'<param name="allowscriptaccess" value="always" />' +
				'<param name="flashvars" value="' + jsonToFlashvars(api.config) + '" />' +
				'<a href="http://get.adobe.com/flashplayer/">Get Adobe Flash player</a>' +
			'</object>';
			api.container.innerHTML = html;
			
			swf = document.getElementById(api.id + '-coverflow-flash');
		}

		function jsonToFlashvars(json) {
			var flashvars = "";
			for (var key in json) {
				if (typeof(json[key]) === "object") {
					flashvars += key + "=" + encodeURIComponent("[[JSON]]"+JSON.stringify(json[key])) + "&";
				} else {
					flashvars += key + "=" + encodeURIComponent(json[key]) + "&";
				}
			}
			return flashvars.slice(0, -1);
		}

		this.resize = function(wid, hei) {
			swf.apiResize(wid, hei);
		};

		this.left = function() {
			swf.apiLeft();
		};
		this.right = function() {
			swf.apiRight();
		};
		this.prev = function() {
			swf.apiPrev();
		};
		this.next = function() {
			swf.apiNext();
		};
		this.to = function(index) {
			swf.apiTo(index);
		};
		this.fadeIn = function(callback) {
			api.events.fadeIn.off().on(callback);
			swf.apiFadeIn();
		};
		this.fadeOut = function(callback) {
			api.events.fadeOut.off().on(callback);
			swf.apiFadeOut();
		};

		setup();
	};

})(coverflow);
