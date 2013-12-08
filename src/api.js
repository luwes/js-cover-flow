
var Api = function(id) {

	var _this = this;
	var player;
	var readyFlag;

	this.id = id;
	this.container = document.getElementById(id);
	this.config = null;

	this.setup = function(options) {

		player = null;
		readyFlag = false;
	
		var defaultConfig = {
			mode:					'html5',
			flash:					'coverflow.swf',
			width:					480,
			height:					270,
			item:					0,
			backgroundcolor:		'000000',
			backgroundopacity:		1,
			wmode:					'window',
			gradientcolor:			undefined,
			coverwidth:				150,
			coverheight:			'auto',
			covergap:				40,
			coverangle:				70,
			coverdepth:				170,
			coveroffset:			130,
			fixedsize:				false,
			opacitydecrease:		0.1,	//is not enabled in HTML5, too slow on iOS
			reflectionopacity:		0.3,
			reflectionratio:		155,
			reflectionoffset:		0,
			showtext:				true,
			textstyle:				'.coverflow-text{color:#f1f1f1;text-align:center;font-family:Arial Rounded MT Bold,Arial;} .coverflow-text h1{font-size:14px;font-weight:normal;line-height:21px;} .coverflow-text h2{font-size:11px;font-weight:normal;} .coverflow-text a{color:#0000EE;}',
			textoffset:				75,
			tweentime:				0.8,
			rotatedelay:			0,
			focallength:			250,
			framerate:				60,
			mousewheel:				true,
			x:						0,
			y:						0
		};

		this.events = {
			ready: new Signal(),
			playlist: new Signal(),
			focus: new Signal(),
			click: new Signal(),
			fadeIn: new Signal(),
			fadeOut: new Signal()
		};

		this.config = _.extend(defaultConfig, options);
		this.config.id = this.id;

		this.container = document.getElementById(id);
		this.container.innerHTML = '';
		this.container.tabIndex = 0;
		_.addClass(this.container, 'coverflow');

		if (String(this.config.width).indexOf('%') !== -1) {
			_.off(window, 'resize', resizeHandler);
			_.on(window, 'resize', resizeHandler);
		}

		this.resize(this.config.width, this.config.height);

		if (this.getMode() === 'html5') {
			player = new Html5(this);
		} else if (this.getMode() === 'flash') {
			player = new Flash(this);
		}

		this.left = player.left;
		this.right = player.right;
		this.prev = player.prev;
		this.next = player.next;
		this.to = player.to;
		this.fadeIn = player.fadeIn;
		this.fadeOut = player.fadeOut;

		return this;
	};

	this.remove = function() {
		var replacement = document.createElement('div');
		replacement.id = this.id;
		this.container.parentNode.replaceChild(replacement, this.container);
		this.container = replacement;

		_.off(window, 'resize', resizeHandler);
		if (player) player.destroy();

		delete players[this.id];
	};

	function resizeHandler() {
		_this.resize();
	}

	this.resize = function(wid, hei) {

		_.css(this.container, {
			width: wid,
			height: hei
		});

		this.config.width = this.container.clientWidth;
		this.config.height = this.container.clientHeight;

		if (player) {
			player.resize(this.config.width, this.config.height);
		}
	};

	this.getMode = function() {
		if (_.hasFlash && this.config.mode === 'flash') {
			return 'flash';
		}
		if (!_.isIE && Modernizr.csstransforms3d && Modernizr.csstransitions && Modernizr.canvas) {
			return 'html5';
		}
		return 'flash';
	};

	this.on = function(event, func) {
		this.events[event].on(func);
		if (readyFlag && event === 'ready') {
			this.events.ready.trigger.apply(this);
		}
	};

	this.off = function(event, func) {
		this.events[event].off(func);
	};

	this.trigger = function(event) {
		readyFlag = true;
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		this.events[event].trigger.apply(this, args);
	};
};
