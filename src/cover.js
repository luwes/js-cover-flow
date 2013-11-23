(function(C) {

	C.Cover = function(flow, index, url, duration, config) {

		var _this = this;

		var coverWidth = config.coverwidth;
		var coverHeight = config.coverheight;
		var newWidth;
		var newHeight;
		
		this.index = index;
		this.halfHeight = 0;
		
		this.el = document.createElement('div');
		this.el.className = C.Cover.getClassName();
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
			var cropBottom = 0;
			var cropLeft = 0;
			var ctx;
				
			// algorithm to remove top and bottom black border of thumbnail
			if (config.removeblackborder) {
			
				var b = document.createElement('canvas');
				b.width = wid;
				b.height = hei;
				ctx = b.getContext('2d');
				ctx.drawImage(image, 0, 0);
				var bmd = ctx.getImageData(0, 0, wid, hei).data;
				
				var sum = 0;
				var x = 0;
				var i = 0;

				for (var y=0; y < hei; y++) {
					sum = 0;
					for (x=0; x < wid; x++) {
						i = (y * wid + x) * 4;
						sum += ((bmd[i] << 16) | (bmd[i+1] << 8) | bmd[i+2]);
					}
					if (sum/wid < 0x070707) cropTop++;
					else break;
				}
				
				for (y=hei-1; y>=0; y--) {
					sum = 0;
					for (x=0; x < wid; x++) {
						i = (y * wid + x) * 4;
						sum += ((bmd[i] << 16) | (bmd[i+1] << 8) | bmd[i+2]);
					}
					
					if (sum/wid < 0x070707) cropBottom++;
					else break;
				}
				
				hei -= (cropTop + cropBottom);
			}
						
			var scale;
			// calculate the image size, ratio values
			if (config.fixedsize) {
				newWidth = Math.round(coverWidth);
				newHeight = Math.round(coverHeight);
				if (newWidth / wid < newHeight / hei) {
					scale = newHeight / hei;
					cropLeft += (wid - newWidth / scale) * 0.5;
				} else {
					scale = newWidth / wid;
					cropTop += (hei - newHeight / scale) * 0.5;
				}
			} else {
				if (coverWidth >= coverHeight) {
					newWidth = Math.round(wid / hei * coverHeight);
					newHeight = Math.round(coverHeight);
					scale = coverHeight / hei;
				} else {
					newWidth = Math.round(coverWidth);
					newHeight = Math.round(hei / wid * coverWidth);
					scale = coverWidth / wid;
				}
			}
			
			_this.halfHeight = newHeight;
			
			cellStyle.top = -(newHeight * 0.5) + "px";
			cellStyle.left = -(newWidth * 0.5) + "px";
			cellStyle.width = (newWidth) + "px";
			cellStyle.height = (newHeight) + "px";
	
			bitmap.width = newWidth;
			bitmap.height = newHeight * 2;
			ctx = bitmap.getContext('2d');
			ctx.drawImage(image, cropLeft, cropTop, wid-2*cropLeft, hei-2*cropTop, 0, 0, newWidth, newHeight);
		
			if (config.showduration && duration > 0) {
				ctx.save();

				var text = C.Cover.formatTime(duration);
				ctx.font = "normal 10px Arial Rounded MT Bold, Arial";
				var metrics = ctx.measureText(text);
				var textWidth = metrics.width;

				ctx.roundRect(newWidth - (textWidth + 9), 5, textWidth + 4, 11, 2);
				ctx.fillStyle = "#000";
				ctx.globalAlpha = 0.7;
				ctx.fill();

				ctx.fillStyle = "#fff";
				ctx.globalAlpha = 0.8;
				ctx.textAlign = "right";
				ctx.fillText(text, newWidth - 7, 14);

				ctx.restore();
			}

			if (config.reflectionopacity > 0) {
				cellStyle.height = (newHeight * 2) + "px";
				C.Cover.reflect(bitmap, newWidth, newHeight, config.reflectionopacity, config.reflectionratio, config.reflectionoffset);
			}
		
			flow.itemComplete(newHeight);
		}
		
		this.setY = function(maxCoverHeight) {
			var offsetY = maxCoverHeight * 0.5 - (maxCoverHeight - newHeight);
			this.el.style.top = -offsetY + "px";
		};
	};

	C.Cover.getClassName = function() {
		return "coverflow-cell";
	};
	
	C.Cover.reflect = function(bitmap, wid, hei, reflectOpacity, reflectRatio, reflectOffset) {
	
		var ctx = bitmap.getContext('2d');
		ctx.save();
		ctx.scale(1, -1);
		ctx.drawImage(bitmap, 0, -hei*2 - reflectOffset);
		ctx.restore();
		ctx.globalCompositeOperation = "destination-out";
	
		var gradient = ctx.createLinearGradient(0, 0, 0, hei);
		gradient.addColorStop(reflectRatio/255, "rgba(255, 255, 255, 1.0)");
		gradient.addColorStop(0, "rgba(255, 255, 255, " + (1 - reflectOpacity) + ")");
		ctx.translate(0, hei + reflectOffset);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, wid, hei);
	};

	// function to format the time like 00:00
	C.Cover.formatTime = function(secs) {
		var h = Math.floor(secs / 3600);
		var m = Math.floor((secs % 3600) / 60);
		var s = Math.floor((secs % 3600) % 60);
		return (h===0 ? "" : h.toString()+":")+m.toString()+":"+(s<10 ? "0"+s.toString() : s.toString());
	};

	C.HTMLCover = function(flow, index, htmlText, backgroundImage, duration, config) {

		var _this = this;

		var coverWidth = config.coverwidth;
		var coverHeight = config.coverheight;
		var newWidth;
		var newHeight;
		
		this.index = index;
		this.halfHeight = 0;
		
		this.el = document.createElement('div');
		this.el.className = C.Cover.getClassName();
		var cellStyle = this.el.style;
		if (config.backgroundopacity === 1) {
			cellStyle.backgroundColor = config.backgroundcolor;
		}
                if(backgroundImage)
                    cellStyle.backgroundImage = "url('" + backgroundImage + "')";
                cellStyle.backgroundRepeat = "no-repeat";
                cellStyle.backgroundSize = "100% 100%";
		
                if(typeof htmlText == "string")
                    this.el.innerHTML = htmlText;
                else if(typeof htmlText == "object")
                    this.el.appendChild(htmlText);

	
			var scale, cropTop = 0, wid = config.coverwidth, hei = config.coverheight;
			// calculate the image size, ratio values
			if (config.fixedsize) {
				newWidth = Math.round(coverWidth);
				newHeight = Math.round(coverHeight);
				if (newWidth / wid < newHeight / hei) {
					scale = newHeight / hei;
					cropLeft += (wid - newWidth / scale) * 0.5;
				} else {
					scale = newWidth / wid;
					cropTop += (hei - newHeight / scale) * 0.5;
				}
			} else {
				if (coverWidth >= coverHeight) {
					newWidth = Math.round(wid / hei * coverHeight);
					newHeight = Math.round(coverHeight);
					scale = coverHeight / hei;
				} else {
					newWidth = Math.round(coverWidth);
					newHeight = Math.round(hei / wid * coverWidth);
					scale = coverWidth / wid;
				}
			}
			
			_this.halfHeight = newHeight;
			
			cellStyle.top = -(newHeight * 0.35) + "px";
			cellStyle.left = -(newWidth * 0.35) + "px";
			cellStyle.width = (newWidth) + "px";
			cellStyle.height = (newHeight) + "px";
			if (config.reflectionopacity > 0) {
				//cellStyle.height = (newHeight * 2) + "px";
			}
		
		this.setY = function(maxCoverHeight) {
			var offsetY = maxCoverHeight * 0.5 - (maxCoverHeight - newHeight);
			this.el.style.top = -offsetY + "px";
		};
	};

	if (window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype) {
		CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
			if (w < 2 * r) r = w / 2;
			if (h < 2 * r) r = h / 2;
			this.beginPath();
			this.moveTo(x+r, y);
			this.arcTo(x+w, y,   x+w, y+h, r);
			this.arcTo(x+w, y+h, x,   y+h, r);
			this.arcTo(x,   y+h, x,   y,   r);
			this.arcTo(x,   y,   x+w, y,   r);
			this.closePath();
			return this;
		};
	}

})(coverflow);
