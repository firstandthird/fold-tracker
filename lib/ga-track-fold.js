;(function($) {

  $.gaTrackFold = function(options) {
    var opt = $.extend({}, $.gaTrackFold.defaults, options);
    var cookieName = opt.cookieName | $.gaTrackFold.defaults.cookieName;

    if (typeof $.gaTrack === 'undefined') {
      return this;
    }

    console.log(monster.get(cookieName));
    if(monster.get(cookieName) === null)
    {
      var pixelRatio = window.devicePixelRatio || 1;
      $.gaTrack('Viewport', 'Pixel Ratio', pixelRatio);

      var viewWidth = window.innerWidth || 0;
      $.gaTrack('Viewport', 'Width', viewWidth);

      var viewHeight = window.innerHeight || 0;
      $.gaTrack('Viewport', 'Height', viewHeight);

      $.gaTrack('Viewport', 'Size', viewWidth + 'x' + viewHeight);

      monster.set(cookieName, '1'); 
    }

  };

  $.gaTrackFold.defaults = {
    cookieName: 'gaTrackCookie'
  };
  
})(jQuery);