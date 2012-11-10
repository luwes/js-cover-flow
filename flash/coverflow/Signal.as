/**
* Copyright (c) 2012 Wesley Luyten
**/

package coverflow {
	
	public class Signal  {
	
		private var callbacks:Array = [];
		
		public function Signal() {
		}

		public function on(func:Function):void {
			callbacks.push(func);
		}

		public function trigger():void {
			for (var i:int = 0; i < callbacks.length; i++) {
				if (typeof callbacks[i] === "function") {
					callbacks[i].apply(this, arguments);
				}
			}
		};

		public function off(func:Function=null):void {
			if (func !== null) {
				for (var i:int = 0; i < callbacks.length; i++) {
					if (callbacks[i] === func) {
						callbacks.splice(i, 1);
						i--;
					}
				}
			} else {
				callbacks = [];
			}
		}
	}
}