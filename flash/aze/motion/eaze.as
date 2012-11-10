/*
	Eaze is an Actionscript 3 tween library by Philippe Elsass
	Contact: philippe.elsass*gmail.com
	Website: http://code.google.com/p/eaze-tween/
	License: http://www.opensource.org/licenses/mit-license.php
*/
package aze.motion 
{
	/**
	 * Select a target for tweening
	 */
	public function eaze(target:Object):EazeTween
	{
		return new EazeTween(target);
	}

}

// you can comment out the following lines to disable some plugins
//import aze.motion.specials.PropertyTint; PropertyTint.register();
//import aze.motion.specials.PropertyFrame; PropertyFrame.register();
//import aze.motion.specials.PropertyFilter; PropertyFilter.register();
//import aze.motion.specials.PropertyVolume; PropertyVolume.register();
//import aze.motion.specials.PropertyColorMatrix; PropertyColorMatrix.register();
//import aze.motion.specials.PropertyBezier; PropertyBezier.register();
//import aze.motion.specials.PropertyShortRotation; PropertyShortRotation.register();
