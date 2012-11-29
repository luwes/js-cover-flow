/**
* Copyright (c) 2012 Wesley Luyten
**/

package coverflow {

	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.net.*;

	import com.adobe.serialization.json.*;
	
	public class PlaylistLoader  {


		private var main:Main;
		private var config:Object;

		
		public function PlaylistLoader(main:Main) {
			this.main = main;
			config = main.config;
		}

		public function load(p:*):void {
			if (typeof p === "string") {
				
				p = p.replace(/(\?|&)[^&]*callback=\?/, '');
				p += p.indexOf('?') !== -1 ? "&" : "?";
				p += "nojsoncallback=1";

				var loader:URLLoader = new URLLoader();
				loader.addEventListener(Event.COMPLETE, loaded);
				loader.load(new URLRequest(p));
			} else if (typeof p === "object") {

				main.events.playlist.trigger(p as Array);
				main.events.playlist.off();
			}
		}

		private function loaded(e:Event):void {
			var json:Object = new JSONDecoder(e.target.data as String, true).getValue();
			var playlist:Array;

			if (config.hasOwnProperty('route')) {
				playlist = [];
				if (config.route.hasOwnProperty('playlist')) {
					json = json[config.route.playlist];
				}

				for (var i:int = 0; i < json.length; i++) {
					playlist[i] = {
						image: findJsonValue(json[i], 'image'),
						title: findJsonValue(json[i], 'title'),
						description: findJsonValue(json[i], 'description')
					};
				}
			} else {
				playlist = json as Array;
			}

			main.events.playlist.trigger(playlist);
			main.events.playlist.off();
		}

		private function findJsonValue(obj:Object, type:String):String {
			if (config.route.hasOwnProperty(type)) {
				var value:Object = obj;
				var keys:Array = config.route[type].split('.');
				for (var i:int = 0; i < keys.length; i++) {
					value = value[keys[i]];
				}
				return value as String;
			} else {
				return obj[type] as String;
			}
		}
	}
}
