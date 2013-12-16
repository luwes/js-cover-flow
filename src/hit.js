
var Hit = function(flow, index, config) {
	
	this.index = index;
	
	this.el = document.createElement('div');
	this.el.className = Hit.getClassName();

	this.resize(config.coverwidth, config.coverheight);

	this.setY = function(maxCoverHeight) {
		var offsetY = maxCoverHeight * 0.5 - (maxCoverHeight - this.height);
		this.el.style.top = -offsetY + 'px';
	};
};

Hit.prototype.resize = function(wid, hei) {

	this.height = hei;

	_.css(this.el, {
		backgroundColor: '#00ff00',
		width: wid,
		height: hei,
		top: -hei * 0.5,
		left: -wid * 0.5
	});
};

Hit.getClassName = function() {
	return 'coverflow-hit';
};
