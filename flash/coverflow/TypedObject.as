/**
* Copyright (c) 2012 Wesley Luyten
**/

package coverflow {
	
	// strong typed references are much faster than weak references
	public class TypedObject {


		public var x:Number;
		public var z:Number;
		public var rotationY:Number;
		public var brightness:Number;
		
		
		public function TypedObject(x:Number=0, z:Number=0, rotationY:Number=0, brightness:Number=0) {
			this.x = x;
			this.z = z;
			this.rotationY = rotationY;
			this.brightness = brightness;
		}
	}
}