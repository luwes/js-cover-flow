/** @license
 * Cover Flow
 *
 * Author: Wesley Luyten
 * Version: 1.0 - (2012/06/20)
 * Version: 1.2 - (2013/11/09)
 */

var players = {};

var coverflow = window.coverflow = function(id) {
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
			return players[id] = new Api(id);
		}
	}
	return null;
};

if (typeof jQuery !== 'undefined') {
	jQuery.fn.coverflow = function(method) {
		var player = coverflow(this[0].id);
		if (player[method]) {
			return player[method].apply(player, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object') {
			return player.setup.apply(player, arguments);
		} else if (!method) {
			return player;
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.coverflow');
		}
	};
}
