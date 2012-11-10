(function(C) {

	C.flash = function(api) {

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

		var html = '<object id="coverflow-flash" data="' + api.config.flash + '" width="100%" height="100%" type="application/x-shockwave-flash">' +
			'<param name="movie" value="' + api.config.flash + '" />' +
			'<param name="bgcolor" value="#' + api.config.backgroundcolor + '" />' +
			'<param name="allowscriptaccess" value="always" />' +
			'<param name="flashvars" value="' + jsonToFlashvars(api.config) + '" />' +
			'<a href="http://get.adobe.com/flashplayer/">Get Adobe Flash player</a>' +
		'</object>';
		api.container.innerHTML = html;
		var swf = document.getElementById('coverflow-flash');


		this.resize = function() {
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
	};

})(coverflow);
