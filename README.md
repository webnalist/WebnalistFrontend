# WebnalistFrontend
WebnalistFrontend Merchant Library

This library enables the processing of WebnalistPayment using remote account model.
User don't need to be logged in Merchant service.

https://webnalist.com

###Embeding code
```js
    (function (d, s, wn) {
        window['WN'] = wn;
        wn.readyFn = wn.readyFn || [];
        wn.ready = function (fn) {
        wn.readyFn.push(fn);
    };
    var wns = d.createElement(s);
    wns.async = true;
    wns.src = 'lib/webnalist.js'; //Make sure the path is correct.
    wns.onload = function () {
        wn.executeReady && wn.executeReady();
    };
    var tag = document.getElementsByTagName("script")[0];
    tag.parentNode.insertBefore(wns, tag);
    })(document, 'script', window['WN'] || {});
```

###WebnalistPopup
![](https://github.com/webnalist/WebnalistFrontend/blob/master/assets/images/WebnalistPopup.png)