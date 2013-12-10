
var Cover = function(flow, index, url, config) {

	var _this = this;

	var newWidth;
	var newHeight;
	
	this.index = index;
	this.halfHeight = 0;
	
	this.el = document.createElement('div');
	this.el.className = Cover.getClassName();
	var cellStyle = this.el.style;
	if (config.backgroundopacity === 1) {
		cellStyle.backgroundColor = config.backgroundcolor;
	}
	
	var bitmap = document.createElement('canvas');
	this.el.appendChild(bitmap);

	var image = new Image();
	image.onload = onComplete;
	image.src = url;
	
	function onComplete() {

		var wid = image.width;
		var hei = image.height;
			
		var cropTop = 0;
		var cropLeft = 0;
		
		// calculate the image size, ratio values
		if (config.fixedsize) {
			newWidth = Math.round(config.coverwidth);
			newHeight = Math.round(config.coverheight);
			var off = _.getCropOffsets(wid, hei, newWidth, newHeight);
			cropLeft = Math.round(off.left);
			cropTop = Math.round(off.top);
		} else {
			var fit = _.getResizeDimensions(wid, hei, config.coverwidth, config.coverheight);
			newWidth = Math.round(fit.width);
			newHeight = Math.round(fit.height);
		}
		
		_this.width = newWidth;
		_this.height = newHeight;
		_this.halfHeight = newHeight;
		
		cellStyle.top = -(newHeight * 0.5) + 'px';
		cellStyle.left = -(newWidth * 0.5) + 'px';
		cellStyle.width = newWidth + 'px';
		cellStyle.height = newHeight + 'px';

		bitmap.width = newWidth;
		bitmap.height = newHeight * 2;
		var ctx = bitmap.getContext('2d');
		ctx.drawImage(image, cropLeft, cropTop, wid-2*cropLeft, hei-2*cropTop, 0, 0, newWidth, newHeight);

		if (config.reflectionopacity > 0) {
			cellStyle.height = (newHeight * 2) + 'px';
			Cover.reflect(bitmap, newWidth, newHeight, config.reflectionopacity, config.reflectionratio, config.reflectionoffset);
		}
	
		flow.itemComplete(newHeight);
	}
	
	this.setY = function(maxCoverHeight) {
		var offsetY = maxCoverHeight * 0.5 - (maxCoverHeight - newHeight);
		this.el.style.top = -offsetY + 'px';
	};
};

Cover.getClassName = function() {
	return 'coverflow-cell';
};

Cover.reflect = function(bitmap, wid, hei, reflectOpacity, reflectRatio, reflectOffset) {

	var ctx = bitmap.getContext('2d');
	ctx.save();
	ctx.scale(1, -1);
	ctx.drawImage(bitmap, 0, -hei*2 - reflectOffset);
	ctx.restore();
	ctx.globalCompositeOperation = 'destination-out';

	var gradient = ctx.createLinearGradient(0, 0, 0, hei);
	gradient.addColorStop(reflectRatio/255, 'rgba(255, 255, 255, 1.0)');
	gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (1 - reflectOpacity) + ')');
	ctx.translate(0, hei + reflectOffset);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, wid, hei);
};
