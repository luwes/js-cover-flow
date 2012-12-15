(function(C) {
	
	C.PlaylistLoader = function(api) {

		var config = api.config;

		this.load = function(p) {
			if (typeof p === "string") {
				if (p.indexOf('callback=?') !== -1) {
					C.Utils.jsonp(p, jsonpLoaded);
				} else {
					C.Utils.ajax(p, ajaxLoaded);
				}
			} else if (typeof p === "object") {
				api.events.playlist.trigger(p);
				api.events.playlist.off();
			}
		};

		function jsonpLoaded(json) {

			var playlist = [];
			if (config.hasOwnProperty('route')) {
				if (config.route.hasOwnProperty('playlist')) {
					json = json[config.route.playlist];
				}

				for (var i = 0; i < json.length; i++) {
					playlist[i] = {
						image: findJsonValue(json[i], 'image'),
						title: findJsonValue(json[i], 'title'),
						description: findJsonValue(json[i], 'description'),
						link: findJsonValue(json[i], 'link'),
						duration: findJsonValue(json[i], 'duration')
					};
				}
			}

			api.events.playlist.trigger(playlist);
			api.events.playlist.off();
		}

		function findJsonValue(obj, type) {
			if (config.route.hasOwnProperty(type)) {
				var value = obj;
				var keys = config.route[type].split('.');
				for (var i = 0; i < keys.length; i++) {
					value = value[keys[i]];
				}
				return value;
			} else {
				return obj[type];
			}
		}
		
		function ajaxLoaded(xmlhttp) {
			var playlist = JSON.parse(xmlhttp.responseText);
			api.events.playlist.trigger(playlist);
			api.events.playlist.off();
		}
	};
	
})(coverflow);
