/**
* Copyright (c) 2013 Wesley Luyten
**/

package coverflow {

	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.display.GradientType;
	import flash.display.BlendMode;
	import flash.events.Event;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.net.URLRequest;
	import flash.system.LoaderContext;
	import flash.text.TextField;
	import flash.text.TextFormat;
	import flash.text.AntiAliasType;
	import flash.utils.ByteArray;

	import by.blooddy.crypto.Base64;
	
	public class Cover extends Sprite {
	
	
		private var coverFlow:CoverFlow;
		public var index:int;
		private var config:Object;
		
		public var bitmap:Bitmap;
		private var newWidth:Number;
		private var newHeight:Number;
		public var halfHeight:Number;
		public var _brightness:Number = 1;
		
		
		public function Cover(coverFlow:CoverFlow, index:int, url:String, config:Object) {
			
			this.coverFlow = coverFlow;
			this.index = index;
			this.config = config;
			
			mouseChildren = false;
			
			var loader:Loader = new Loader(); // create loader for the image
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onComplete);
			if (url) {
				if (url.match('base64,')) {
					var str:String = url.split('base64,')[1];
					var bytes:ByteArray = by.blooddy.crypto.Base64.decode(str);
					loader.loadBytes(bytes);
				} else {
					loader.load(new URLRequest(url), new LoaderContext(true));
				}
			}

			bitmap = new Bitmap();
			addChild(bitmap);
		}
		
		private function onComplete(e:Event):void {
			e.target.removeEventListener(Event.COMPLETE, onComplete);
			
			var b:Bitmap = e.target.content as Bitmap;
			var bmd:BitmapData = b.bitmapData;
			
			var hei:int = int(b.height);
			var wid:int = int(b.width);
			var cropTop:Number = 0;
			var cropBottom:Number = 0;
			var cropLeft:Number = 0;
			
			var scale:Number;
			// calculate the image size, ratio values
			if (config.fixedsize) {
				newWidth = config.coverwidth;
				newHeight = config.coverheight;
				if (newWidth / wid < newHeight / hei) {
					scale = newHeight / hei;
					cropLeft += (wid - newWidth / scale) * 0.5;
				} else {
					scale = newWidth / wid;
					cropTop += (hei - newHeight / scale) * 0.5;
				}
			} else {
				if (config.coverwidth >= config.coverheight) {
					newWidth = wid / hei * config.coverheight;
					newHeight = config.coverheight;
					scale = config.coverheight / hei;
				} else {
					newWidth = config.coverwidth;
					newHeight = hei / wid * config.coverwidth;
					scale = config.coverwidth / wid;
				}
			}
			
			halfHeight = newHeight;
			
			var opacity:Number = config.backgroundopacity < 1 ? 0 : 1;

			// fill background with the same color as parent
			graphics.beginFill(config.backgroundcolor, opacity);
			graphics.drawRect(-newWidth / 2, 0, newWidth, newHeight);
			graphics.endFill();
			
			var scaledBmd:BitmapData = new BitmapData(newWidth, newHeight);
			var m:Matrix = new Matrix();
			m.translate(-cropLeft, -cropTop);
			m.scale(scale, scale);
			scaledBmd.draw(bmd, m);
			bmd.dispose();
			
			bitmap.bitmapData = new BitmapData(newWidth, newHeight * 2, true, 0x00FFFFFF);
			bitmap.width = newWidth;
			bitmap.height = newHeight * 2;
			bitmap.bitmapData.draw(scaledBmd);
			
			bitmap.x = -newWidth * 0.5;
			y = -newHeight * 0.5;

			if (config.reflectionopacity > 0) {
				// if the reflection opacity is bigger than 0, a reflection bitmap is added to the sprite
				graphics.clear();
				graphics.beginFill(config.backgroundcolor, opacity);
				graphics.drawRect(-newWidth / 2, 0, newWidth, newHeight * 2);
				graphics.endFill();
				
				m = new Matrix();
				m.createGradientBox(newWidth, newHeight, Math.PI*0.5);

				var gradient:Shape = new Shape();
				gradient.graphics.beginGradientFill(GradientType.LINEAR, [0xFFFFFF,0xFFFFFF], [0,config.reflectionopacity], [255-config.reflectionratio,255], m);
				gradient.graphics.drawRect(0, 0, newWidth, newHeight);
				gradient.graphics.endFill();

				m = new Matrix();
				m.scale(1, -1);
				m.translate(0, newHeight*2 + config.reflectionoffset);
				bitmap.bitmapData.draw(scaledBmd, m);
				bitmap.bitmapData.draw(gradient, m, null, BlendMode.ALPHA);
				scaledBmd.dispose();
			}
			// let the parent know that the item is ready and pass the new height of the thumbnail
			coverFlow.itemComplete(newHeight);
		}
		
		// set the Y position of the flow item
		public function setY(maxCoverHeight:Number):void {
		
			var offsetY:Number = maxCoverHeight * 0.5 - (maxCoverHeight - newHeight);
			y = -offsetY;
		}
		
		public function set brightness(value:Number):void {
			visible = value > 0;
			bitmap.alpha = value;
			_brightness = value;
		}
			
		public function get brightness():Number {
			return bitmap.alpha;
		}
	}
}
