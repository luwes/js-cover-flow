/** @license
 * Cover Flow
 *
 * Author: Wesley Luyten
 * Version: 1.0 - (2012/06/20)
 */

(function(window) {

	var players = {};
	var C = function(id) {
		if (!id) {
			for (var key in players) {
				id = players[key].id;
			}
		}
		if (id) {
			var foundPlayer = players[id];
			if (foundPlayer) {
				return foundPlayer;
			} else {
				return players[id] = new C.Api(id);
			}
		}
		return null;
	};

	C.Api = function(id) {

		var player;
		var readyFlag;

		this.id = id;
		this.container = null;
		this.config = null;

		this.setup = function(options) {

			readyFlag = false;
		
			var defaultConfig = {
				mode:					"html5",
				flash:					"coverflow.swf",
				width:					480,
				height:					270,
				backgroundcolor:		"000000",
				gradientcolor:			undefined,
				coverwidth:				150,
				coverheight:			"auto",
				covergap:				40,
				coverangle:				70,
				coverdepth:				170,
				coveroffset:			130,
				removeblackborder:		false,
				fixedsize:				false,
				opacitydecrease:		0.1,	//is not enabled in HTML5, too slow on iOS
				reflectionopacity:		0.3,
				reflectionratio:		155,
				reflectionoffset:		0,
				showduration:			false,
				showtext:				true,
				textstyle:				".coverflow-text{color:#f1f1f1;text-align:center;font-family:Arial Rounded MT Bold,Arial;} .coverflow-text h1{font-size:14px;font-weight:normal;line-height:21px;} .coverflow-text h2{font-size:11px;font-weight:normal;} .coverflow-text a{color:#0000EE;}",
				textoffset:				75,
				tweentime:				0.8,
				rotatedelay:			0,
				focallength:			250,
				framerate:				60,
				x:						0,
				y:						0
			};

			this.events = {
				ready: new C.Signal(),
				playlist: new C.Signal(),
				focus: new C.Signal(),
				click: new C.Signal()
			};

			this.config = C.Utils.extend(defaultConfig, options);
			this.config.id = this.id;

			this.container = document.getElementById(id);
			this.container.innerHTML = "";
			C.Utils.addClass(this.container, "coverflow");
			this.resize(this.config.width, this.config.height);

			if (this.getMode() === "html5") {
				player = new C.html5(this);
			} else if (this.getMode() === "flash") {
				player = new C.flash(this);
			}

			this.left = player.left;
			this.right = player.right;
			this.prev = player.prev;
			this.next = player.next;
			this.to = player.to;

			return this;
		};

		this.remove = function() {
			var replacement = document.createElement('div');
			replacement.id = this.id;
			this.container.parentNode.replaceChild(replacement, this.container);
			this.container = replacement;

			delete players[this.id];
		};

		this.resize = function(wid, hei) {

			this.config.width = wid;
			this.config.height = hei;

			C.Utils.css(this.container, {
				width: wid,
				height: hei
			});

			if (player) {
				player.resize(wid, hei);
			}
		};

		this.getMode = function() {
			if (C.Utils.hasFlash && this.config.mode === "flash") {
				return "flash";
			}
			if (!C.Utils.isIE && Modernizr.csstransforms3d && Modernizr.csstransitions && Modernizr.canvas) {
				return "html5";
			}
			return "flash";
		};

		this.on = function(event, func) {
			this.events[event].on(func);
			if (readyFlag && event === "ready") {
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

	window.coverflow = C;

})(window);
