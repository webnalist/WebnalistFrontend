# WebnalistFrontend
WebnalistFrontend Merchant Library

This library enables the processing of WebnalistPayment using remote account model.
User don't need to be logged in Merchant service.

https://webnalist.com

##Optional advanced settings
```js
<script>
    var WN = WN || {};
    WN.options = {
         readArticleUrl: 'https://webnalist.com/articles/read/confirm',
         loadPricesUrl: 'https://webnalist.com/public/merchant/articles/prices.json',
         articleItemSelector: '.wn-item',
         articleItemLoadedClass: 'wn-item-loaded',
         priceSelector: '.wn-price',
         loadingClass: 'wn-loading', //class added to wn-price during prices loading
         articleUrlAttribute: 'data-wn-url',
         wrapperSelector: 'body',
         noPriceLabel: '--',
         loadPrices: false //if true prices will be loading into wn-price
    };
</script>
```

##Embeding code
At the and of your html file, before *body* ending tag.
```js
<script src="../webnalist.min.js"></script>
```

##Public WN methods
```js
    WN.formatPrice();
    WN.getArticlesPrices(); //useful at get prices for ajax loaded articles 
```

##Sample html list
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

##WebnalistPopup
![](https://github.com/webnalist/WebnalistFrontend/blob/master/assets/images/WebnalistPopup.png)

## References
* Works together with [WebnalistBackend](https://github.com/webnalist/WebnalistBackend)
* See the [Demo file](demo/index.html)