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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var js_cookie = createCommonjsModule(function (module, exports) {
	/*!
  * JavaScript Cookie v2.1.4
  * https://github.com/js-cookie/js-cookie
  *
  * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
  * Released under the MIT license
  */
	(function (factory) {
		var registeredInModuleLoader = false;
		if (typeof undefined === 'function' && undefined.amd) {
			undefined(factory);
			registeredInModuleLoader = true;
		}
		{
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	})(function () {
		function extend() {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[i];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function init(converter) {
			function api(key, value, attributes) {
				var result;
				if (typeof document === 'undefined') {
					return;
				}

				// Write

				if (arguments.length > 1) {
					attributes = extend({
						path: '/'
					}, api.defaults, attributes);

					if (typeof attributes.expires === 'number') {
						var expires = new Date();
						expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
						attributes.expires = expires;
					}

					// We're using "expires" because "max-age" is not supported by IE
					attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

					try {
						result = JSON.stringify(value);
						if (/^[\{\[]/.test(result)) {
							value = result;
						}
					} catch (e) {}

					if (!converter.write) {
						value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
					} else {
						value = converter.write(value, key);
					}

					key = encodeURIComponent(String(key));
					key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
					key = key.replace(/[\(\)]/g, escape);

					var stringifiedAttributes = '';

					for (var attributeName in attributes) {
						if (!attributes[attributeName]) {
							continue;
						}
						stringifiedAttributes += '; ' + attributeName;
						if (attributes[attributeName] === true) {
							continue;
						}
						stringifiedAttributes += '=' + attributes[attributeName];
					}
					return document.cookie = key + '=' + value + stringifiedAttributes;
				}

				// Read

				if (!key) {
					result = {};
				}

				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all. Also prevents odd result when
				// calling "get()"
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var rdecode = /(%[0-9A-Z]{2})+/g;
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = parts[0].replace(rdecode, decodeURIComponent);
						cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

						if (this.json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						if (key === name) {
							result = cookie;
							break;
						}

						if (!key) {
							result[name] = cookie;
						}
					} catch (e) {}
				}

				return result;
			}

			api.set = api;
			api.get = function (key) {
				return api.call(api, key);
			};
			api.getJSON = function () {
				return api.apply({
					json: true
				}, [].slice.call(arguments));
			};
			api.defaults = {};

			api.remove = function (key, attributes) {
				api(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	});
});

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
  if (js_cookie.get('gaTrackFold') === undefined) {
    GATrackFold.trackPixelRatio();
    GATrackFold.trackViewportDimensions();
    js_cookie.set('gaTrackFold', 1);
  }
});

return GATrackFold;

}());

//# sourceMappingURL=ga-track-fold.js.map