var GaTrackFold = (function () {
'use strict';

function findOne(selector, el) {
  var found = find(selector, el);

  if (found.length) {
    return found[0];
  }

  return null;
}

function isWindow(obj) {
  return obj != null && obj === obj.window;
}

function find(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (selector instanceof HTMLElement || selector instanceof Node || isWindow(selector)) {
    return [selector];
  } else if (selector instanceof NodeList) {
    return [].slice.call(selector);
  } else if (typeof selector === 'string') {
    var startElement = context ? findOne(context) : document;
    return [].slice.call(startElement.querySelectorAll(selector));
  }
  return [];
}

function on(selector, event, cb) {
  var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (Array.isArray(selector)) {
    selector.forEach(function (item) {
      return on(item, event, cb, capture);
    });
    return;
  }

  var data = {
    cb: cb,
    capture: capture
  };

  if (!window._domassistevents) {
    window._domassistevents = {};
  }

  window._domassistevents['_' + event] = data;
  var el = find(selector);
  if (el.length) {
    el.forEach(function (item) {
      item.addEventListener(event, cb, capture);
    });
  }
}

var NativeCustomEvent = window.CustomEvent;

//
// Check for the usage of native support for CustomEvents which is lacking
// completely on IE.
//
function canIuseNativeCustom() {
  try {
    var p = new NativeCustomEvent('t', {
      detail: {
        a: 'b'
      }
    });
    return p.type === 't' && p.detail.a === 'b';
  } catch (e) {
    return false;
  }
}

// Lousy polyfill for the Custom Event constructor for IE.
var IECustomEvent = function CustomEvent(type, params) {
  var e = document.createEvent('CustomEvent');

  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, undefined);
  }

  return e;
};

var DomassistCustomEvent = canIuseNativeCustom() ? NativeCustomEvent : IECustomEvent;

var SCROLLABLE_CONTAINER = void 0;

function getScrollableContainer() {
  if (SCROLLABLE_CONTAINER) {
    return SCROLLABLE_CONTAINER;
  }

  var documentElement = window.document.documentElement;
  var scrollableContainer = void 0;

  documentElement.scrollTop = 1;

  if (documentElement.scrollTop === 1) {
    documentElement.scrollTop = 0;
    scrollableContainer = documentElement;
  } else {
    scrollableContainer = document.body;
  }

  SCROLLABLE_CONTAINER = scrollableContainer;

  return scrollableContainer;
}

SCROLLABLE_CONTAINER = getScrollableContainer();

var setupReady = function setupReady(callbacks) {
  return function (callback) {
    callbacks.push(callback);
    function execute() {
      while (callbacks.length) {
        var fn = callbacks.shift();
        if (typeof fn === 'function') {
          fn();
        }
      }
    }
    function loaded() {
      document.removeEventListener('DOMContentLoaded', loaded);
      execute();
    }

    if (document.readyState !== 'loading') {
      return execute();
    }
    document.addEventListener('DOMContentLoaded', loaded);
  };
};
var ready = setupReady([]);

/* global DocumentTouch */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var aug = function aug() {
  var args = Array.prototype.slice.call(arguments); //eslint-disable-line prefer-rest-params
  var org = args.shift();
  var type = '';
  if (typeof org === 'string' || typeof org === 'boolean') {
    type = org === true ? 'deep' : org;
    org = args.shift();
    if (type === 'defaults') {
      org = aug({}, org); //clone defaults into new object
      type = 'strict';
    }
  }
  args.forEach(function (prop) {
    for (var propName in prop) {
      //eslint-disable-line
      var propValue = prop[propName];
      // just overwrite arrays:
      if (Array.isArray(propValue)) {
        org[propName] = propValue;
        continue;
      }
      if (type === 'deep' && (typeof propValue === 'undefined' ? 'undefined' : _typeof(propValue)) === 'object' && typeof org[propName] !== 'undefined') {
        if (_typeof(org[propName]) !== 'object') {
          org[propName] = propValue;
          continue;
        }
        aug(type, org[propName], propValue);
      } else if (type !== 'strict' || type === 'strict' && typeof org[propName] !== 'undefined') {
        org[propName] = propValue;
      }
    }
  });
  return org;
};
var index = aug;

/* eslint-env browser */
/* global _gaq, ga */
var GATrack = {
  sendEvent: function sendEvent(category, action, label) {
    if (GATrack.prefix) {
      category = GATrack.prefix + '-' + category;
    }

    GATrack.log(category, action, label);

    if (typeof window._gaq === 'undefined' && typeof window.ga === 'undefined') {
      // eslint-disable-line no-underscore-dangle
      return GATrack;
    }

    if (typeof window._gaq !== 'undefined') {
      // eslint-disable-line no-underscore-dangle
      _gaq.push(['_trackEvent', category, action, label, null, false]);
    } else {
      ga('send', 'event', category, action, label, { transport: 'beacon' });
    }
  },
  getData: function getData(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var href = element.dataset.gaTrackHref || element.getAttribute('href');
    var category = element.dataset.gaTrack || options.category || 'ga-track';
    var label = element.dataset.gaTrackLabel || options.label || href;
    var action = element.dataset.gaTrackAction || options.action || element.textContent.trim();

    return { href: href, category: category, label: label, action: action };
  },
  track: function track(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Array.isArray(element)) {
      element.forEach(function (data) {
        find(data.element).forEach(function (el) {
          GATrack.track(el, data);
        });
      });

      return;
    }

    if (typeof element.dataset.gaTrackInitialised !== 'undefined') {
      return;
    }

    element.dataset.gaTrackInitialised = true;

    options = index({}, GATrack.defaults, options);

    this.log('tracking', element, options);
    on(element, 'click', function (event) {
      GATrack.onTrackedClick(element, event, options);
    });
  },
  onTrackedClick: function onTrackedClick(element, event, options) {
    var data = GATrack.getData(element, options);
    var target = element.getAttribute('target');

    GATrack.sendEvent(data.category, data.action, data.label);

    if (element.dataset.gaTrackHref === 'false') {
      event.preventDefault();
    } else if (data.href && !event.metaKey && event.which === 1 && target !== '_blank') {
      event.preventDefault();
      setTimeout(function () {
        window.location = data.href;
      }, options.delay);
    }
  },
  autotrack: function autotrack() {
    var elements = find('[data-ga-track]');

    elements.forEach(function (element) {
      GATrack.track(element);
    });
  },
  log: function log() {
    if (GATrack.debug) {
      var _console;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_console = console).log.apply(_console, ['GATRACK'].concat(args)); //eslint-disable-line no-console
    }
  },


  debug: _typeof(window.localStorage) === 'object' && window.localStorage.getItem('GATrackDebug'),
  prefix: null,
  defaults: {
    delay: 200
  }
};

GATrack.debug = _typeof(window.localStorage) === 'object' && window.localStorage.getItem('GATrackDebug');
ready(GATrack.autotrack);

function set$1(name, value) {
  var days = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '/';
  var domain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var secure = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  var date = new Date();
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);

  var expires = '';
  var valueToUse = '';
  var secureFlag = '';
  var domainFlag = '';

  if (days) {
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }

  if (type === 'object' && type !== 'undefined') {
    valueToUse = encodeURIComponent(JSON.stringify({ value: value }));
  } else {
    valueToUse = encodeURIComponent(value);
  }

  if (secure) {
    secureFlag = '; secure';
  }

  if (domain) {
    domainFlag = '; domain=' + encodeURIComponent(domain);
  }

  document.cookie = name + '=' + valueToUse + expires + '; path=' + path + secureFlag + domainFlag;
}

function get$1(name) {
  var nameEQ = name + '=';
  var split = document.cookie.split(';');
  var value = null;

  split.forEach(function (item) {
    var cleaned = item.trim();

    if (cleaned.indexOf(nameEQ) === 0) {
      value = decodeURIComponent(cleaned.substring(nameEQ.length, cleaned.length));

      if (value.substring(0, 1) === '{') {
        try {
          value = JSON.parse(value);
          value = value.value || null;
        } catch (e) {
          return;
        }
      }

      if (value === 'undefined') {
        value = undefined;
      }
    }
  });

  return value;
}

function remove(name) {
  set$1(name, '', -1);
}

function increment(name, days) {
  var value = get$1(name) || 0;
  set$1(name, ~~value + 1, days);
}

function decrement(name, days) {
  var value = get$1(name) || 0;
  set$1(name, ~~value - 1, days);
}

var CookieMonster = {
  set: set$1,
  get: get$1,
  remove: remove,
  increment: increment,
  decrement: decrement
};

/* eslint-env browser */
var GATrackFold = {
  trackPixelRatio: function trackPixelRatio() {
    var pixelRatio = window.devicePixelRatio || 1;
    GATrack.sendEvent('Viewport', 'Pixel Ratio', pixelRatio);
  },
  trackViewportDimensions: function trackViewportDimensions() {
    var viewWidth = window.innerWidth || 0;
    var viewHeight = window.innerHeight || 0;
    viewWidth = Math.ceil(viewWidth / 100) * 100;
    viewHeight = Math.ceil(viewHeight / 100) * 100;

    GATrack.sendEvent('Viewport', 'Width', viewWidth);
    GATrack.sendEvent('Viewport', 'Height', viewHeight);
    GATrack.sendEvent('Viewport', 'Size', viewWidth + 'x' + viewHeight + '!');
  }
};

ready(function () {
  if (!CookieMonster.get('gaTrackFold')) {
    GATrackFold.trackPixelRatio();
    GATrackFold.trackViewportDimensions();
    CookieMonster.set('gaTrackFold', 1);
  }
});

return GATrackFold;

}());

//# sourceMappingURL=ga-track-fold.js.map