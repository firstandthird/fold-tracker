;(function($) {

  $.gaTrackFold = function(options) {
    var opt = $.extend({}, $.gaTrackFold.defaults, options);
    var cookieName = opt.cookieName || $.gaTrackFold.defaults.cookieName; // In case some one sets the options.cookieName to falsey

    var groupCeiling = function(num) {
      return Math.ceil(num / 100) * 100;
    };

    if (typeof $.gaTrack === 'undefined') {
      return this;
    }

    if (monster.get(cookieName) === null) {
      // Support for window.devicePixelRatio is spotty.
      var pixelRatio = window.devicePixelRatio || 1;
      $.gaTrack('Viewport', 'Pixel Ratio', pixelRatio);

      // windo.innerWidth and window.innerHeight seem to be the most widely accepted
      var viewWidth = window.innerWidth || 0;
      viewWidth = groupCeiling(viewWidth);

      $.gaTrack('Viewport', 'Width', viewWidth);

      var viewHeight = window.innerHeight || 0;
      viewHeight = groupCeiling(viewHeight);

      $.gaTrack('Viewport', 'Height', viewHeight);

      $.gaTrack('Viewport', 'Size', viewWidth + 'x' + viewHeight);

      monster.set(cookieName, '1');
    }

  };

  $.gaTrackFold.defaults = {
    cookieName: 'gaTrackFold'
  };
})(jQuery);
