/**
* MouseWheel by Denis Kolyako. Created January 16, 2009, last update: May 8, 2009
* Visit http://etcs.ru for documentation, updates and more free code.
*
* You may distribute this class freely, provided it is not modified in any way (including
* removing this header or changing the package path).
* 
*
* Please contact etc[at]mail.ru prior to distributing modified versions of this class.
*/
/**
 * The MouseWheel class lets you to capture mouse wheel on web page when your flash application in focus.
 * When wheel captured and your flash movie in focus, you cannot scroll page.
 * Works with IE/Firefox/Opera/Chrome on Windows.
 * Safari and any Mac OS versions of browsers are not supported :(
 */
package coverflow {
	
	import flash.display.Loader;
	import flash.errors.IllegalOperationError;
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.StatusEvent;
	import flash.net.LocalConnection;
	import flash.utils.ByteArray;
	
	/**
	 * @author					etc
	 * @version					1.1
	 * @playerversion			Flash 9
	 * @langversion				3.0
	 */
	public final class MouseWheel {
		
		/**
		 * @private
		 */
		private static const _bytes:ByteArray = new ByteArray();
		
		/**
		 * @private
		 */
		private static const _connection:LocalConnection = new LocalConnection();
				
		/**
		 * @private
		 */
		private static const _dataPart0:Array = new Array(
			0x46575309,
			0x28010000,
			0x7800055F,
			0x00000FA0,
			0x00001F01,
			0x00441100,
			0x00000043,
			0x02FFFFFF,
			0x3F03FE00,
			0x0000885C,
			0x0009006C,
			0x63004C6F,
			0x63616C43,
			0x6F6E6E65,
			0x6374696F,
			0x6E006C63
		);
		
		/**
		 * @private
		 */
		private static const _dataPart1:Array = new Array(
			0x00636F6E,
			0x6E656374,
			0x00636170,
			0x74757265,
			0x004D6F75,
			0x73650061,
			0x64644C69,
			0x7374656E,
			0x65720072,
			0x656D6F76,
			0x654C6973,
			0x74656E65,
			0x72006F6E,
			0x4D6F7573,
			0x65576865,
			0x656C0096,
			0x0D000800,
			0x06000000,
			0x00000000,
			0x00080140,
			0x1D960900,
			0x08020701,
			0x00000008,
			0x001C9602,
			0x00080352,
			0x17960200,
			0x08001C96,
			0x02000804,
			0x8E0F0000,
			0x01000329,
			0x00027661,
			0x6C756500,
			0x38009602,
			0x00040212,
			0x9D020019,
			0x00960900,
			0x04010701,
			0x00000008,
			0x051C9602,
			0x00080652,
			0x17990200,
			0x14009609,
			0x00040107,
			0x01000000,
			0x08051C96,
			0x02000807,
			0x52174F96,
			0x02000808,
			0x9B050000,
			0x00000000,
			0x1D960900,
			0x05010701,
			0x00000008,
			0x001C9602,
			0x00080452,
			0x17004000
		);

		/**
		 * @private
		 */
		private static var _loader:Loader;

		/**
		 * @private
		 */
		private static var _connectionID:uint;

		/**
		 * @private
		 */		
		private static var _captured:Boolean = false;
		
		/**
		 * @private
		 */		
		private static var _complete:Boolean = false;
		
        /**
         * Returns current mouse wheel status (captured/released)
         */
		public static function get captured():Boolean {
			return MouseWheel._captured;
		}
		
        /**
         * Capture mouse wheel on web page.
         */
		public static function capture(e:Event=null):void {
			if (MouseWheel._captured) return;
			
			if (!MouseWheel._bytes.length) {
				var rand:uint = Math.round(Math.random() * 100000);
				while (rand < 10000) rand = Math.round(Math.random() * 100000);
				MouseWheel._connectionID = rand;
				var bytes:ByteArray = MouseWheel._bytes; 
				var data:Array = MouseWheel._dataPart0;
				var length:uint = data.length;
				var i:uint;
				
				for (i = 0;i < length;i++) {
					bytes.writeUnsignedInt(data[i]);
				}
				
				bytes.writeUTFBytes('_' + MouseWheel._connectionID.toString());
				data = MouseWheel._dataPart1;
				length = data.length;
				
				for (i = 0;i < length;i++) {
					bytes.writeUnsignedInt(data[i]);
				}
				
				bytes.writeShort(0x0000);
			}
			
			MouseWheel._connection.addEventListener(StatusEvent.STATUS, MouseWheel.handler_status);
			MouseWheel._connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, MouseWheel.handler_asyncError);
			MouseWheel._captured = true;

			if (MouseWheel._loader) {
				MouseWheel.send();	
			} else {
				MouseWheel._loader = new Loader();
				MouseWheel._loader.loadBytes(MouseWheel._bytes);
				MouseWheel._loader.contentLoaderInfo.addEventListener(Event.COMPLETE, MouseWheel.handler_complete);
			}
		}
		
        /**
         * Release mouse wheel on web page.
         */
		public static function release(e:Event=null):void {
			if (!MouseWheel._captured) return;
			MouseWheel._captured = false;
			MouseWheel.send();
		}
		
		/**
		 * @private
		 */
		private static function send(event:Event = null):void {
			if (!MouseWheel._complete) return;
			MouseWheel._connection.send('lc_' + MouseWheel._connectionID, 'capture', MouseWheel._captured);
		}
		
		/**
		 * @private
		 */
		private static function handler_complete(event:Event):void {
			MouseWheel._complete = true;
			if (!MouseWheel._captured) MouseWheel.send();
		}
		
		/**
		 * @private
		 */
		private static function handler_status(event:StatusEvent):void {
			if (event.level == 'error') MouseWheel.send(); // try again
		}
		
		/**
		 * @private
		 */
		private static function handler_asyncError(event:AsyncErrorEvent):void {
			// do nothing
		}

		public function MouseWheel() {
			throw new IllegalOperationError('do not instantiate MouseWheel');
		}
	}
}