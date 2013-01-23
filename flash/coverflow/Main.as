/**
* Copyright (c) 2012 Wesley Luyten
**/

package coverflow {

	import flash.display.*;
	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.geom.*;
	import flash.utils.*;
	import flash.text.*;
	
	import aze.motion.EazeTween;
	import net.hires.debug.Stats;
	
	public class Main extends Sprite {


		private var div:Sprite;
		public var config:Object = {};
		public var playlist:Array;
		private var coverFlow:CoverFlow;
		private var masker:Sprite;
		private var textField:TextField;

		private var rotateInterval:Timer;

		public var events:Object = {
			playlist: new Signal()
		};

		//flash only, hybrid uses JS Signal system
		private var focusCallbacks:Array = [];
		private var clickCallbacks:Array = [];

		
		public function Main() {
			addEventListener(Event.ADDED_TO_STAGE, init);
		}

		public function init(e:Event=null):void {
			removeEventListener(Event.ADDED_TO_STAGE, init);

			div = this;
			//addChild(new Stats());

			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.stage.align = StageAlign.TOP_LEFT;

			for (var key:String in root.loaderInfo.parameters) {
				config[key] = serialize(root.loaderInfo.parameters[key]);
			}

			stage.frameRate = config.framerate;
						
			if (config.backgroundcolor is String) {
				config.backgroundcolor = config.backgroundcolor.indexOf('0x') !== -1 ? uint(config.backgroundcolor) : uint('0x' + config.backgroundcolor);
			}
			if (config.gradientcolor != undefined) {
				config.gradientcolor = config.gradientcolor.indexOf('0x') !== -1 ? uint(config.gradientcolor) : uint('0x' + config.gradientcolor);
			}
			
			masker = new Sprite();
			masker.graphics.beginFill(0);
			masker.graphics.drawRect(0, 0, config.width, config.height);
			masker.graphics.endFill();
			this.parent.addChild(masker);
			this.mask = masker;

			resize(config.width, config.height);

			this.parent.addEventListener(MouseEvent.ROLL_OVER, MouseWheel.capture);
			this.parent.addEventListener(MouseEvent.ROLL_OUT, MouseWheel.release);
			stage.addEventListener(MouseEvent.MOUSE_WHEEL, scrollOnMousewheel);

			events.playlist.on(playlistLoaded);
			var loader:PlaylistLoader = new PlaylistLoader(this);
			loader.load(config.playlist);

			setupJSListeners();

			ExternalInterface.call('coverflow("'+config.id+'").trigger', 'ready', config.id);
		}

		private function playlistLoaded(p:Array):void {
			playlist = p;

			config.coverheight = config.coverheight == "auto" ? config.height : config.coverheight;
			
			if (coverFlow) coverFlow.destroy();
			coverFlow = new CoverFlow(playlist, config);
			addChild(coverFlow);
			
			if (textField && contains(textField)) removeChild(textField);
			if (config.showtext === true) {
				var style:StyleSheet = new StyleSheet();
				config.textstyle = config.textstyle.replace(/\.coverflow-text/g, '');
				config.textstyle = config.textstyle.replace(/font-size:\s*?(\d+?)[a-z]*?;(.*?)line-height:\s*?(\d+?)[a-z]*?[;}]/g, function():String {
    				return 'font-size:' + arguments[1] + ';' + arguments[2] + 'leading:' + ((arguments[3] - arguments[1]) / 2) + ';';
				});
				style.parseCSS("div"+config.textstyle);
				textField = new TextField();
				textField.styleSheet = style;
				textField.selectable = false;
				textField.wordWrap = true;
				textField.multiline = true;
				addChild(textField);
				textField.addEventListener(MouseEvent.MOUSE_UP, disableFocus);
			}

			coverFlow.onFocus(coverFocus);
			coverFlow.onClick(coverClick);

			resize(config.width, config.height);

			if (config.rotatedelay > 0) {
				rotateInterval = new Timer(config.rotatedelay);
				rotateInterval.start();
				rotateInterval.addEventListener(TimerEvent.TIMER, rotateHandler);
				addEventListener(MouseEvent.CLICK, stopRotation, false, 0, true);
			}
		}

		private function disableFocus(e:MouseEvent=null):void {
			stage.focus = null;
		}

		private function stopRotation(e:MouseEvent=null):void {
			rotateInterval.stop();
		}
		
		private function rotateHandler(e:TimerEvent=null):void {
			coverFlow.next();
		}

		private function coverFocus(index:int):void {
			if (config.showtext == true) {
				var d:Object = playlist[index];
				textField.htmlText = "<div><h1>" + (d.title == undefined ? "" : d.title) + "</h1><h2>" + (d.description == undefined ? "" : d.description) + "</h2></div>";
			}
			
			for (var i:int = 0; i < focusCallbacks.length; i++) {
				if (focusCallbacks[i] is Function) {
					focusCallbacks[i](index);
				}
			}

			ExternalInterface.call('coverflow("'+config.id+'").trigger', 'focus', index, playlist[index].link);
		}
	
		private function coverClick(index:int):void {
			if (config.rotatedelay > 0 && rotateInterval) { rotateInterval.stop(); }
			
			for (var i:int=0; i<clickCallbacks.length; i++) {
				if (clickCallbacks[i] is Function) {
					clickCallbacks[i](index);
				}
			}

			ExternalInterface.call('coverflow("'+config.id+'").trigger', 'click', index, playlist[index].link);
		}

		private function scrollOnMousewheel(e:MouseEvent):void {
			e.stopPropagation();
			
			var delta:Number = Math.ceil(Math.abs(e.delta) / 120);
			if (delta > 0) {
				var sign:Number = Math.abs(e.delta) / e.delta;
				if (sign > 0) var func:Function = left;
				else if (sign < 0) func = right;
				if (func is Function) {
					for (var i:int=0; i<delta; i++) func();
				}
			}
		}

		public function resize(wid:Number, hei:Number):void {

			config.width = wid;
			config.height = hei;
			
			this.graphics.clear();
			this.graphics.beginFill(config.backgroundcolor, config.backgroundopacity);
			if (config.gradientcolor != undefined) {
				var m:Matrix = new Matrix();
				m.createGradientBox(wid, hei, Math.PI / 2);
				this.graphics.beginGradientFill(GradientType.LINEAR, [config.gradientcolor, config.backgroundcolor], [config.backgroundopacity, config.backgroundopacity], [0, 255], m);
			}
			this.graphics.drawRect(0, 0, wid, hei);
			this.graphics.endFill();
			
			if (mask) {
				mask.width = wid;
				mask.height = hei;
				mask.x = x;
				mask.y = y;
			}
		
			if (coverFlow) {
				coverFlow.x = wid * 0.5 + config.x;
				coverFlow.y = hei * 0.5 + config.y;
			}
		
			if (textField) {
				textField.width = wid;
				textField.y = hei - config.textoffset;
			}
		}

		//public
		public function left():void { coverFlow.left(); }
		public function right():void { coverFlow.right(); }
		public function prev():void { coverFlow.prev(); }
		public function next():void { coverFlow.next(); }
		public function to(index:int):void { coverFlow.to(index); }
		
		public function onFocus(c:*):void {
			focusCallbacks.push(c);
		}
		
		public function onClick(c:*):void {
			clickCallbacks.push(c);
		}

		public function fadeIn():void {
			new EazeTween(div).to(0.7, { alpha:1 }).onComplete(function():void {
				if (textField) new EazeTween(textField).to(0.7, { alpha:1 });
				coverFlow.fadeIn(function():void {
					ExternalInterface.call('coverflow("'+config.id+'").trigger', 'fadeIn');
				});
			});
		}

		public function fadeOut():void {
			if (textField) new EazeTween(textField).to(0.7, { alpha:0 });
			coverFlow.fadeOut(function():void {
				new EazeTween(div).to(0.7, { alpha:0 }).onComplete(function():void {
					ExternalInterface.call('coverflow("'+config.id+'").trigger', 'fadeOut');
				});
			});
		}

		private function setupJSListeners():void {
			try {
				// Player API Calls
				ExternalInterface.addCallback('apiResize', resize);
				ExternalInterface.addCallback('apiLeft', left);
				ExternalInterface.addCallback('apiRight', right);
				ExternalInterface.addCallback('apiPrev', prev);
				ExternalInterface.addCallback('apiNext', next);
				ExternalInterface.addCallback('apiTo', to);				
				ExternalInterface.addCallback('apiOnFocus', onFocus);
				ExternalInterface.addCallback('apiOnClick', onClick);
				ExternalInterface.addCallback('apiFadeIn', fadeIn);
				ExternalInterface.addCallback('apiFadeOut', fadeOut);
			} catch(e:Error) {
				trace("Could not initialize JavaScript API: "  + e.message);
			}
		}

		public static function serialize(val:String):Object {
			if (val === "undefined") {
				return undefined;
			} else if (val === "null") {
				return null;
			} else if (val === "true") {
				return true;
			} else if (val === "false") {
				return false;
			} else if (val.indexOf("[[JSON]]") == 0) {
				var json:String = val.substr(8);
				try {
					return JSON.parse(json);
				} catch(e:Error) {}
				return json;
			} else if (isNaN(Number(val)) || val.length > 5 || val.length == 0) {
				return val;
			} else {
				return Number(val);
			}
		}
	}
}
