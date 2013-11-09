/** @license
 * Cover Flow
 *
 * Author: Wesley Luyten
 * Version: 1.0 - (2012/06/20)
 */

var players = {};

var C = window.coverflow = function(id) {
	if (!id) {
		for (var key in players) {
			id = players[key].id;
		}
	}
	if (id) {
		var foundPlayer = players[id];
		if (foundPlayer) {
			return foundPlayer;
		} else {
			return players[id] = new C.Api(id);
		}
	}
	return null;
};

if (typeof jQuery !== "undefined") {
	jQuery.fn.coverflow = function(method) {
		var player = C(this[0].id);
		if (player[method]) {
			return player[method].apply(player, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object") {
			return player.setup.apply(player, arguments);
		} else if (!method) {
			return player;
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.coverflow');
		}
	};
}
