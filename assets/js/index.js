;"use strict";
document.addEventListener("DOMContentLoaded", function () {
    /*=====================================================
        post loading
    =====================================================*/
    var nextLink, nextPageUrl, loadMoreButton, endMessage;
    nextLink = document.querySelector('link[rel=next]');
    var paginationWrap = document.getElementById('pagination-wrap');
    loadMoreButton = document.getElementById('load-more');
    if( nextLink !== null) {
        btnText = loadMoreButton.innerText;
        nextPageUrl = nextLink.getAttribute('href');
    }
    if( typeof(nextPageUrl) == 'undefined') {
        if(paginationWrap !== null) {
            loadMoreButton.style.display = 'none';
        }
    }
    else {
        loadMoreButton.addEventListener('click', function (e) {
            e.preventDefault();
            loadMoreButton.classList.add('loading');
            loadMoreButton.disabled = true;
            if(parseInt(nextPage) <= parseInt(totalPages)){
                var url = nextPageUrl.split(/page/)[0] + 'page/' + nextPage + '/';
                fetch(url)
                .then(function (response) {
                    if(response.ok) {
                        return response.text();
                    }
                })
                .then(function(data) {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data;
                    var wrapper = document.querySelector('.js-post-list-wrap');
                    var html = tempDiv.querySelectorAll('.post-card');
                    for(var i=0; i < html.length; i++) {
                        wrapper.appendChild(html.item(i));
                    }
                    nextPage++;
                    loadMoreButton.classList.remove('loading');
                    loadMoreButton.disabled = false;
                    if(nextPage> totalPages) {
                        loadMoreButton.style.display = 'none';
                    }
                });
            }
        });
    };
    /*=====================================================
        responsive embed
    =====================================================*/
    reframe('iframe:not([src*="soundcloud"]):not([src*="spotify"]):not(.no-resize)');
    /*=====================================================
    image gallery
    =====================================================*/
    var images = document.querySelectorAll('.kg-gallery-image img');
    images.forEach(function (image) {
        var container = image.closest('.kg-gallery-image');
        var width = image.attributes.width.value;
        var height = image.attributes.height.value;
        var ratio = width / height;
        container.style.flex = ratio + ' 1 0%';
    });
    mediumZoom('.kg-image-card img, .kg-gallery-image img', {
        margin: 30
    });
    /*=====================================================
        Responsive table
    =====================================================*/
    var tables = document.querySelectorAll('table');
    if (tables.length > 0) {
        tables.forEach(function(table) {
            var wrapper = document.createElement('div')
            wrapper.classList.add('table-responsive');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        })
    };
    /*=====================================================
        Search
    =====================================================*/
    var searchOpen = document.querySelectorAll('.js-search-button');
    var searchPopup = document.querySelector('.js-search-popup');
    var searchClose = document.getElementById('search-close');
    var searchInput = document.getElementById('search-input');
    var searchResult = document.getElementById('search-results');
    var suggestedTags = document.getElementById('suggested-tags');

    if( typeof apiKey !== 'undefined' && apiKey != null && searchInput != null ) {
            searchOpen.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                searchPopup.classList.add('visible');
                document.body.classList.add('search-opened');
                window.setTimeout(function() {
                    searchInput.focus();
                }, 200);
            })
        });
        var searchinGhost = new SearchinGhost({
            key: apiKey,
            inputId: ['search-input'],
            outputId: ['search-results'],
            outputChildsType: 'div',
            limit: 50,
            postsFields: ['title', 'url', 'excerpt', 'custom_excerpt', 'published_at'],
            postsExtraFields: ['tags'],
            template: function(post) {
                var o = '';
                o += '<a href="' + post.url + '"><div class="content">';
                o += '<h3 class="title h5"><span>' + post.title + '</span></h3> <div class="meta">';
                o += '<time>' + post.published_at + '</time></div></div></a>';
                return o;
            },
            onSearchEnd: function(posts) {
                if (searchResult.scrollHeight > searchResult.offsetHeight) {
                    searchResult.style.paddingRight = "8px";
                } else {
                    searchResult.style.paddingRight = "0px";
                }
                if (searchResult.innerHTML == '') {
                    suggestedTags.classList.remove('hidden')
                } else {
                    suggestedTags.classList.add('hidden')

                }
            }
        });
        document.addEventListener('keyup', function(e){
            if (e.keyCode == 27 && searchPopup.classList.contains('visible') && document.body.classList.contains('search-opened')) {
                closeSearch();
            }
        });
        searchInput.addEventListener('keyup', function(e){
            if (e.keyCode == 27) {
                closeSearch();
            }
        });
        searchClose.addEventListener('keyup', function(e){
            if (e.keyCode == 13) {
                closeSearch();
            }
        });
        searchClose.addEventListener('keyup', function(e){
            if (e.keyCode == 13) {
                closeSearch();
            }
        });
        searchPopup.onclick = closeSearch;
        searchClose.onclick = closeSearch;
        function closeSearch(e) {
            
            if (e !== undefined  && e.target !== e.currentTarget ) {
                return;
            }
            searchPopup.classList.toggle('visible');
            document.body.classList.toggle('search-opened');
            searchInput.value = '';
            searchResult.innerHTML = '';
            suggestedTags.classList.remove('hidden')
        }
    }
    /*=====================================================
    Disqus lazy load
    =====================================================*/
    var disqusContainer =document.querySelector('.disqus-comment-wrap');
    if(disqusContainer) {
        var disqusOptions = {
            scriptUrl: '//' + disqus_shortname + '.disqus.com/embed.js',
            laziness: 1,
            throttle: 1000,
            disqusConfig: function(){
                this.page.url = pageUrl;
                this.page.identifier = pageIdentifier;
                this.callbacks.onReady = [function() {
                    var placeholder = document.querySelector( '.comment-placeholder' );
                    placeholder.classList.add( 'is-hidden' );
                }];
            }
        };
        disqusLoader( '.disqus-comment-wrap', disqusOptions );
    }
    /*=====================================================
    Toggle dark/light
    =====================================================*/
    var toggleBtn = document.querySelectorAll('.js-toggle-dark-light');
    var html = document.documentElement;
    toggleBtn.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var defaultMode = html.getAttribute('data-theme');
            if (defaultMode !== null && defaultMode === 'dark') {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('selected-theme', 'light');
            } else {
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('selected-theme', 'dark');
            }
        });
    })
    /*=====================================================
        A simple throttle function
    =====================================================*/
    function CustomThrottle(func, limit) {
        var lastFunc, lastRan;
        return function () {
            var context = this, args = arguments;
            if (!lastRan) {
                func.apply(context, args)
                lastRan = Date.now()
            } else {
                clearTimeout(lastFunc)
                lastFunc = setTimeout(function () {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args)
                        lastRan = Date.now()
                    }
                }, limit - (Date.now() - lastRan))
            }
        }
    }
    /*=====================================================
        sticky nav
    =====================================================*/
    // var html = document.documentElement;
    var navType = document.body.getAttribute('data-nav');
    var header = document.querySelector('.site-header');
    if(typeof(header) !== undefined && header !== null && navType === 'sticky') {
        window.addEventListener('scroll', CustomThrottle(function(){
            var currScroll = window.pageYOffset;
            if (currScroll > 1) {
                header.classList.add("small");
            } else {
                header.classList.remove("small");
            };
        }, 50));
    }
    /*=====================================================
        subscribe-notifications
    =====================================================*/
    // Parse the URL parameter
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    // Give the parameter a variable name
    var action = getParameterByName('action');
    var stripe = getParameterByName('stripe');
    var success = getParameterByName('success');
    if (action == 'subscribe') {
        showNotification('notification-subscribe');
    }
    if (action == 'signin') {
        if(success == "true") {
            showNotification('notification-signin');
        } else {
            showNotification('notification-signin-error');
        }
    }
    if (action == 'signup') {
        if(success == "true") {
            showNotification('notification-signup');
        } else {
            showNotification('notification-signup-error');
        }
    }
    if (action == 'checkout') {
        showNotification('notification-signup');
    }
    if (stripe == 'success') {
        window.location = '/account/?action=checkout-success';
    }
    if (stripe == 'cancel') {
        showNotification('notification-checkout-cancel');
    }
    if (action == 'checkout-success') {
        showNotification('notification-checkout');
    }
    if (stripe == 'billing-update-success') {
        showNotification('notification-billing-update');
    }
    if (stripe == 'billing-update-cancel') {
        showNotification('notification-billing-update-cancel');
    }

    function showNotification(notificationClass) {
        var notification = document.querySelector('.'+notificationClass);
        notification.classList.add('visible');
        var closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.classList.remove('visible');
            cleanTheUri();
        })
    }
    function cleanTheUri() {
        var uri = window.location.toString();
        if (uri.indexOf("?") > 0) {
            var cleanUri = uri.substring(0, uri.indexOf("?"));
            window.history.replaceState({}, document.title, cleanUri);
        }
    }
    // form notifications
    var formNotifications=document.querySelectorAll('.form-notification');
    formNotifications.forEach(function(notification){
        var closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            document.querySelectorAll('[data-members-form]').forEach(function(el){
                el.classList.remove('success');
                el.classList.remove('error');
            })
        })
    });
    /*=====================================================
        Add tweet this link to all Blockquote 
    =====================================================*/
    if(typeof tweetBtn !== 'undefined' && tweetBtn === true) {
        // select direct child blockquote and has no class
        var quotes = document.querySelectorAll('.post-content > blockquote:not([class])');
        if(quotes.length >0) {
            var tweetableUrl = "";
            var tweetThisBtn = null;
            var currentPageUrl = window.location.href;
            quotes.forEach(function(quote) {
                 tweetableUrl = 'https://twitter.com/share?text=' + encodeURIComponent(quote.innerText) + '&url=' + currentPageUrl;
                tweetThisBtnWrap = document.createElement('div');
                tweetThisBtnWrap.classList.add('tweet-quote-wrap');
                tweetThisBtn = document.createElement('a');
                tweetThisBtn.classList.add('tweet-quote-link');
                tweetThisBtn.innerHTML = TweetQuoteText;
                tweetThisBtn.setAttribute("href", tweetableUrl);
                tweetThisBtn.addEventListener('click', openTweetWindow);
                tweetThisBtnWrap.appendChild(tweetThisBtn);
                quote.after(tweetThisBtnWrap);
            })
        }
        function openTweetWindow(e) {
            e.preventDefault();
            window.open(
                e.target.closest('a').getAttribute('href'),
                'twitter-share', 
                'width=580,height=296'
            );
        }
    }
    /*=====================================================
        copy link to clipboard
    =====================================================*/
    var clipboard  = new ClipboardJS('.js-copy-link');
    var copyNotification = document.querySelector('.js-notification-copy-link');
    clipboard.on('success', function(e) {
        copyNotification.classList.add('visible');
        setTimeout(function(){
            copyNotification.classList.remove('visible');
        }, 10000);
    
        e.clearSelection();
    });
});