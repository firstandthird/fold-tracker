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
/*!
 * ga-track - Click tracking for Google Analytics
 * v0.8.0
 * https://github.com/firstandthird/ga-track
 * copyright First+Third 2015
 * MIT License
*/
/* global window,_gaq,ga */
(function($) {
  $.gaTrack = function(category, action, label) {
    if ($.gaTrack.debug) {
      return console.log('GA TRACK', category, action, label);
    }
    if (typeof window._gaq === 'undefined' && typeof window.ga === 'undefined') {
      return this;
    }

    if(typeof window._gaq !== 'undefined') {
      _gaq.push(['_trackEvent', category, action, label, null, false]);
    } else {
      ga('send', 'event', category, action, label);
    }
  };

  $.gaTrack.debug = false;

  $.gaTrackScroll = function() {
    var $body = $('body');
    var scrollPercent = 0;
    var lastPos = 0;
    var scrollTriggers = {
      'scroll': false,
      '25': false,
      '50': false,
      '75': false,
      '100': false
    };

    var scrollCheck = function() {
      scrollPercent = ~~(5*Math.round((window.scrollY/($body.height()-window.innerHeight)*100)/5));

      if (lastPos !== scrollPercent) {
        lastPos = scrollPercent;
      }

      if (!scrollTriggers.scroll) {
        scrollTriggers.scroll = true;
        $.gaTrack('scroll', document.location.toString(), 'Scrolled');
      }

      switch(scrollPercent) {
        case 25:
          if (scrollTriggers['25']) break;
          $.gaTrack('scroll', document.location.toString(), 'Scrolled 25%');
          scrollTriggers['25'] = true;
          break;
        case 50:
          if (scrollTriggers['50']) break;
          $.gaTrack('scroll', document.location.toString(), 'Scrolled 50%');
          scrollTriggers['50'] = true;
          break;
        case 75:
          if (scrollTriggers['75']) break;
          $.gaTrack('scroll', document.location.toString(), 'Scrolled 75%');
          scrollTriggers['75'] = true;
          break;
        case 100:
          if (scrollTriggers['100']) break;
          $.gaTrack('scroll', document.location.toString(), 'Scrolled 100%');
          scrollTriggers['100'] = true;
          break;
      }
    };

    $(window).on('scroll', scrollCheck);
  };

  $.fn.gaTrack = function(options) {
    var opt = $.extend({}, $.gaTrack.defaults, options);

    return this.each(function() {

      var el = $(this);

      var href = el.data('ga-track-href') || el.attr('href');
      var target = el.attr('target');

      var cat = el.data('ga-track') || opt.category || 'ga-track';
      var label = el.data('ga-track-label') || opt.label || href;
      var action = el.data('ga-track-action') || opt.action || el.text();

      el.on('click', function(e) {
        $.gaTrack(cat, action, label);
        if (el.data('ga-track-href') === false) {
          e.preventDefault();
        } else if (href && !e.metaKey && e.which === 1 && target != '_blank') {
          e.preventDefault();
          setTimeout(function() {
            window.location = href;
          }, opt.delay);
        }
      });

    });
  };

  $.gaTrack.defaults = {
    delay: 200
  };

  //data-api
  $(function() {
    $('[data-ga-track]').gaTrack();
  });


})(jQuery);

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
