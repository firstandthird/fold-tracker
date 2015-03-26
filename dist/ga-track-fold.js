/*!
 * ga-track-fold - A tracking library for tracking viewports
 * v0.0.0
 * https://github.com/firstandthird/ga-track-fold
 * copyright  2015
 * MIT License
*/
/*!
 * cookie-monster - a simple cookie library
 * v0.3.0
 * https://github.com/jgallen23/cookie-monster
 * copyright Greg Allen 2014
 * MIT License
*/
var monster = {
  set: function(name, value, days, path, secure) {
    var date = new Date(),
        expires = '',
        type = typeof(value),
        valueToUse = '',
        secureFlag = '';
    path = path || "/";
    if (days) {
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    if (type === "object"  && type !== "undefined") {
        if(!("JSON" in window)) throw "Bummer, your browser doesn't support JSON parsing.";
        valueToUse = encodeURIComponent(JSON.stringify({v:value}));
    } else {
      valueToUse = encodeURIComponent(value);
    }
    if (secure){
      secureFlag = "; secure";
    }

    document.cookie = name + "=" + valueToUse + expires + "; path=" + path + secureFlag;
  },
  get: function(name) {
    var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        value = '',
        firstChar = '',
        parsed={};
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        value = decodeURIComponent(c.substring(nameEQ.length, c.length));
        firstChar = value.substring(0, 1);
        if(firstChar=="{"){
          try {
            parsed = JSON.parse(value);
            if("v" in parsed) return parsed.v;
          } catch(e) {
            return value;
          }
        }
        if (value=="undefined") return undefined;
        return value;
      }
    }
    return null;
  },
  remove: function(name) {
    this.set(name, "", -1);
  },
  increment: function(name, days) {
    var value = this.get(name) || 0;
    this.set(name, (parseInt(value, 10) + 1), days);
  },
  decrement: function(name, days) {
    var value = this.get(name) || 0;
    this.set(name, (parseInt(value, 10) - 1), days);
  }
};

;(function($) {

  $.gaTrackFold = function(options) {
    var opt = $.extend({}, $.gaTrackFold.defaults, options);
    var cookieName = opt.cookieName || $.gaTrackFold.defaults.cookieName; // In case some one sets the options.cookieName to falsey

    if (typeof $.gaTrack === 'undefined') {
      return this;
    }

    if(monster.get(cookieName) === null)
    {
      // Support for window.devicePixelRatio is spotty.
      var pixelRatio = window.devicePixelRatio || 1;
      $.gaTrack('Viewport', 'Pixel Ratio', pixelRatio);

      // windo.innerWidth and window.innerHeight seem to be the most widely accepted
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