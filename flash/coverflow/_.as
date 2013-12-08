/**
* Copyright (c) 2013 Wesley Luyten
**/

package coverflow {
	
	public class _ {

		static public function getResizeDimensions(wid, hei, maxWid, maxHei) {

			var ratio = Math.min(maxWid / wid, maxHei / hei);
			return { width: wid*ratio, height: hei*ratio, ratio: ratio };
		}

		static public function getCropOffsets(wid, hei, newWid, newHei) {

			var ratio = [newWid / wid, newHei / hei];
			return ratio[0] < ratio[1] ?
				{ left: (wid - newWid / ratio[1]) * 0.5, top: 0, ratio: ratio[1] } :
				{ top: (hei - newHei / ratio[0]) * 0.5, left: 0, ratio: ratio[0] } ;
		}
	}
}
