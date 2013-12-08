
var Controller = function(flow, elem, config) {
	this.flow = flow;
	this.elem = elem;
	this.config = config;
	
	this.currentX = 0;
	this.currentY = 0;
	this.transformProp = Modernizr.prefixed('transitionDuration');
};

Controller.prototype.handleEvent = function(e) {
	this[e.type](e);
};

Controller.prototype.touchstart = function(e) {
	e.stopImmediatePropagation();
	this.startX = e.touches[0].pageX - this.currentX;
	this.startY = e.touches[0].pageY - this.currentY;
	this.pageY = e.touches[0].pageY;
	this.moved = false;
	window.addEventListener('touchmove', this, true);
	window.addEventListener('touchend', this, true);
	this.elem.style[this.transformProp] = '0s';
};

Controller.prototype.touchmove = function(e) {
	e.stopImmediatePropagation();

	this.lastX = this.currentX;
	this.lastY = this.currentY;
	this.currentX = e.touches[0].pageX - this.startX;
	this.currentY = e.touches[0].pageY - this.startY;

	if (Math.abs(this.currentX - this.lastX) > Math.abs(this.currentY - this.lastY)) {
		e.preventDefault();
		this.moved = true;

		this.lastMoveTime = new Date().getTime();
		this.flow.update(this.currentX);
	} else {
		window.removeEventListener('touchmove', this, true);
		window.removeEventListener('touchend', this, true);	
	}
};

Controller.prototype.touchend = function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();

	window.removeEventListener('touchmove', this, true);
	window.removeEventListener('touchend', this, true);

	this.elem.style[this.transformProp] = this.config.tweentime + 's';

	if (this.moved) {
		var delta = this.currentX - this.lastX;
		var dt = new Date().getTime() - this.lastMoveTime + 1;
		
		this.currentX = this.currentX + delta * 50 / dt;
		this.flow.updateTouchEnd(this);
	} else {
		this.flow.tap(e, this.currentX);
	}
};

Controller.prototype.to = function(index) {
	this.currentX = -index * this.config.covergap;
	this.flow.update(this.currentX);
};
