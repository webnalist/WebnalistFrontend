/* | https://webnalist.com | v1.0.0 | Copyright (c) 2015 Webnalist Sp. z o.o. All rights reserved. | */
(function (ELEMENT, PREFIX) {
	ELEMENT.matches = ELEMENT.matches || ELEMENT[PREFIX + 'MatchesSelector'] || function (selector) {
		var
		element = this,
		elements = (element.document || element.ownerDocument).querySelectorAll(selector),
		index = 0;

		while (elements[index] && elements[index] !== element) ++index;

		return elements[index] ? true : false;
	};

	ELEMENT.closest = ELEMENT.closest || function (selector) {
		var node = this;

		while (node) {
			if (node.matches(selector)) return node;
			else node = node.parentElement;
		}

		return null;
	};
})(
	Element.prototype,
	(this.getComputedStyle && [].join.call(getComputedStyle(document.documentElement, '')).match(/-(moz|ms|webkit)-/) || [])[1]
);

/**
 * source: http://krasimirtsonev.com/blog/article/Cross-browser-handling-of-Ajax-requests-in-absurdjs
 * usage:
 Ajax.request({
    url: 'data.php',
    method: 'post',
    data: {
        select: 'users',
        orderBy: 'date'
    },
    headers: {
        'custom-header': 'custom-value'
    }
})
 .done(function(result) {})
 .fail(function(xhr) {})
 .always(function(xhr) {});
 */
var WN = WN || {};
WN.Ajax = (function () {
    return {
        request: function (ops) {
            if (typeof ops == 'string') ops = {url: ops};
            ops.url = ops.url || '';
            ops.method = ops.method || 'get';
            ops.data = ops.data || {};
            var getParams = function (data, url) {
                var arr = [], str;
                for (var name in data) {
                    arr.push(name + '=' + encodeURIComponent(data[name]));
                }
                str = arr.join('&');
                if (str != '') {
                    return url ? (url.indexOf('?') < 0 ? '?' + str : '&' + str) : str;
                }
                return '';
            };
            var api = {
                host: {},
                process: function (ops) {
                    var self = this;
                    this.xhr = null;
                    if (window.ActiveXObject) {
                        this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    }
                    else if (window.XMLHttpRequest) {
                        this.xhr = new XMLHttpRequest();
                    }
                    if (this.xhr) {
                        this.xhr.onreadystatechange = function () {
                            if (self.xhr.readyState == 4 && self.xhr.status == 200) {
                                var result = self.xhr.responseText;
                                if (ops.json === true && typeof JSON != 'undefined') {
                                    result = JSON.parse(result);
                                }
                                self.doneCallback && self.doneCallback.apply(self.host, [result, self.xhr]);
                            } else if (self.xhr.readyState == 4) {
                                self.failCallback && self.failCallback.apply(self.host, [self.xhr]);
                            }
                            self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.xhr]);
                        }
                    }
                    if (ops.method == 'get') {
                        this.xhr.open("GET", ops.url + getParams(ops.data, ops.url), true);
                        this.setHeaders({
                            'X-Requested-With': 'XMLHttpRequest'
                        });
                    } else {
                        this.xhr.open(ops.method, ops.url, true);
                        this.setHeaders({
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-type': 'application/x-www-form-urlencoded'
                        });
                    }
                    if (ops.headers && typeof ops.headers == 'object') {
                        this.setHeaders(ops.headers);
                    }
                    setTimeout(function () {
                        ops.method == 'get' ? self.xhr.send() : self.xhr.send(getParams(ops.data));
                    }, 20);
                    return this;
                },
                done: function (callback) {
                    this.doneCallback = callback;
                    return this;
                },
                fail: function (callback) {
                    this.failCallback = callback;
                    return this;
                },
                always: function (callback) {
                    this.alwaysCallback = callback;
                    return this;
                },
                setHeaders: function (headers) {
                    for (var name in headers) {
                        this.xhr && this.xhr.setRequestHeader(name, headers[name]);
                    }
                }
            };
            return api.process(ops);
        }
    };
})();

/* | https://webnalist.com | v1.0.0 | Copyright (c) 2015 Webnalist Sp. z o.o. All rights reserved. | */
var WN = WN || {};
WN = (function (window, document, app) {
    var qs = function (selector, scope) {
            return (scope || document).querySelector(selector);
        },
        qsa = function (selector, scope) {
            return (scope || document).querySelectorAll(selector);
        },
        $on = function (target, type, callback, useCapture) {
            target.addEventListener(type, callback, !!useCapture);
        },
        $live = (function () {
            var eventRegistry = {},
                dispatchEvent = function (event) {
                    event.preventDefault();
                    var targetElement = event.target;
                    eventRegistry[event.type].forEach(function (entry) {
                        var potentialElements = qsa(entry.selector);
                        var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement.closest(entry.selector)) >= 0;
                        if (hasMatch) {
                            entry.handler.call(targetElement, event);
                        }
                    });
                };

            return function (selector, event, handler) {
                if (!eventRegistry[event]) {
                    eventRegistry[event] = [];
                    $on(document.documentElement, event, dispatchEvent, true);
                }
                eventRegistry[event].push({
                    selector: selector,
                    handler: handler
                });
            };
        }()),
        $addClass = function (el, className) {
            if (el.classList) {
                el.classList.add(className);

            } else {
                el.className += ' ' + className;
            }
        },
        $removeClass = function (el, className) {
            if (el.classList) {
                el.classList.remove(className);
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        },
        $html = function (el, string) {
            el.innerHTML = string;
        },
        extend = function (out) {
            out = out || {};
            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i])
                    continue;

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key))
                        out[key] = arguments[i][key];
                }
            }
            return out;
        },
        isObject = function (o) {
            return o != null && typeof o === 'object' && !Array.isArray(o);
        },
        isPlainObject = function (o) {
            return isObject(o) && o.constructor === Object;
        };

    var defaults = {
            readArticleUrl: 'https://webnalist.com/articles/read/confirm',
            loadPricesUrl: 'https://webnalist.com/public/merchant/articles/prices.json',
            articleItemSelector: '.wn-item',
            articleItemLoadedClass: 'wn-item-loaded',
            priceSelector: '.wn-price',
            loadingClass: 'wn-loading',
            articleUrlAttribute: 'data-wn-url',
            wrapperSelector: '',
            noPriceLabel: '--',
            loadPrices: false
        },
        options = app.options = extend(defaults, app.options || {}),
        openedWindow;

    if (options.wrapperSelector) {
        options.articleItemSelector = options.wrapperSelector + ' ' + options.articleItemSelector;
    }

    if (options.sandbox) {
        var confirm = '/sandbox/confirm.php',
            prices = '/sandbox/prices.php',
            url = 'http://demo.webnalist.com';
        if (isPlainObject(options.sandbox)) {
            options.sandbox.url && (url = options.sandbox.url);
        }
        options.readArticleUrl = url + '/sandbox/confirm.php';
        options.loadPricesUrl = url + '/sandbox/prices.php';
        console.log(options.loadPricesUrl)
    }

    NodeList.prototype.forEach = Array.prototype.forEach;

    var ready = app.ready = function (fn) {
        if (document.readyState != 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    var _WN = window['WN'];
    app.noConflict = function () {
        if (window['WN'] === app) {
            window['WN'] = _WN;
        }
        return app;
    };

    function handleArticleOnClick() {
        var eventType = 'click',
            touchStarted = false,
            currX = 0,
            currY = 0,
            cachedX = 0,
            cachedY = 0,
            getPointerEvent = function (event) {
                return event.targetTouches ? event.targetTouches[0] : event;
            },
            action = function (e) {
                var item = e.target.closest(options.articleItemSelector);
                var wn_url = item.getAttribute(options.articleUrlAttribute) || item.getAttribute('href');
                var w = 360;
                var h = 440;
                var left = (screen.width / 2) - (w / 2);
                var top = (screen.height / 2) - (h / 2);
                var url = options.readArticleUrl + '?url=' + encodeURIComponent(wn_url);
                var windowOpts = [
                    'toolbar=no',
                    'location=no',
                    'directories=no',
                    'status=no',
                    'menubar=no',
                    'scrollbars=yes',
                    'resizable=no',
                    'copyhistory=no',
                    'width=' + w,
                    'height=' + h,
                    'top=' + top,
                    'left=' + left
                ];
                openedWindow = window.open(url, null, windowOpts.join(','));
                //new window blocker detector
                if (!openedWindow || openedWindow.closed || typeof openedWindow.closed == 'undefined') {
                    window.location.href = url;
                }
                openedWindow.focus();
            };
        if (navigator.userAgent.match(/iPhone/i)) {
            eventType = 'touchstart';
            $on(document.body, 'touchend', function () {
                touchStarted = false;
            });
            $on(document.body, 'touchmove', function (e) {
                var pointer = getPointerEvent(e);
                currX = pointer.pageX;
                currY = pointer.pageY;
            });
        }
        $live(options.articleItemSelector, eventType, function (e) {
            if (eventType === 'touchstart') {
                var pointer = getPointerEvent(e);
                cachedX = currX = pointer.pageX;
                cachedY = currY = pointer.pageY;
                touchStarted = true;
                setTimeout(function () {
                    if ((cachedX === currX) && !touchStarted && (cachedY === currY)) {
                        action(e);
                    }
                }, 200);
            } else {
                action(e);
            }
        });
    }

    function getArticlesPrices() {
        var urls = {},
            index = 0,
            hasParams = function (obj) {
                var len = 0;
                for (var o in obj) {
                    len++;
                }
                return len;
            };
        qsa(options.articleItemSelector + ':not(.' + options.articleItemLoadedClass + ')').forEach(function (item) {
            var url = item.getAttribute(options.articleUrlAttribute),
                priceItem = qs(options.priceSelector, item);
            if (url) {
                urls['url[' + index + ']'] = url;
                index++;
            }
            priceItem && $addClass(priceItem, options.loadingClass);
        });
        if (!hasParams(urls)) {
            return;
        }
        app.Ajax.request({
            url: options.loadPricesUrl,
            method: 'post',
            data: urls
        }).done(function (data) {
            showArticlePrices(JSON.parse(data));
        });
    }

    function showArticlePrices(data) {
        for (var url in data) {
            var selector = options.articleItemSelector + '[' + options.articleUrlAttribute + '="' + url + '"]';
            qsa(selector + ':not(.' + options.articleItemLoadedClass + ')').forEach(function (item) {
                $addClass(item, options.articleItemLoadedClass);
                var priceItem = qs(options.priceSelector, item);
                if (priceItem) {
                    $html(priceItem, formatPrice(data[url] / 100));
                    $removeClass(priceItem, options.loadingClass);
                }
            });
        }
        qsa(options.articleItemSelector + ':not(.' + options.articleItemLoadedClass + ')' + ' .' + options.loadingClass).forEach(function (item) {
            $html(item, options.noPriceLabel);
            $removeClass(item, options.loadingClass);
        });
    }

    function formatNumber(number, decimal, part, sectionSeparator, decimalSeparator) {
        var re = '\\d(?=(\\d{' + (part || 3) + '})+' + (decimal > 0 ? '\\D' : '$') + ')',
            num = number.toFixed(Math.max(0, ~~decimal));
        return (decimalSeparator ? num.replace('.', decimalSeparator) : num).replace(new RegExp(re, 'g'), '$&' + (sectionSeparator || ','));
    }

    function formatPrice(price) {
        return formatNumber(price, 2, 3, ' ', ',');
    }

    ready(function () {
        handleArticleOnClick();
        options.loadPrices && getArticlesPrices();
    });

    return extend(app, {
        formatPrice: formatPrice,
        getArticlesPrices: getArticlesPrices
    });
})(window, document, WN);
