(function(C) {

	C.CoverFlow = function(div, playlist, config) {
		var _this = this;

		this.config = config;
		
		var fadeOutComplete = new C.Signal();
		var fadeInComplete = new C.Signal();
		
		var coversLength = playlist.length;
		var completeLength = 0;
		var maxCoverHeight = 0;
		var current = 0;
		
		var focusCallbacks = [];
		var clickCallbacks = [];

		this.covers = [];
		this.transforms = [];
		this.prevF = -1;
		this.transformProp = Modernizr.prefixed('transform');
		this.space = config.coveroffset + config.covergap;
		this._angle = "rotateY(" + (-config.coverangle) + "deg)";
		this.angle = "rotateY(" + config.coverangle + "deg)";
		
		this.domElement = document.createElement('div');
		this.domElement.className = "coverflow-wrap";
		this.tray = document.createElement('div');
		this.tray.className = "coverflow-tray";
		this.domElement.appendChild(this.tray);
		this.domElement.style[Modernizr.prefixed('perspective')] = config.focallength+"px";
		
		var controller = new C.Controller(this, this.tray, this.config);

		var cover = null;
		for (var i = 0; i < coversLength; i++) {
			
			cover = new C.Cover(_this, i, playlist[i].image, playlist[i].duration, config);
			this.tray.appendChild(cover.domElement);
			cover.domElement.onmousedown = clickHandler;
			cover.domElement.style[Modernizr.prefixed('transitionDuration')] = this.config.tweentime + "s";
			this.covers[i] = cover;
		}

		//cover holds the last cover added
		if (cover) {
			cover.domElement.firstChild.addEventListener('webkitTransitionEnd', coverTransitionEnd, false);
			cover.domElement.firstChild.addEventListener('transitionend', coverTransitionEnd, false);
		}

		div.addEventListener('touchstart', controller, true);
		window.addEventListener('keydown', keyboard, false);


		function coverTransitionEnd(e) {
			e.stopPropagation();

			if (parseInt(cover.domElement.firstChild.style.opacity, 10) === 0) {
				_this.domElement.style.opacity = 0;
				fadeOutComplete.trigger();
			} else if (parseInt(cover.domElement.firstChild.style.opacity, 10) === 1) {
				fadeInComplete.trigger();
			}
		}
		
		this.fadeOut = function(callback) {
			fadeOutComplete.off().on(callback);
			for (var i = 0; i < this.covers.length; i++) {
				this.covers[i].domElement.firstChild.style.opacity = 0;
			}
		};
		
		this.fadeIn = function(callback) {
			fadeInComplete.off().on(callback);
			_this.domElement.style.opacity = 1;
			for (var i = 0; i < this.covers.length; i++) {
				this.covers[i].domElement.firstChild.style.opacity = 1;
			}
		};

		this.itemComplete = function(h) {
			maxCoverHeight = maxCoverHeight < h ? h : maxCoverHeight;
			completeLength += 1;
			if (completeLength == coversLength) {
				_this.to(config.item);
				for (var i = 0; i < coversLength; i++) {
					this.covers[i].setY(maxCoverHeight);
				}
			}
		};
	
		this.left = function() {
			if (current > 0) _this.to(current - 1);
		};
			
		this.right = function() {
			if (current < coversLength - 1) _this.to(current + 1);
		};
		
		this.prev = function() {
			if (current > 0) _this.to(current - 1);
			else _this.to(coversLength - 1);
		};
		
		this.next = function() {
			if (current < coversLength - 1) _this.to(current + 1);
			else _this.to(0);
		};
		
		this.to = function(index) {
			if (index > coversLength - 1) index = coversLength - 1;
			else if (index < 0) index = 0;
						
			current = index;
			controller.to(index);
		};
		
		this.focused = function(index) {
			for (var i = 0; i < focusCallbacks.length; i++) {
				focusCallbacks[i](index);
			}
		};
		
		this.clicked = function(index) {
			for (var i = 0; i < clickCallbacks.length; i++) {
				clickCallbacks[i](index);
			}
		};
		
		this.onFocus = function(c) {
			focusCallbacks.push(c);
		};
		
		this.onClick = function(c) {
			clickCallbacks.push(c);
		};
		
		this.destroy = function() {
			div.removeChild(_this.domElement);

			div.removeEventListener('touchstart', controller, true);
			window.removeEventListener('keydown', keyboard, false);
		};

		this.resize = function() {
			C.Utils.css(this.domElement, {
				left: config.width * 0.5 + config.x,
				top: config.height * 0.5 + config.y
			});
		};
		
		function clickHandler(e) {
			var child = this;
			var i = 0;
			while ((child = child.previousSibling) !== null) i += 1;

			var cover = _this.covers[i];
			var y = e.offsetY || e.layerY;
			if (y < cover.halfHeight) {
				e.preventDefault();

				if (cover.index != current) _this.to(cover.index);
				else _this.clicked(cover.index);
			}
		}
	
		function keyboard(e) {
			var element = e.target;
			if (element.tagName == 'INPUT' ||
				element.tagName == 'SELECT' ||
				element.tagName == 'TEXTAREA') return;

			if ([37, 39, 38, 40, 32].indexOf(e.keyCode) !== -1) {
				e.preventDefault();
				switch (e.keyCode) {
					case 37: _this.left(); break;
					case 39: _this.right(); break;
					case 38: _this.to(0); break;
					case 40: _this.to(coversLength - 1); break;
					case 32: _this.clicked(current); break;
				}
			}
		}
	};

	C.CoverFlow.prototype.updateTouchEnd = function(controller) {
		var i = this.getFocusedCover(controller.currentX);
		controller.currentX = -i * this.config.covergap;
		this.update(controller.currentX);
	};
	
	C.CoverFlow.prototype.getFocusedCover = function(currentX) {
		var i = -Math.round(currentX / this.config.covergap);
		return Math.min(Math.max(i, 0), this.covers.length - 1);
	};
	
	C.CoverFlow.prototype.getFocusedCoverOne = function(currentX) {
		var i = -Math.round(currentX / this.config.covergap);
		return Math.min(Math.max(i, -1), this.covers.length);
	};
	
	C.CoverFlow.prototype.tap = function(e, pageY, currentX) {
		var i = -Math.round(currentX / this.config.covergap);
		var cover = this.covers[i];
		if (cover.domElement == e.target.parentNode) {
			var pos = this.findPos(cover.domElement);
			var y = pageY - pos.y;
			if (y < cover.halfHeight) {
				this.clicked(cover.index);
			}
		}
	};
	
	C.CoverFlow.prototype.findPos = function(obj) {
		var curleft = 0;
		var curtop = 0;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while ((obj = obj.offsetParent) !== null);
			return { x: curleft, y: curtop };
		}
	};
	
	C.CoverFlow.prototype.setCoverStyle = function(cover, i, transform) {
		if (this.transforms[i] != transform) {
			cover.domElement.style[this.transformProp] = transform;
			this.transforms[i] = transform;
		}
	};
	
	C.CoverFlow.prototype.getCoverTransform = function(f, i) {
		var x = i * this.config.covergap;
		if (f == i) {
			return "translate3d(" + x + "px, 0, 0)";
		} else if (i > f) {
			return "translate3d(" + (x + this.space) + "px, 0, " + (-this.config.coverdepth) + "px) " + this._angle;
		} else {
			return "translate3d(" + (x - this.space) + "px, 0, " + (-this.config.coverdepth) + "px) " + this.angle;
		}
	};
	
	C.CoverFlow.prototype.update = function(currentX) {
		this.tray.style[this.transformProp] = "translate3d(" + currentX + "px, 0, 0)";

		var f = this.getFocusedCoverOne(currentX);
		if (f != this.prevF) {
			this.focused(f);
			this.prevF = f;
		}
		
		for (var i = 0; i < this.covers.length; i++) {
			this.setCoverStyle(this.covers[i], i, this.getCoverTransform(f, i));
		}
	};

})(coverflow);
