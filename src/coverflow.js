
var CoverFlow = function(div, playlist, config) {
	var _this = this;

	this.config = config;
	
	var coversLength = playlist.length;
	var completeLength = 0;
	var maxCoverHeight = 0;
	var current = 0;

	this.events = {
		focus: new Signal(),
		click: new Signal()
	};

	this.covers = [];
	this.transforms = [];
	this.hits = [];
	this.transforms2 = [];
	this.prevF = -1;
	this.transformProp = Modernizr.prefixed('transform');
	this.space = config.coveroffset + config.covergap;
	this._angle = 'rotateY(' + (-config.coverangle) + 'deg)';
	this.angle = 'rotateY(' + config.coverangle + 'deg)';

	this.offsetX = 0;
	this.offsetY = 0;
	
	this.el = document.createElement('div');
	this.el.className = 'coverflow-wrap';
	this.tray = document.createElement('div');
	this.tray.className = 'coverflow-tray';
	this.el.appendChild(this.tray);
	this.rect = document.createElement('div');
	this.rect.className = 'coverflow-rect';
	this.el.appendChild(this.rect);
	
	this.el.style[Modernizr.prefixed('perspective')] = config.focallength+'px';
	this.tray.style[Modernizr.prefixed('transitionDuration')] = this.config.tweentime + 's';
	
	var controller = new Controller(this, this.tray, this.config);

	var cover = null;
	var hit = null;
	for (var i = 0; i < coversLength; i++) {
		
		cover = new Cover(_this, i, playlist[i].image, config);
		this.tray.appendChild(cover.el);
		cover.el.style[Modernizr.prefixed('transitionDuration')] = this.config.tweentime + 's';
		this.covers[i] = cover;

		hit = new Hit(_this, i, config);
		this.rect.appendChild(hit.el);
		this.hits[i] = hit;
	}

	div.addEventListener('touchstart', controller, true);
	div.addEventListener('keydown', keyboard, false);
	this.rect.addEventListener('mousedown', clickHandler, false);


	this.itemComplete = function(h) {
		maxCoverHeight = maxCoverHeight < h ? h : maxCoverHeight;
		completeLength += 1;
		if (completeLength == coversLength) {
			for (var i = 0; i < coversLength; i++) {
				var cover = this.covers[i];
				cover.setY(maxCoverHeight);
				this.hits[i].resize(cover.width, cover.height);
				this.hits[i].setY(maxCoverHeight);
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

		var match;
		if (typeof index === 'string' && (match = /^([+-])=(\d)/.exec(index))) {
			index = (match[1] + 1) * match[2] + current;
		}

		if (index > coversLength - 1) index = coversLength - 1;
		else if (index < 0) index = 0;
					
		current = index;
		controller.to(index);
	};

	this.on = function(e, fn) {
		this.events[e].on(fn);
	};
	
	this.destroy = function() {
		div.removeChild(_this.el);

		div.removeEventListener('touchstart', controller, true);
		div.removeEventListener('keydown', keyboard, false);
	};

	this.resize = function() {
		this.offsetX = config.width * 0.5 + config.x;
		this.offsetY = config.height * 0.5 + config.y;
		this.setTrayStyle((controller.currentX + this.offsetX), this.offsetY);
		this.setRectStyle((controller.currentX + this.offsetX), this.offsetY);
	};
	
	function clickHandler(e) {
		if (e.button === 0) {
			e.stopImmediatePropagation();
			e.preventDefault();

			var hit = _this.hits[_.getChildIndex(e.target)];
			if (hit.index == current) {
				_this.events.click.trigger(hit.index);
			} else {
				_this.to(hit.index);
			}
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
			case 37:
				_this.left();
				break;
			case 39:
				_this.right();
				break;
			case 38:
				_this.to(0);
				break;
			case 40:
				_this.to(coversLength - 1);
				break;
			case 32:
				_this.events.click.trigger(current);
				break;
			}
		}
	}
};

CoverFlow.prototype.updateTouchEnd = function(controller) {
	var i = this.getFocusedCover(controller.currentX);
	controller.currentX = -i * this.config.covergap;
	this.update(controller.currentX);
};

CoverFlow.prototype.getFocusedCover = function(currentX) {
	var i = -Math.round(currentX / this.config.covergap);
	return Math.min(Math.max(i, 0), this.covers.length - 1);
};

CoverFlow.prototype.getFocusedCoverOne = function(currentX) {
	var i = -Math.round(currentX / this.config.covergap);
	return Math.min(Math.max(i, -1), this.covers.length);
};

CoverFlow.prototype.tap = function(e, currentX) {
	if (e.target.className == 'coverflow-hit') {
		var current = this.getFocusedCover(currentX);
		var hit = this.hits[_.getChildIndex(e.target)];
		if (hit.index == current) {
			this.events.click.trigger(hit.index);
		} else {
			this.to(hit.index);
		}
	}
};

CoverFlow.prototype.setTrayStyle = function(x, y) {
	this.tray.style[this.transformProp] = 'translate3d(' + x + 'px, ' + y + 'px, -' + this.config.coverdepth + 'px)';
};

CoverFlow.prototype.setRectStyle = function(x, y) {
	this.rect.style[this.transformProp] = 'translate3d(' + x + 'px, ' + y + 'px, -' + this.config.coverdepth + 'px)';
};

CoverFlow.prototype.setHitStyle = function(hit, i, transform) {
	if (this.transforms2[i] != transform) {
		hit.el.style[this.transformProp] = transform;
		this.transforms2[i] = transform;
	}
};

CoverFlow.prototype.setCoverStyle = function(cover, i, transform) {
	if (this.transforms[i] != transform) {
		cover.el.style[this.transformProp] = transform;
		this.transforms[i] = transform;
	}
};

CoverFlow.prototype.getCoverTransform = function(f, i) {
	var x = i * this.config.covergap;
	if (f == i) {
		return 'translate3d(' + x + 'px, 0, ' + this.config.coverdepth + 'px)';
	} else if (i > f) {
		return 'translate3d(' + (x + this.space) + 'px, 0, 0) ' + this._angle;
	} else {
		return 'translate3d(' + (x - this.space) + 'px, 0, 0) ' + this.angle;
	}
};

CoverFlow.prototype.update = function(currentX) {

	var f = this.getFocusedCoverOne(currentX);
	if (f != this.prevF) {
		this.events.focus.trigger(f);
		this.prevF = f;
	}

	this.setRectStyle((currentX + this.offsetX), this.offsetY);
	this.setTrayStyle((currentX + this.offsetX), this.offsetY);
	for (var i = 0; i < this.covers.length; i++) {
		this.setHitStyle(this.hits[i], i, this.getCoverTransform(f, i));
		this.setCoverStyle(this.covers[i], i, this.getCoverTransform(f, i));
	}
};
