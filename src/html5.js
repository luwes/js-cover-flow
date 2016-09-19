
var Html5 = function(api) {

	var _this = this;

	var div = api.el;
	var config = api.config;
	var playlist;
	var coverFlow;
	var textField;

	var rotateInterval;

	function setup() {
		
		var styleElement = document.createElement('style');
		styleElement.type = 'text/css';
		document.getElementsByTagName('head')[0].appendChild(styleElement);
		styleElement.appendChild(document.createTextNode(config.textstyle));

		var rgb = _.hexToRgb(config.backgroundcolor);
		config.backgroundcolor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + config.backgroundopacity + ')';
		div.style.backgroundColor = config.backgroundcolor;

		if (config.gradientcolor !== undefined) {
			rgb = _.hexToRgb(config.gradientcolor);
			config.gradientcolor = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + config.backgroundopacity + ')';
			div.style.background = '-webkit-gradient(linear, left top, left bottom, from(' + config.gradientcolor + '), to(' + config.backgroundcolor + '))';
		}

		api.trigger('ready');
		
		api.events.playlist.on(playlistLoaded);
		var loader = new PlaylistLoader(api);
		loader.load(api.config.playlist);
	}

	function playlistLoaded(p) {
		playlist = p;

		if (config.rotatedelay > 0) {
			//must be before coverFlow is created, event order
			div.addEventListener('touchstart', _this.stopRotation, true);
			div.addEventListener('mousedown', _this.stopRotation, true);
			div.addEventListener('keydown', _this.stopRotation, true);
		}
		
		config.coverheight = config.coverheight == 'auto' ? config.height : config.coverheight;
		
		if (coverFlow) coverFlow.destroy();
		coverFlow = new CoverFlow(div, playlist, config);
		div.appendChild(coverFlow.el);

		if (textField) div.removeChild(textField);
		if (config.showtext === true) {
			textField = document.createElement('div');
			_.addClass(textField, 'coverflow-text');
			div.appendChild(textField);
		}

		coverFlow.on('focus', coverFocus);
		coverFlow.on('click', coverClick);
		coverFlow.to(config.item);

		_this.resize(config.width, config.height);

		if (config.rotatedelay > 0) {
			_this.stopRotation();
			rotateInterval = setInterval(rotateHandler, config.rotatedelay);
		}

		if (config.mousewheel) {
			div.addEventListener('mousewheel', scrollOnMousewheel);
			div.addEventListener('DOMMouseScroll', scrollOnMousewheel);
		}
	}

	function scrollOnMousewheel(e) {
		e.preventDefault();

		_this.stopRotation();
		
		var delta = e.detail ? e.detail * (-120) : e.wheelDelta;
		var count = Math.ceil(Math.abs(delta) / 120);
		if (count > 0) {
			var sign = Math.abs(delta) / delta;
			var func = null;
			if (sign > 0) func = _this.left;
			else if (sign < 0) func = _this.right;
			if (typeof func === 'function') {
				for (var i = 0; i < count; i++) func();
			}
		}
	}

	function coverFocus(index) {
		if (config.showtext === true) {
			var d = playlist[index];
			if (d) {
				textField.innerHTML = '<h1>' + (d.title === undefined ? '' : d.title) + 
				'</h1><h2>' + (d.description === undefined ? '' : d.description) + '</h2>';
			}
		}

		api.trigger('focus', index, playlist[index] ? playlist[index].link : undefined);
	}

	function coverClick(index) {
		_this.stopRotation();
		
		api.trigger('click', index, playlist[index] ? playlist[index].link : undefined);
	}

	this.stopRotation = function() {
		if (rotateInterval) {
			div.removeEventListener('touchstart', _this.stopRotation, true);
			div.removeEventListener('mousedown', _this.stopRotation, true);
			div.removeEventListener('keydown', _this.stopRotation, true);
			clearInterval(rotateInterval);
			rotateInterval = false;
		}
	};
		
	function rotateHandler() {
		coverFlow.next();
	}

	this.resize = function(wid, hei) {

		if (coverFlow) {
			coverFlow.resize(wid, hei);
		}

		if (textField) {
			textField.style.top = (hei - config.textoffset) + 'px';
		}
	};

	this.left = function() {
		_this.stopRotation();
		coverFlow.left();
	};
	this.right = function() {
		_this.stopRotation();
		coverFlow.right();
	};
	this.prev = function() {
		_this.stopRotation();
		coverFlow.prev();
	};
	this.next = function() {
		_this.stopRotation();
		coverFlow.next();
	};
	this.to = function(index) {
		_this.stopRotation();
		coverFlow.to(index);
	};
	this.destroy = function() {
		if (coverFlow) coverFlow.destroy();
	};

	setup();
};
