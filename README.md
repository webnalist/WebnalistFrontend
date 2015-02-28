# WebnalistFrontend
WebnalistFrontend Merchant Library

This library enables the processing of WebnalistPayment using remote account model.
User don't need to be logged in Merchant service.

https://webnalist.com

###Embeding code
At the and of your html file, before *body* ending tag.
```js
<script>
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
</script>
```

###Optional advanced settings
```js
<script>
WN.options = {
     readArticleUrl: 'https://webnalist.com/articles/read/confirm',
     loadPricesUrl: 'https://webnalist.com/public/merchant/articles/prices.json',
     articleItemSelector: '.wn-item',
     priceSelector: '.wn-price',
     loadingClass: 'wn-loading', //class added to wn-price during prices loading
     articleUrlAttribute: 'data-wn-url',
     wrapperSelector: 'body',
     loadPrices: false //if true prices will be loading into wn-price
};
</script>
```

###Sample html list
Pay attention to: class="wn-item", class="wn-price", data-wn-url="..."
```html
<!--Advanced usage-->
<div class="demo-container">
    <ul>
        <li class="wn-item" data-wn-url="http://yourWebsite/yourArticle/1">
            <h2>Article #1 Title</h2>
            <p>Price: <span class="wn-price">...</span> zł</p>
            <a href="#">Read with Webnalist &raquo;</a>
        </li>
        <li class="wn-item" data-wn-url="http://yourWebsite/yourArticle/2">
            <h2>Article #2 Title</h2>
            <p>Price: <span class="wn-price">...</span> zł</p>
            <a href="#">Read with Webnalist &raquo;</a>
        </li>
        <li>
        ...
        </li>
    </ul>
</div>

<!--Simple usage-->
<a href="#" class="wn-item" data-wn-url="http://yourWebsite/yourArticle/1">
    Read with Webnalist &raquo;
</a>
```

###WebnalistPopup
![](https://github.com/webnalist/WebnalistFrontend/blob/master/assets/images/WebnalistPopup.png = 350x)

## Demo page

See the [Demo file](demo/index.html)