(function(C) {

	C.html5 = function(api) {
		var _this = this;

		var div = api.container;
		var config = api.config;
		var playlist;
		var coverFlow;
		var textField;

		var rotateInterval;

		function setup() {
			
			var styleElement = document.createElement('style');
			styleElement.type = "text/css";
			document.getElementsByTagName('head')[0].appendChild(styleElement);
			styleElement.appendChild(document.createTextNode(config.textstyle));

			config.backgroundcolor = config.backgroundcolor.indexOf('#') == -1 ? "#" + config.backgroundcolor : config.backgroundcolor;
			div.style.backgroundColor = config.backgroundcolor;
			if (config.gradientcolor !== undefined) {
				config.gradientcolor = config.gradientcolor.indexOf('#') == -1 ? "#" + config.gradientcolor : config.gradientcolor;
				div.style.background = '-webkit-gradient(linear, left top, left bottom, from('+config.gradientcolor+'), to('+config.backgroundcolor+'))';
			}

			api.trigger('ready');
			
			api.events.playlist.on(playlistLoaded);
			var loader = new C.PlaylistLoader(api);
			loader.load(api.config.playlist);
		}

		function playlistLoaded(p) {
			playlist = p;
			
			config.coverheight = config.coverheight == "auto" ? config.height : config.coverheight;
			
			if (coverFlow) coverFlow.destroy();
			coverFlow = new C.CoverFlow(div, playlist, config);
			div.appendChild(coverFlow.domElement);

			if (textField) div.removeChild(textField);
			if (config.showtext === true) {
				textField = document.createElement("div");
				C.Utils.addClass(textField, "coverflow-text");
				div.appendChild(textField);
			}

			coverFlow.onFocus(coverFocus);
			coverFlow.onClick(coverClick);

			_this.resize(config.width, config.height);

			if (config.rotatedelay > 0) {
				if (rotateInterval) _this.stopRotation();
				rotateInterval = setInterval(rotateHandler, config.rotatedelay);
				div.addEventListener('touchstart', _this.stopRotation, false);
				div.addEventListener('mousedown', _this.stopRotation, false);
			}

			div.addEventListener('mousewheel', scrollOnMousewheel);
			div.addEventListener('DOMMouseScroll', scrollOnMousewheel);
		}

		function scrollOnMousewheel(e) {
			e.preventDefault();
			
			var delta = e.detail ? e.detail * (-120) : e.wheelDelta;
			var count = Math.ceil(Math.abs(delta) / 120);
			if (count > 0) {
				var sign = Math.abs(delta) / delta;
				var func = null;
				if (sign > 0) func = _this.left;
				else if (sign < 0) func = _this.right;
				if (typeof func === "function") {
					for (var i = 0; i < count; i++) func();
				}
			}
		}

		function coverFocus(index) {
			if (config.showtext === true) {
				var d = playlist[index];
				if (d) {
					textField.innerHTML = "<h1>" + (d.title === undefined ? "" : d.title) + "</h1><h2>" + (d.description === undefined ? "" : d.description) + "</h2>";
				}
			}

			api.trigger('focus', index, playlist[index] ? playlist[index].link : undefined);
		}

		function coverClick(index) {
			if (config.rotatedelay > 0 && rotateInterval) { _this.stopRotation(); }
			
			api.trigger('click', index, playlist[index] ? playlist[index].link : undefined);
		}

		this.stopRotation = function() {
			div.removeEventListener('touchstart', _this.stopRotation, false);
			div.removeEventListener('mousedown', _this.stopRotation, false);
			clearInterval(rotateInterval);
		};
			
		function rotateHandler() {
			coverFlow.next();
		}

		this.resize = function(wid, hei) {

			if (coverFlow) {
				coverFlow.resize(wid, hei);
			}

			if (textField) {
				textField.style.top = (hei - config.textoffset) + "px";
			}
		};

		this.left = function() {
			coverFlow.left();
		};
		this.right = function() {
			coverFlow.right();
		};
		this.prev = function() {
			coverFlow.prev();
		};
		this.next = function() {
			coverFlow.next();
		};
		this.to = function(index) {
			coverFlow.to(index);
		};

		setup();
	};

})(coverflow);
