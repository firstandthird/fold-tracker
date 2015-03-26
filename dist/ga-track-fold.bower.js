/*!
 * ga-track-fold - A tracking library for tracking viewports
 * v0.0.0
 * https://github.com/firstandthird/ga-track-fold
 * copyright  2015
 * MIT License
*/
;(function($) {

  $.gaTrackFold = function() {
    if (typeof $.gaTrack === 'undefined') {
      return this;
    }

    var pixelRatio = window.devicePixelRatio;

    console.log("PR: " + pixelRatio);

  };
  
})(jQuery);