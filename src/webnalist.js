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
