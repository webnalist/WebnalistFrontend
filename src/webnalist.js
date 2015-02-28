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
        };

    var defaults = {
            readArticleUrl: 'https://webnalist.com/articles/read/confirm',
            loadPricesUrl: 'https://webnalist.com/public/merchant/articles/prices.json',
            articleItemSelector: '.wn-item',
            priceSelector: '.wn-price',
            loadingClass: 'wn-loading',
            articleUrlAttribute: 'data-wn-url',
            wrapperSelector: '',
            loadPrices: false
        },
        options = app.options = extend(defaults, app.options || {}),
        openedWindow;

    if (options.wrapperSelector) {
        options.articleItemSelector = options.wrapperSelector + ' ' + options.articleItemSelector;
    }

    NodeList.prototype.forEach = Array.prototype.forEach;

    app.isReady = false;
    app.readyFn = app.readyFn || [];
    app.ready = function (fn) {
        app.readyFn.push(fn);
    };
    app.executeReady = function () {
        app.isReady = true;
        var fns = app.readyFn,
            i = 0,
            max = fns.length;
        for (; i < max; i++) {
            var fn = fns[i];
            if (typeof fn === "function") {
                fn();
            }
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
        $live(options.articleItemSelector, 'click', function (e) {
            var wn_url = e.target.closest(options.articleItemSelector).getAttribute(options.articleUrlAttribute);
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
            openedWindow.focus();
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
        qsa(options.articleItemSelector).forEach(function (item) {
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
            var selector = options.wrapperSelector + ' [' + options.articleUrlAttribute + '="' + url + '"]';
            qsa(selector).forEach(function (item) {
                var priceItem = qs(options.priceSelector, item);
                if (priceItem) {
                    $html(priceItem, formatPrice(data[url] / 100));
                    $removeClass(priceItem, options.loadingClass);
                }
            });
        }
        qsa(options.wrapperSelector + ' .' + options.loadingClass).forEach(function (item) {
            $html(item, '--');
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

    (function init() {
        handleArticleOnClick();
        options.loadPrices && getArticlesPrices();
    })();

    return extend(app, {
        formatPrice: formatPrice,
        getArticlesPrices: getArticlesPrices
    });
})(window, document, WN);
