;(function($) {

  $.gaTrackFold = function(options) {
    var opt = $.extend({}, $.gaTrackFold.defaults, options);
    var cookieName = opt.cookieName | $.gaTrackFold.defaults.cookieName;

    if (typeof $.gaTrack === 'undefined') {
      return this;
    }

    var pixelRatio = window.devicePixelRatio || 1;
    console.log("PR: " + pixelRatio);

    var viewWidth = window.innerWidth || 0;
    console.log("PR: " + pixelRatio);

    var viewHeight = window.innerWidth || 0;
    console.log("PR: " + pixelRatio);



    console.log("PR: " + pixelRatio);
  };

  $.gaTrackFold.defaults = {
    cookieName: 'gaTrackCookie'
  };
  
})(jQuery);