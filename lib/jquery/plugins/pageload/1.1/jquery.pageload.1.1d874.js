/**
 * jQuery PageLoad by Artlogic
 *
 * Copyright 2018, Artlogic Media Ltd, http://www.artlogic.net/
 */


(function($) {

    $.pageload = function(user_options) {
        // Options setup

        var options = {
            'splash_screen_enabled': false,
            'splash_screen_always_enabled': false,
            'splash_screen_cookie_expiry': 900,
            'splash_screen_click_to_close': false,
            'popup_content_enabled': false,
            'popup_content_force_open': false, // Force popup content to open in fallback mode - when you arrive directly on a page with content ordinarily opened in a popup
            'popup_content_update_url': true,
            'ajax_navigation_enabled': true,
            'disable_ajax_param': true, // Removes ajax post parameter from each page load, improves server performance enabling cached pages
            'development_mode': false,
            'development_mode_pause_splash_screen': false,
            'development_mode_show_splash_screen_on_refresh': false,
            'loader_orientation': 'width',
            'verbose': false,
            'content_area_selector': '#container_inner',
            'content_load_adjacent': false,
            'preloader_additional_html': '',
            'body_classes_to_retain_defaults': 'browser-js-enabled, first-load-complete, ajax-loading, page-transition-active, loader-active, overlay-visible, overlay-active, loader-incoming-type-standard, show-image-alt-tags, core-accessibility-stylesheet-checked, tabbing-listener-added, clicking-detected, website-editor-mode',
            'body_classes_to_retain': '',
            'url_params_to_retain_defaults': ['_cms-website-editor=1'],
            'url_params_to_retain': [],
            'splash_screen_primary_preload_images_selector': '#loader_logo', // Previously splash_logo_selector
            'splash_screen_secondary_preload_images_selector': '#preloader', // Previously splash_background_selector
            'splash_screen_delay_after_complete': 200,
            'splash_screen_auto_delays_enabled': true,
            'page_transition_delay': 600,
            'preload_images_selector': '',
            'popstate_custom_functions': {},
            'page_scroll_history': false,
            'destroy_after_load': function() {},
            'init_after_load': function() {
                if(window.galleries) {
                    window.galleries.init();
                }
                if(window.theme) {
                    window.theme.init();
                }
                if(window.cart) {
                    window.cart.init();
                }
                if (window.archimedes && typeof window.archimedes != 'undefined') {
                    window.archimedes.archimedes_core.init();
                }
                if(window.feature_panels) {
                    window.feature_panels.init();
                }
                if (window.modules && typeof window.modules != 'undefined') {
                    window.modules.init_all();
                }
                if(window.site) {
                    window.site.init();
                }
                try {
                    h.accessibility.init();
                } catch (error) {
                    console.log(error);
                }
                try {
                    h.accessibility.role_button();
                } catch (error) {
                    console.log(error);
                }
            },
            'before_load': function() {
                if ($('body').hasClass('navigation-open')) {
                    $('body').removeClass('navigation-open');
                    $('#top_nav_section').fadeOut(500);
                    $('#top_nav_section_reveal').removeClass('open');
                    $('#top_nav_section li').removeClass('show');
                }
            },
            'on_page_transition': function() {},
            'after_load_complete': function() {},
            'preloader_in': function() {},
            'splash_screen_in': function() {},
            'splash_screen_out': function() {},
            'popup_before': function() {},
            'popup_after': function() {},
            'popup_after_close': function() {},
            'page_transition_start': function() {},
            'page_transition_end': function() {}
        };
        $.extend(options, user_options);
        $.pageload.options = options;


        // Setup aliases

        $.pageload.load = function(element_href, pushstate, callback, navigation_type, element, page_scroll_top_value, incoming_content_type, inner_content_selector, post_data) {
            $.pageload.fn.pages.load(element_href, pushstate, callback, navigation_type, element, page_scroll_top_value, incoming_content_type, inner_content_selector, post_data);
        }

        $.pageload.refresh = function(element_context) {
            $.pageload.fn.pages.add_click_events(element_context);
        }

        $.pageload.popup_close = function(forced) {
            var forced = forced && typeof forced != 'undefined' ? true : false;
            $.pageload.fn.popup.close_popup(forced);
        }

        $.pageload.popup_open = function(content) {
            var content_exists = content && typeof content != 'undefined' ? true : false;
            if (content_exists) {
                $.pageload.fn.popup.open(content);
            }
        }


        // Functions

        $.pageload.fn = {

            init: function() {
                if ($.pageload.options.popup_content_enabled) {
                    $.pageload.fn.popup.init();
                }
                $.pageload.fn.preloader.init();
                $.pageload.fn.pages.init();
            },

            _fetchBackgroundImages: function(images_to_load_selector) {
                $(images_to_load_selector).length === 0 ? console.warn('images_to_load_selector returned none') : "";
                // Put background images in place to initiate load
                $(images_to_load_selector).each(function() {
                    if ($(this).filter('[data-style]').length) {
                        var new_style_value = $(this).attr('data-style');
                        if ($(this).attr('style') && typeof $(this).attr('style') != 'undefined') {
                            var new_style_value = new_style_value + $(this).attr('style');
                            // console.log(new_style_value);
                        }
                        $(this).attr('style', new_style_value);
                        $(this).removeAttr('data-style');
                    }
                });
            },


            _decryptContent: function(encryptedContent, salt) {

                if (!encryptedContent || !salt) {
                    console.info('_decryptContent - no encryptedcontent or salt.')
                    return '';
                }
                
                // Decode the base64 cacheData so we can separate iv and crypt text.
                var rawData = atob(encryptedContent);
                var iv = rawData.slice(0,16);
                var crypttext = rawData.slice(16);
                
                // Decrypt...
                var plaintextArray = CryptoJS.AES.decrypt(
                    { ciphertext: CryptoJS.enc.Latin1.parse(crypttext) },
                    CryptoJS.enc.Latin1.parse(salt),
                    { iv: CryptoJS.enc.Latin1.parse(iv) }
                );

                var decryptedContent = CryptoJS.enc.Utf8.stringify(plaintextArray);
                return decryptedContent;
            },


            _replace_main_content: function(originalContent, newContent){
                
                var regex = /([\s\S]*)<!--contentstart-->([\s\S]*)<!--contentend-->([\s\S]*)/gm;

                var m,
                preContent,
                mainContent,
                postContent;

                while ((m = regex.exec(originalContent)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach(function (match, groupIndex) {
                        if (groupIndex == 1) {
                            preContent = match;
                        } 
                        if (groupIndex == 2) {
                            mainContent = match;
                        } 
                        if (groupIndex == 3) {
                            postContent = match;
                        } 
                        // console.log(`Found match, group ${groupIndex}: ${match}`);
                    });
                }
                var result = preContent + newContent + postContent;
                return result;

            },

            preloader: {

                init: function() {
                    var preloader_html = '<div id="preloader"><div id="preloader_mask"></div>' + $.pageload.options.preloader_additional_html + '<div id="loader_wrapper"><div id="loader"></div></div><div id="loader_logo"></div></div>';

                    var first_page_load = $('body').hasClass('first-load-complete');
                    var internal_link = document.referrer && typeof document.referrer != 'undefined' ? true : false;
                    
                    
                    var load_type = '';
                    
                    if (!$.pageload.options.development_mode_show_splash_screen_on_refresh) {
                        if (typeof window.performance !== 'undefined' && typeof window.performance.getEntriesByType !== 'undefined') {
                            if (performance.getEntriesByType("navigation").length && typeof performance.getEntriesByType("navigation") !== 'undefined') {
                                if (performance.getEntriesByType("navigation")[0].type && typeof performance.getEntriesByType("navigation")[0].type != 'undefined') { 
                                    if (performance.getEntriesByType("navigation")[0].type == 'reload'){
                                        load_type = 'reload';
                                    }
                                }
                            }
                        }
                    }

                    var show_splash_screen = (($.pageload.options.splash_screen_always_enabled && !internal_link && load_type != 'reload') || ($.pageload.options.splash_screen_enabled && !h.getCookie('splash_screen_disabled') && load_type != 'reload' )); // (!h.getCookie('splash_screen_disabled'))
                    // Force splash screen in development mode
                    
                    if ($.pageload.options.development_mode || window.location.search == '?pageloaddevmode=1') {
                        var show_splash_screen = true;
                    }

                    // Only show the preloader on the first page load
                    if (!first_page_load) {
                        
                        if (!$('body').attr('data-pathname')) {
                            $('body').attr('data-pathname', window.location.pathname + window.location.search);
                        }
                        
                        $('body').attr('data-page-title', document.title);
                        if ($('body').find('#preloader').length === 0) {
                            //console.info("Splash screen loader via javascript");
                            $('body').append(preloader_html);
                        }
                        history.replaceState({'firstPageLoad': true}, null, window.location.pathname + location.search + window.location.hash);
                        if (show_splash_screen) {
                            // Show splash screen if its the very first page load, otherwise a cookie is set for 15 minutes and will stop the splash screen showing again during the same website visit
                            $.pageload.fn.preloader.start_load();
                        } else {
                            // If the splash screen is not displayed, only add the first-load-complete class to the body and don't fire the loader script
                            $.pageload.fn.preloader.start_load(true);
                        }
                    }

                    // Set a cookie so the splash screen doesn't show again in the same visit
                    h.setCookie('splash_screen_disabled', 'true', '', $.pageload.options.splash_screen_cookie_expiry); // Set cookie for 15 minutes

                },

                start_load: function(short_load) {
                    // debugger;
                    // Start loader
                    if (short_load) {
                        $('body').addClass('loader-active first-load-complete skip-splash-screen content-load-waiting');
                        $('body')
                            .addClass('loader-active ajax-links-disabled')
                            .delay(50)
                            .queue(function() {
                                $('body').addClass('ajax-loading ajax-initial-loading');
                                $(this).dequeue();
                            })
                        ;
                        $.pageload.fn.preloader.preload_images(short_load);
                    } else {
                        $('body').addClass('loader-active splash-loader-active content-load-waiting');
                        // debugger;
                        $.pageload.options.preloader_in();

                        $('#preloader')
                            .delay(20)
                            .queue(function() {
                                $(this).addClass('loading-start');
                                $(this).dequeue();
                                // debugger;
                            })
                            .delay($.pageload.options.splash_screen_auto_delays_enabled ? 200 : 0)
                            .queue(function() {
                                $(this).addClass('loading-bar-start');
                                $(this).dequeue();
                                // debugger;
                            })
                            .delay($.pageload.options.splash_screen_auto_delays_enabled ? 300 : 0)
                            .queue(function() {
                                $(this).dequeue();
                                $.pageload.fn.preloader.preload_images();
                                // debugger;
                            })
                        ;
                    }

                },

                preload_images: function(short_load) {

                    // Define the images/backgrounds which should be preloaded on first page load
                    // We preload the first two images of the hero slider, and the generic sidebar image for the full detail page of each record

                    var images_to_load_selector = $.pageload.options.preload_images_selector;

                    if ($(images_to_load_selector).length) {

                        // IMPORTANT: Images to be preloaded must be supplied as a selector string to the 'mutliple_elements' parameter.
                        // Otherwise if you use the normal method the script will go through each of the selector items individually and the 'progress' and 'done' callbacks will NOT be run in one single process.
                        // $('body').pageLoadwaitForImages({
                        //     waitForAll: true,
                        //     multiple_elements: images_to_load_selector
                        // });

                        // Check the logo image is loaded before displaying the splash screen.
                        // If there isn't a logo image it should fall through to done.

                        // Put logo image in place to initiate load
                        $.pageload.fn._fetchBackgroundImages($.pageload.options.splash_screen_primary_preload_images_selector);
                        $('body').pageLoadwaitForImages({
                            waitForAll: true,
                            multiple_elements: $.pageload.options.splash_screen_primary_preload_images_selector
                        }).done(function(e){
                            $('body').addClass('pageload-splash-primary-images-preloaded');
                            $($.pageload.options.splash_screen_primary_preload_images_selector).css('opacity', 1);

                            if ($.pageload.options.verbose) {
                                console.log('#########');
                                console.log('Preloading images:');
                            }
                            percentCounter = 0;
                            percentIncrements = (100 / $(images_to_load_selector).length);


                            // Put background images in place to initiate load
                            $.pageload.fn._fetchBackgroundImages(images_to_load_selector);
                            // console.log()

                            $('body').pageLoadwaitForImages({
                                    waitForAll: true,
                                    multiple_elements: images_to_load_selector
                                })
                                .progress(function(loaded, count, success) {
                                    percentIncrements = (100 / count);
                                    percentCounter = percentCounter + percentIncrements;
                                    var currentPercentage = percentCounter + '%';
                                    $('#loader').css($.pageload.options.loader_orientation, currentPercentage);
                                    // Connect stuff to the loader here!!!
                                    // var superpathPercentage = 327.86 * (Math.round(percentCounter) / 100);
                                    // $('.superpath').css('stroke-dashoffset', Math.round(327.86 - superpathPercentage));

                                    if ($.pageload.options.verbose) {
                                        console.log('#########');
                                        console.log('Status:');
                                        console.log(currentPercentage);
                                    }
                                })
                                .done(function() {
                                    if ($.pageload.options.verbose) {
                                        console.log('#########');
                                        console.log('Status:');
                                        console.log('complete');
                                    }

                                    $('#loader')
                                        .delay(500)
                                        .queue(function() {
                                            $.pageload.fn.preloader.load_complete(short_load);
                                            $(this).dequeue();
                                        })
                                    ;
                                });
                            ;

                            // Fade in the background image once it's finished downloading.
                            // Put logo image in place to initiate load
                            $.pageload.fn._fetchBackgroundImages($.pageload.options.splash_screen_secondary_preload_images_selector);
                            // This has no effect if the page content is loaded before the background image, this is by design!
                            $('body').pageLoadwaitForImages({
                                waitForAll: true,
                                multiple_elements: $.pageload.options.splash_screen_secondary_preload_images_selector
                            })
                            .done(function(e){
                                $('body').addClass('pageload-splash-secondary-images-preloaded');
                                $('#home_splash_image_container').css({
                                    'opacity': 1
                                });
                            });


                        });
                    } else {
                        // Fade in the background image once it's finished downloading.
                        // Put logo image in place to initiate load
                        $.pageload.fn._fetchBackgroundImages($.pageload.options.splash_screen_secondary_preload_images_selector);
                        // This has no effect if the page content is loaded before the background image, this is by design!
                        $('body').pageLoadwaitForImages({
                            waitForAll: true,
                            multiple_elements: $.pageload.options.splash_screen_secondary_preload_images_selector
                        })
                        .done(function(e){
                            $('body').addClass('pageload-splash-secondary-images-preloaded');
                            $('#bk-img-container').css('opacity', 1);
                            $('#home_splash_image_container').css({
                                'opacity': 1
                            });
                        });

                        $('#loader')
                            .delay($.pageload.options.splash_screen_auto_delays_enabled ? 100 : 0)
                            .queue(function() {
                                $(this).css($.pageload.options.loader_orientation, '100%');
                                $(this).dequeue();
                            })
                            .delay($.pageload.options.splash_screen_auto_delays_enabled ? 300 : 0)
                            .queue(function() {
                                $.pageload.fn.preloader.load_complete(short_load);
                                $(this).dequeue();
                            })
                        ;
                    }
                },

                load_complete: function(short_load) {
                    // Finish the preloader animations
                    if (short_load) {

                        $('body').removeClass('content-load-waiting skip-splash-screen');
                        $.pageload.fn.preloader.end_ajax();
                        
                    } else {
                        if (!$('body').hasClass('first-load-complete')) {
                            if ($.pageload.options.development_mode || $.pageload.options.splash_screen_click_to_close) {
                                $('#preloader').click(function() {
                                    $(this).dequeue();
                                });
                            }
                            $('#preloader')
                                .queue(function() {
                                    $(this).addClass('loading-complete');
                                    $('#loader').css($.pageload.options.loader_orientation, '100.1%'); // Important: Setting the width as 100.1 (or anything other than 100) forces CSS transitions to update if one has specifically been set for .loading-complete (e.g. we usually speed up the progress bar at the end)
                                    if (!$.pageload.options.development_mode) {
                                        $(this).dequeue();
                                    }
                                })
                                .delay($.pageload.options.splash_screen_auto_delays_enabled ? 400 : 0)
                                .queue(function() {
                                    $(this).addClass('loading-bar-end');
                                    $('#loader').css($.pageload.options.loader_orientation, '');
                                    if (!$.pageload.options.development_mode) {
                                        $(this).dequeue();
                                    }
                                })
                                .delay($.pageload.options.splash_screen_auto_delays_enabled ? 500 : 0)
                                .queue(function() {
                                    $(this).addClass('splash-screen-in');
                                    $.pageload.options.splash_screen_in();
                                    if (!$.pageload.options.development_mode && !$.pageload.options.development_mode_pause_splash_screen && !$.pageload.options.splash_screen_click_to_close) {
                                        $(this).dequeue();
                                    }
                                })
                                .delay($.pageload.options.splash_screen_click_to_close ? 0 : $.pageload.options.splash_screen_delay_after_complete)
                                .queue(function() {
                                    $('body').addClass('pageload-splash-page-content-in');
                                    $(this).dequeue();
                                })
                                .delay(400)
                                .queue(function() {
                                    $(this).addClass('splash-screen-out');
                                    $.pageload.options.splash_screen_out();
                                    $('body').removeClass('content-load-waiting');
                                    $('body').removeClass('pageload-splash-page-content-hidden');
                                    if (!$.pageload.options.development_mode) {
                                        $(this).dequeue();
                                    }
                                })
                                .delay(400)
                                .queue(function() {
                                    $('body').addClass('first-load-complete');
                                    $('body').removeClass('loader-active ajax-loading splash-loader-active pageload-splash-page-content-in');
                                    $(this).removeClass('loading-start loading-bar-start loading-complete loading-bar-end splash-screen-in splash-screen-out');
                                    $('#loader').css($.pageload.options.loader_orientation, '');
                                    $(this).dequeue();
                                })
                            ;
                        }
                    }

                    // After preload has completed, load the rest of the hero images (only the first 2 are preloaded)

                    $('#hero_slider .hero_item .image div[data-style]').each(function() {
                        $(this).attr('style', $(this).attr('data-style'));
                        $(this).removeAttr('data-style');
                    });
                    
                },

                start_ajax: function(clicked_element, incoming_content_type) {

                    var clicked_element = (clicked_element && typeof clicked_element != 'undefined' ? clicked_element : false);
                    
                    var assumed_incoming_content_type = 'standard'; // A class can be added to the original clicked element which allows us to assume the content type before it arrives, if this exists use it to add certain classes
                    var content_type_body_class = 'loader-incoming-type-standard';

                    if (incoming_content_type && typeof incoming_content_type != 'undefined') {
                        var assumed_incoming_content_type = incoming_content_type;
                    }

                    if (clicked_element) {
                        if (clicked_element.hasClass('pageload-link-type-ajax-enabled-content')) {
                            var assumed_incoming_content_type = 'inner';
                            var content_type_body_class = 'loader-incoming-type-inner';
                        } else if (clicked_element.hasClass('pageload-link-type-popup-enabled-content')) {
                            var assumed_incoming_content_type = 'popup';
                        }
                    }
                    
                    if (assumed_incoming_content_type == 'inner') {
                        var content_type_body_class = 'loader-incoming-type-inner';
                    } else if (assumed_incoming_content_type == 'popup') {
                        var content_type_body_class = 'loader-incoming-type-popup';
                    }

                    // Reset some things first, if the end of the last load has not completely finished
                    $('body').removeClass('loader-active ajax-loading-complete');
                    $(this).removeClass('loading-start loading-bar-start loading-complete loading-bar-end splash-screen-in splash-screen-out');
                    $('#loader').css($.pageload.options.loader_orientation, '');

                    // Start loading of new page
                    $('body')
                        .clearQueue()
                        .addClass('loader-active ajax-links-disabled page-transition-active ' + content_type_body_class)
                        .delay(50)
                        .queue(function() {
                            $('body').addClass('ajax-loading ajax-initial-loading');
                            $(this).dequeue();
                        })
                    ;
                    $.pageload.options.page_transition_start();
                    if (assumed_incoming_content_type == 'popup') {
                        $.pageload.options.popup_before();
                    }
                    $('body')
                        .clearQueue('pageload-disable-links')
                        .addClass('pageload-links-disabled-temporarily')
                        .delay(500, 'pageload-disable-links')
                        .queue('pageload-disable-links', function() {
                            $('body').removeClass('pageload-links-disabled-temporarily');
                            $(this).dequeue('pageload-disable-links');
                        })
                    ;


                },

                end_ajax: function() {
                    $('body')
                        .removeClass('ajax-initial-loading ajax-links-disabled pageload-links-disabled-temporarily')
                        .removeClass('page-transition page-transition2')
                        .queue(function() {
                            $('body').removeClass('page-transition ajax-loading').removeClass('page-transition2').addClass('ajax-loading-complete');
                            $(this).dequeue();
                        })
                        .delay(400)
                        .queue(function() {
                            $.pageload.options.page_transition_end();
                            $('body').removeClass('page-transition-active loader-active ajax-loading-complete loader-incoming-type-standard loader-incoming-type-inner loader-incoming-type-popup');
                            $(this).removeClass('complete4').removeClass('loading');
                            $('#loader').css($.pageload.options.loader_orientation, '');
                            $(this).dequeue();
                        })
                    ;

                }

            },

            popup: {
                
                settings: {
                    fallback_close_path: typeof $.pageload.fn != 'undefined' ? (typeof $.pageload.fn.popup.settings != 'undefined' ? (typeof $.pageload.fn.popup.settings.fallback_close_path != 'undefined' ? $.pageload.fn.popup.settings.fallback_close_path : '') : '') : ''
                },

                init: function() {
                    
                    // if the popup doesn't have a title with an id of 'popup_region' give a generic aria label of 'popup'
                    if ($('#popup_container #popup_region').length) {
                        var popup_region_aria_label = 'aria-labelledby="popup_region"'
                    } else {
                        var popup_region_aria_label = 'aria-label="modal"'
                    }

                    if (!$('#popup_container').length) {
                        $('body').append('<div id="popup_container"><div id="popup_overlay"></div><div id="popup_box"><div class="inner" role="dialog" aria-modal="true" aria-live="polite" ' + popup_region_aria_label + '><div id="popup_content"></div><div class="pagination_controls"><div class="previous pagination_controls_previous"><a href="#" role="button">Previous</a></div><div class="next pagination_controls_next"><a href="#" role="button">Next</a></div></div><div class="close"><a href="javascript:;" role="button">Close</a></div></div></div></div>');
                    }
                    
                    if ($('.site-popup-enabled-content').length) {
                        if ($.pageload.options.popup_content_force_open) {
                            var popup_content_html = $('.site-popup-enabled-content').html();
                            var forced_close_path = $('.site-popup-enabled-content').attr('data-pageload-popup-fallback-close-path');
                            
                            $('.site-popup-enabled-content').remove();
                            
                            $.pageload.popup_open(popup_content_html);
                            
                            $('body').addClass('site-popup-fallback-forced-open');
                            
                            if (forced_close_path && typeof forced_close_path != 'undefined') {
                                $.pageload.fn.popup.settings.fallback_close_path = forced_close_path;
                            } else {
                                $.pageload.fn.popup.settings.fallback_close_path = '/';
                            }
                        } else {
                            $('body').addClass('site-popup-fallback-mode');
                        }
                    } else {
                        if (!$('body').hasClass('page-popup-active')) {
                            $('body').removeClass('site-popup-fallback-mode site-popup-fallback-forced-open');
                        }
                    }

                    $('#popup_box .close').unbind('click.closefunction').bind('click.closefunction', function() {
                        $.pageload.fn.popup.close_popup();
                    });

                    $('#popup_overlay').click(function() {
                        $('#popup_box .close').trigger('click');
                    });

                },
                
                open: function(content) {
                    $('#popup_content').html(content);
                    $('html').addClass('page-popup-active');
                    $('body')
                        .clearQueue()
                        .addClass('page-popup-active')
                        .removeClass('ajax-initial-loading')
                        .delay(50)
                        .queue(function() {
                            $(this).addClass('page-popup-visible');
                            $(this).dequeue();
                        })
                    ;
                    $.pageload.fn.popup.after_load();
                    $.pageload.fn.preloader.end_ajax();
                },

                close_popup: function(forced) {
                    if (typeof pageload_xhr != 'undefined') {
                        pageload_xhr.abort('forced_abort');
                    }
                    var forced = forced && typeof forced != 'undefined' ? true : false;
                    if ($('body').hasClass('page-popup-force-close')) {
                        var forced = true;
                    }
                    
                    var forced_close_path = $.pageload.fn.popup.settings.fallback_close_path;
                    
                    if ($('body').hasClass('site-popup-fallback-forced-open') && forced_close_path && !forced) {

                            $.pageload.load(forced_close_path, true);
                        
                    } else {
                        if (!forced) {
                            $('body').addClass('page-popup-clicked-close');
                            if ($.pageload.options.popup_content_update_url){
                                window.history.back();
                            }
                        }
                        $('body')
                            .clearQueue()
                            .removeClass('page-popup-visible loader-incoming-type-popup')
                            .delay(600)
                            .queue(function() {
                                $.pageload.options.popup_after_close();
                                
                                // remove keyboard pagination listener
                                $(window).off('keydown.popup_pagination');
                                
                                //if (!$('body').hasClass('page-popup-force-close')) {
                                //    history.replaceState({'ajaxPageLoad': true}, null, $('body').attr('data-pathname'));
                                //}
                                
                                // change url used in seo edit screen
                                if ($('#cms-frontend-toolbar-seo-admin .seo-tools-btn').length) {
                                    $('#cms-frontend-toolbar-seo-admin .seo-tools-btn').attr("href", window.location.pathname)
                                    try {
                                        window.seo.init();
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                                if ($('#popup_box iframe').length > 0) {
                                    $('#popup_box iframe').remove();
                                }
                                $('html').removeClass('page-popup-active');
                                
                                //Return non-popup page title
                                var base_page_title = $('body').attr('data-page-title');
                                if (base_page_title && typeof base_page_title != 'undefined') {
                                    document.title = base_page_title;
                                } 
                                $(this).removeClass('page-popup-active page-popup-force-close page-popup-clicked-close');
                                $(this).dequeue();
                            })
                        ;
                        try {
                            h.accessibility.on_popup_closing();
                        }
                        catch(error) {
                            console.log(error);
                        }
                    }
                    
                    $.pageload.fn.popup.settings.fallback_close_path = '';

                },

                after_load: function() {

                    // Previous/Next buttons

                    $('#popup_box').delay(400).queue(function() {
                        $('body').removeClass('page-popup-transition-initial');
                        $(this).removeClass('popup-direction-left popup-direction-right');
                        $(this).dequeue();
                    });
                    
                    var link_suffix = '';
                    if (window.location.search != '') {
                        if (window.location.search.indexOf('?_preview_uid') == 0 || window.location.search.indexOf('?_cmspreview=1') == 0) {
                            var link_suffix = window.location.search;
                        }
                    }
                    var previous_link = $('#popup_content .pagination_controls .pagination_controls_prev a').attr('href');
                    var previous_clicked_element = $('#popup_content .pagination_controls .pagination_controls_prev a');
                    var next_link = $('#popup_content .pagination_controls .pagination_controls_next a').attr('href');
                    var next_clicked_element = $('#popup_content .pagination_controls .pagination_controls_next a');
                    
                    // Add language in front of link if it exists
                    if (window.archimedes.proxy_dir && typeof window.archimedes.proxy_dir != 'undefined' && previous_link && typeof previous_link != 'undefined' && !previous_link.startsWith(window.archimedes.proxy_dir + '/')) {
                        previous_link = window.archimedes.proxy_dir + previous_link;
                    }
                    if (window.archimedes.proxy_dir && typeof window.archimedes.proxy_dir != 'undefined' && next_link && typeof next_link != 'undefined' && !next_link.startsWith(window.archimedes.proxy_dir + '/')) {
                        next_link = window.archimedes.proxy_dir + next_link;
                    }

                    if (previous_link && typeof previous_link != 'undefined') {
                        $('#popup_box > .inner .pagination_controls .previous')
                            .unbind()
                            .attr('data-href', previous_link + link_suffix)
                            .removeClass('disabled')
                            .click(function() {
                                $('body').addClass('page-popup-transition-initial');
                                $('#popup_box').addClass('popup-direction-left');
                                
                                $.pageload.fn.pages.load($(this).attr('data-href'), false, null, null, previous_clicked_element, null, 'popup');
                                return false;
                            })
                        ;
                        $('#popup_box > .inner .pagination_controls .previous a').removeAttr("data-disabled aria-label").attr('tabindex', 0);
                    } else {
                        $('#popup_box > .inner .pagination_controls .previous').unbind().attr('data-href', '').addClass('disabled');
                        $('#popup_box > .inner .pagination_controls .previous a').attr({"data-disabled": true, "tabindex": -1, "aria-label": "disabled"});
                    }

                    if (next_link && typeof next_link != 'undefined') {
                        $('#popup_box > .inner .pagination_controls .next')
                            .unbind()
                            .attr('data-href', next_link + link_suffix)
                            .removeClass('disabled')
                            .click(function() {
                                $('body').addClass('page-popup-transition-initial');
                                $('#popup_box').addClass('popup-direction-right');
                                $.pageload.fn.pages.load($(this).attr('data-href'), false, null, null, next_clicked_element, null, 'popup');
                                return false;
                            })
                        ;
                        $('#popup_box > .inner .pagination_controls .next a').removeAttr("data-disabled aria-label").attr('tabindex', 0);
                    } else {
                        $('#popup_box > .inner .pagination_controls .next').unbind().attr('data-href', '').addClass('disabled');
                        $('#popup_box > .inner .pagination_controls .next a').attr({"data-disabled": true, "tabindex": -1, "aria-label": "disabled"});
                    }
                    
                    var popup_meta_title = $('.site-popup-enabled-content').attr('data-pageload-popup-meta-title');
                    if (popup_meta_title && typeof popup_meta_title != 'undefined') {
                        console.log('-------------------');
                        console.log(popup_meta_title);
                    } 

                    // Run functions required in the popup

                    $.pageload.options.popup_after();
                    
                    // Popup key listeners
                    
                    if ($('#popup_container .pagination_controls').length) {
                        var next_btn = $('#popup_container .pagination_controls .next').not('.disabled').eq(0);
                        var prev_btn = $('#popup_container .pagination_controls .previous').not('.disabled').eq(0);
                        
                        $(window).off('keydown.popup_pagination').on('keydown.popup_pagination', function(e) {
                            
                            // isTopPopup variable is to determine which popup is the current popup / top layered popup.
                            try {
                                var isTopPopup = h.accessibility.is_current_popup("#popup_box .inner");
                            } catch(error) {
                                var isTopPopup = true;
                            }
                            
                            if(e.keyCode == 39 && isTopPopup) {
                                if(next_btn.length ) {// right
                                    $(window).off('keydown.popup_pagination');
                                    next_btn.trigger('click');
                                }
                            } else if(e.keyCode == 37 && isTopPopup) {
                                if(prev_btn.length) {
                                    $(window).off('keydown.popup_pagination');
                                    prev_btn.trigger('click');
                                }
                            } 
						});
                    }
                    
                       
                    // Accessibility - add id for region label & focus on popup content
                    if ($('#popup_content .title:first').length) {
                        $('#popup_content .title:first').attr("id", "popup_region");
                    } else if ($('#popup_content .artist').length) {
                        $('#popup_content .artist').attr("id", "popup_region");
                    }
                    
                    try {
                        if ($("#popup_box.popup-direction-right").length || $("#popup_box.popup-direction-left").length) {
                            h.accessibility.focus_untrap();
                            h.accessibility.focus_trap('#popup_box .inner', false, '#popup_container .close');
                        } else {
                            h.accessibility.on_popup_opening('#popup_box .inner', '#popup_box .focustrap-first', '#popup_container .close');
                        }
                    }
                    catch(error) {
                        
                        console.log(error);
                        
                        // backup escape key functionality
                        $(window).off('keydown.popup_close');
                        if ($('#popup_container .close').length) {
                            $(window).on('keydown.popup_close', function(e) {
                                if(e.keyCode == 27) {
                                    $(window).off('keydown.popup_close');
                                    $('#popup_container .close').trigger('click');
                                }
                            });
                        }
                        
                    }
                    
                    // Set focus on popup inner container on open or next/previous
                    if ( $('#popup_box .inner:first').length ) {
                        $('#popup_box .inner:first').attr('tabindex', -1)[0].focus({preventScroll:true});
                    }
                    
                    try {
                        h.accessibility.role_button();
                    } catch (error) {
                        console.log(error);
                    }

                }

            },

            pages: {

                init: function() {

                    $.pageload.fn.pages.add_click_events();

                    if ($.pageload.options.page_scroll_history) {
                        // If page scroll history is enabled, block automatic browser scroll restoration until loading has completed
                        if ('scrollRestoration' in history) {
                            history.scrollRestoration = 'manual';
                        }
                    }

                    $(window).on("popstate", function (ev) {

                        if (ev.originalEvent.state) {
                            if (ev.originalEvent.state.ajaxPageLoad || ev.originalEvent.state.firstPageLoad) {
                                
                                var previous_page_url = ''
                                if ($.pageload.previous_url && typeof $.pageload.previous_url != 'undefined') {
                                    previous_page_url = $.pageload.previous_url.split('#')[0];
                                }
                                
                                var allow_hash_url = false;
                                if (previous_page_url && previous_page_url != window.location.pathname || ev.originalEvent.state.firstPageLoad) {
                                    allow_hash_url = true;
                                }
                                
                                if (!window.location.hash || typeof window.location.hash == 'undefined' || allow_hash_url) {
                                    // Tom: In development: check custom functions
                                    if (window.location.pathname in $.pageload.options.popstate_custom_functions) {
                                        var custom_function = $.pageload.options.popstate_custom_functions[window.location.pathname];
                                        custom_function(ev);
                                    } else if (($('body').hasClass('page-popup-active') || $('body').hasClass('page-popup-clicked-close')) && !$('body').hasClass('site-popup-fallback-forced-open')) {
                                        if (!$('body').hasClass('page-popup-force-close') && !$('body').hasClass('page-popup-clicked-close')) {
                                            $('body').addClass('page-popup-force-close');
                                            $('#popup_box .close').trigger('click');
                                        }
                                    } else {
                                        var page_scroll_top_value = 0;
                                        if ($.pageload.options.page_scroll_history && ev.originalEvent.state.scrollTop && typeof ev.originalEvent.state.scrollTop != 'undefined') {
                                            var page_scroll_top_value = ev.originalEvent.state.scrollTop;
                                        }
                                        $.pageload.fn.pages.load(window.location.pathname + window.location.search + window.location.hash, false, null, 'history_change', null, page_scroll_top_value);
                                    }
                                }
                            }
                        }
                    });

                    $(window).on("beforeunload", function(){
                        if ($.pageload.options.page_scroll_history) {
                            history.scrollRestoration = 'auto';
                        }
                    });

                },


                add_click_events: function(element_context) {
                    if (!element_context || typeof element_context == 'undefined') {
                        var element_context = '#container';
                    }
                    
                    if ($.pageload.options.ajax_navigation_enabled){
                        $('a', element_context).unbind('click.pageload').bind('click.pageload', function() {
                            
                            // For accessibility - tracks which element to refocus on
                            try {
                                h.accessibility.global_variables.element_to_refocus_to = $(this);
                            } catch(error) {
                                console.log(error);
                            }
                            
                            var element = $(this);
                            var element_href = $(this).attr('href');
                            
                            if (element_href) {
                                if (!$(this).hasClass('link-no-ajax') && !$(this).hasClass('page-load-within') && !$('body').hasClass('slider-drag') && element_href != '#' && element_href.indexOf('/') == 0 && (element_href.indexOf('#') < 0 || (element_href.indexOf('#') > -1 && element_href != window.location.pathname)) && element_href.indexOf('/custom_images/') < 0 && element_href.indexOf('/usr/') < 0 && element.attr('target') != '_blank') {
                                    // console.log(element_href);
                                    if ($('body').hasClass('pageload-links-disabled-temporarily')) {
                                        // Links temporarily disabled, this is to avoid double clicks making pages load twice
                                        return false;
                                    } else if ($('body').hasClass('ajax-links-disabled')) {
                                        // Already loading page content, we could also cancel the request and start a new one. Currently we are allowing standard navigation in this case.
                                    } else if ($('body').hasClass('website-editor-mode') && window.parent.website_editor && $.isFunction(window.parent.website_editor.init)) {
                                        
                                        function success_callback() {
                                            $.pageload.fn.pages.load(element_href, true, null, null, element);
                                        }
                                        window.parent.website_editor.warnings_and_notifications.check_for_unsaved_changes(success_callback);
                                        return false;
                                        
                                    } else {
                                        $.pageload.fn.pages.load(element_href, true, null, null, element);
                                        return false;
                                    }
                                } else if ($('body').hasClass('slider-drag')) {
                                    return false;
                                }
                            }
                        });
                    }

                },

                load: function(element_href, pushstate, callback, navigation_type, element, page_scroll_top_value, incoming_content_type, inner_content_selector, post_data) {
                    
                    $.pageload.options.before_load(element_href, pushstate, callback, navigation_type, element, page_scroll_top_value, incoming_content_type, inner_content_selector);
 
                    if (window.history.state && typeof window.history.state != 'undefined' && typeof window.history.state != 'null') {
                        var current_page_history_state = window.history.state;
                        var previous_page_scroll_top = $(window).scrollTop();
                        current_page_history_state['scrollTop'] = previous_page_scroll_top;
                        history.replaceState(current_page_history_state, null);
                    }
                    
                    if (element_href != '#' && element_href.indexOf('/') == 0 && (element_href.indexOf('#') < 0 || (element_href.indexOf('#') > -1 && element_href != window.location.pathname)) && (element_href.indexOf('/custom_images/') < 0 || element_href.indexOf('?') > -1 && element_href.indexOf('/custom_images/') > element_href.indexOf('?')) && element_href.indexOf('/usr/') < 0) {
                        if (element_href == '/') {
                            target_top_level = '[href="' + element_href + '"]';
                        } else {
                            if (typeof $(element).attr('data-original-url') != 'undefined') {
                                target_top_level = $(element).attr('data-original-url').split('/')[1];
                                target_top_level = '/' + target_top_level + '/';
                                target_top_level = '[data-original-url^="' + target_top_level + '"]';
                            } else {
                                target_top_level = element_href.split('/')[1];
                                target_top_level = '/' + target_top_level + '/';
                                target_top_level = '[href^="' + target_top_level + '"]';
                            }
                        }
                        $.pageload.fn.preloader.start_ajax(element, incoming_content_type);
                        
                        if ($.pageload.options.verbose) {
                            console.log('#########');
                            console.log('Starting page load:');
                            console.log(element_href);
                        }
                        
                        pageload_save_attempts = 0;
                        pageload_save_attempt_limit = 5;
                        
                        pageload_load_new_page = function(element_href) {
                            
                            var url_params_to_retain_defaults = $.pageload.options.url_params_to_retain_defaults;
                            var url_params_to_retain = $.pageload.options.url_params_to_retain;
                            var combined_list_of_url_params_to_retain = url_params_to_retain_defaults.concat(url_params_to_retain);
                            var current_path = window.location.pathname + window.location.search;
                            
                            if (combined_list_of_url_params_to_retain) {
                                var href_contains_params = false;
                                if (element_href.indexOf('?') >= 0) {
                                    href_contains_params = true;
                                }
                                
                                // Append params to be retained to element href
                                $.each(combined_list_of_url_params_to_retain, function( index, param_to_retain ) {
                                    if (current_path.indexOf(param_to_retain) >= 0) {
                                        if (element_href.indexOf(param_to_retain) < 0) {
                                            element_href += (href_contains_params ? '&' : '?') + param_to_retain;
                                            href_contains_params = true;
                                        }
                                    }
                                });
                            }
                            
                            var post_params = {};
                            var load_method = 'GET';
                            
                            if (post_data) {
                                load_method = 'POST';
                                post_params = post_data;
                            }
                            
                            if (!$.pageload.options.disable_ajax_param) {
                                post_params['ajax'] = true;
                            }
                            
                            pageload_xhr = $.ajax({
                                url: element_href,
                                data: post_params,
                                method: load_method,
                                cache: true,
                                dataType: 'html',
                                error: function(e) {
                                    var error_status_code = e.status;
                                    var load_attempt_limit_reached = pageload_save_attempts >= pageload_save_attempt_limit ? true : false;
                                    if (e.statusText == 'forced_abort') {
                                        // User forced the request to be cancelled, dont show an error
                                        $.pageload.fn.preloader.end_ajax();
                                    } else {
                                        if (String(error_status_code) == '0') {
                                            window.location.href = element_href;
                                        } else if (String(error_status_code) != '404' && !load_attempt_limit_reached) {
                                            // Retry loading after a timeout
                                            window.setTimeout(function() {
                                                pageload_load_new_page(element_href);
                                            },500);
                                        } else {
                                            // When load attempts have been exchausted or if it the error is a 404
                                            h.alert('Sorry, that page could not be loaded. Please try again later.');
                                            $.pageload.fn.preloader.end_ajax();
                                        }
                                        pageload_save_attempts = pageload_save_attempts + 1;
                                    }
                                },
                                success: function(new_page_html) {
                                    if (new_page_html) {
                                        if ($.pageload.options.verbose) {
                                            console.log('#########');
                                            console.log('PAGE LOAD COMPLETE');
                                        }
    
                                        new_page_html = new_page_html;
                                        
                                        var body_classes_remembered = ''
                                        function add_to_body_classes_remembered(classes) {
                                            additional_classes_to_remember = classes.split(',');
                                            for (i = 0; i < additional_classes_to_remember.length; i++) {
                                                var classname = $.trim(additional_classes_to_remember[i]).replace('.', '');
                                                if ($('body').hasClass(classname)) {
                                                    body_classes_remembered += ' ' + classname;
                                                }
                                            }
                                        }
                                        
                                        if ($.pageload.options.body_classes_to_retain_defaults) {
                                            add_to_body_classes_remembered($.pageload.options.body_classes_to_retain_defaults);
                                        }
                                        if ($.pageload.options.body_classes_to_retain) {
                                            add_to_body_classes_remembered($.pageload.options.body_classes_to_retain);
                                        }
    
                                        if (false) {
                                            // DEPRICATED STYLE
                                            new_page_title = (new_page_html.match(/<title>(.*?)<\/title>/) ? new_page_html.match(/<title>(.*?)<\/title>/)[1] : '');
                                            new_page_body_class = (new_page_html.match(/body class=\"(.*?)\"/) ? new_page_html.match(/body class=\"(.*?)\"/)[1] : '') + ' ' + body_classes_remembered;
                                            new_page_html = new_page_html.replace(/data-style=/g, 'style=');
                                            new_page_html_body = $.parseHTML('<div id="ajax_container">' + new_page_html.replace(/^[\S\s]*<body[^>]*?>/i, "").replace(/<\/body[\S\s]*$/i, "") + '</div>');
                                        }
    
                                        // Create 'parsed' version of the incoming HTML so we can interact as a jQuery object
                                        new_page_html_parsed = $.parseHTML(new_page_html);
                                        // Change instances of 'data-style' to 'style' so we can preload these images later on
                                        new_page_html = new_page_html.replace(/data-style=/g, 'style=');
    
                                        // Grab the title of the new page
                                        new_page_title = $(new_page_html_parsed).filter('title').text();
    
                                        // Grab the canonical of the new page
                                        var new_page_canonical = $(new_page_html_parsed).filter('link[rel="canonical"]').attr('href');
    
                                        if (new_page_canonical){
                                            if ($('link[rel="canonical"]').length){
                                                // Amend the skin's existing canonical tag to match the new page canonical
                                                $('link[rel="canonical"]').attr('href', new_page_canonical);
                                            } else {
                                                // The skin doesn't have a canonical tag so let's add one
                                                $('head').append('<link rel="canonical" href="'+new_page_canonical+'">')
                                            }
                                        }
                                        else {
                                            // The new page doesn't have a canonical set so let's remove the tag from the skin
                                            $('link[rel="canonical"]').remove();
                                        }
    
                                        // Grab the robots of the new page
                                        var new_page_robots = $(new_page_html_parsed).filter('meta[name="robots"]').attr('content');
                                        if (new_page_robots){
                                            if ($('meta[name="robots"]').length){
                                                // Amend the skin's existing robots tag to match the new page canonical
                                                $('meta[name="robots"]').attr('content', new_page_robots);
                                            } else {
                                                // The skin doesn't have a robots tag so let's add one
                                                $('head').append('<meta name="robots" content="'+new_page_robots+'">')
                                            }
                                        } else {
                                            // The new page doesn't have a robot set so let's remove the tag from the skin
                                            $('meta[name="robots"]').remove();
                                        }
                                        
                                        // Grab meta objects and replicate on this page
                                        $(new_page_html_parsed).filter('meta[property]').each(function() {
                                            var meta_property_attr = $(this).attr('property');
                                            var meta_content_attr = $(this).attr('content');
                                            if (meta_property_attr && typeof meta_property_attr != 'undefined' && typeof meta_content_attr != 'undefined') {
                                                $('meta[property="' + meta_property_attr + '"]').attr('content', meta_content_attr);
                                            }
                                        });
    
                                        // Grab the body classes of the new page
                                        new_page_body_class = (new_page_html.match(/body class=\"(.*?)\"/) ? new_page_html.match(/body class=\"(.*?)\"/)[1] : '') + ' ' + body_classes_remembered;
    
                                        // Parse the body of the new page HTML so we can interact with it with jQuery
                                        new_page_html_body = $.parseHTML('<div id="ajax_container">' + new_page_html.replace(/^[\S\s]*<body[^>]*?>/i, "").replace(/<\/body[\S\s]*$/i, "") + '</div>');
    
                                        if (new_page_html_body.length > 1) {
                                            // This is to fix an issue where more than one element was being returned by new_page_html_body - #ajax_container is the only element we want. Other elements included comment tags.
                                            new_page_html_body = $(new_page_html_body).filter('#ajax_container');
                                        }
    
                                        // Find the container_inner of the new page content
                                        new_page_main_content = $($.pageload.options.content_area_selector, new_page_html_body).html();
    
                                        if (typeof new_page_main_content == 'undefined') {
                                            // Force the page to reload if the main content area has not been found
                                            window.location.href = element_href;
                                            return false;
                                        }
                                            
                                            
                                        if (new_page_main_content.indexOf('cachedata') > -1) {
                                            
                                            var protected_path_data = localStorage.getItem('protected_paths_access') ? JSON.parse(localStorage.getItem('protected_paths_access')) : false;
                                            var check_type = 'localstorage'; // Options: 'localstorage', 'backend'
                                            if (protected_path_data) {    
                                                if (typeof protected_path_data[$('#protected_path_login_form', new_page_html_body).attr('data-protected-path-id')] != 'undefined') {
                                                    
                                                    var access_token = protected_path_data[$('#protected_path_login_form',new_page_html_body).attr('data-protected-path-id')]['access_token'];
                                                    var private_area_access_key = protected_path_data[$('#protected_path_login_form',new_page_html_body).attr('data-protected-path-id')]['private_area_access_key'];
                                                    var uid = protected_path_data[$('#protected_path_login_form',new_page_html_body).attr('data-protected-path-id')]['uid'];
                                                }
                                            }
                                            var cacheData = $('#cachedata', new_page_html_body).val()
                                            var salt = private_area_access_key;
                                            var decryptedContent = $.pageload.fn._decryptContent(cacheData, salt)
                                            
                                            //REPLACE EVERYWHERE
                                            if (decryptedContent.indexOf('protected page access allowed') > 0) {
                                                $('#cachedata', new_page_main_content).replaceWith(decryptedContent)
                                                $('#cachedata', new_page_html_body).replaceWith(decryptedContent)
                                                new_page_main_content = $.pageload.fn._replace_main_content(new_page_main_content, decryptedContent);
                                            } else {
                                                console.error('Encrypted content - access forbidden');
                                            }
                                            
                                        }
    
    
                                        if (new_page_main_content.indexOf('pageload-force-hard-reload') > -1) {
                                            
                                            // Force the page to reload on location change
                                            window.location.href = element_href;
                                            
                                        } else {
                                            // Find out if the content of the new page is popup enabled content (popup mode)
                                            new_page_popup_mode_enabled = new_page_main_content.indexOf('site-popup-enabled-content') > -1; // Seemed to slow performance: $(new_page_main_content).find('.site-popup-enabled-content').length;
                                            new_page_popup_content = (new_page_popup_mode_enabled ?  $('.site-popup-enabled-content', new_page_html_body).html() : '');
    
    
                                            // Find out if the content of the new page can be displayed 'within' the current page (e.g. inner mode)
                                            new_page_inner_mode_enabled = new_page_main_content.indexOf('site-ajax-enabled-inner-content') > -1; // $(new_page_main_content).find('.site-ajax-enabled-inner-content').length;
                                            new_page_inner_content = (new_page_inner_mode_enabled ?  $('.site-ajax-enabled-inner-content', new_page_html_body).html() : '');
                                            
                                            
                                            // Forced 'inner' mode coming directly from external param passed to load event
                                            if (incoming_content_type == 'inner') {
                                                if (inner_content_selector && typeof inner_content_selector != 'null' && typeof inner_content_selector != 'undefined') {
                                                    //If custom selector is supplied, check for this and load
                                                    new_page_inner_mode_enabled = $(new_page_main_content).find(inner_content_selector).length;
                                                    new_page_inner_content = (new_page_inner_mode_enabled ?  $(inner_content_selector, new_page_html_body).html() : '');
                                                } else {
                                                    //Otherwise load entire page
                                                    new_page_inner_mode_enabled = true;
                                                    new_page_inner_content = (new_page_inner_mode_enabled ?  $(new_page_html_body).html() : '');
                                                }
                                            } 
    
                                            new_page_requires_protection = new_page_body_class.indexOf('page-requires-frontend-protection') > -1;
                                            new_page_protection_login = (new_page_requires_protection ?  $('#protected_path_login', new_page_html_body).wrap('<div>').parent().html() : '');
                                            
                                            // Preload images for new page
                                            images_to_load_selector = $.pageload.options.preload_images_selector;
        
                                            // Wait for the images to load
                                            if ($(images_to_load_selector, new_page_html_body).length) {
                                                if ($.pageload.options.verbose) {
                                                    console.log('#########');
                                                    console.log('Preloading images:');
                                                }
        
                                                percentCounter = 0;
                                                percentIncrements = (100 / $(images_to_load_selector, new_page_html_body).length);
        
                                                // IMPORTANT: Images to be preloaded must be supplied as a selector string to the 'mutliple_elements' parameter.
                                                // Otherwise if you use the normal method the script will go through each of the selector items individually and the 'progress' and 'done' callbacks will NOT be run in one single process.
        
                                                $(new_page_html_body).pageLoadwaitForImages({
                                                        waitForAll: true,
                                                        multiple_elements: images_to_load_selector
                                                    })
                                                    .progress(function(loaded, count, success) {
                                                        percentIncrements = (100 / count);
                                                        percentCounter = percentCounter + percentIncrements;
                                                        var currentPercentage = percentCounter + '%';
                                                        $('#loader').css($.pageload.options.loader_orientation, currentPercentage);
        
                                                        if ($.pageload.options.verbose) {
                                                            console.log('#########');
                                                            console.log('Status:');
                                                            console.log(currentPercentage);
                                                        }
                                                    })
                                                    .done(function() {
                                                        if ($.pageload.options.verbose) {
                                                            console.log('#########');
                                                            console.log('Status:');
                                                            console.log('complete');
                                                        }
                                                        $.pageload.fn.preloader.load_complete();
                                                        $.pageload.fn.pages.after_load(new_page_title, new_page_body_class, new_page_html_body, new_page_main_content, new_page_popup_content, target_top_level, element_href, new_page_popup_mode_enabled, new_page_inner_mode_enabled, new_page_inner_content, callback, pushstate, navigation_type, page_scroll_top_value, new_page_requires_protection, new_page_protection_login, new_page_html);
                                                    })
                                                ;
                                            } else {
                                                // No images to preload
                                                if ($.pageload.options.verbose) {
                                                    console.log('#########');
                                                    console.log('No images to load');
                                                }
                                                setTimeout(function() {
                                                    $('#loader').css($.pageload.options.loader_orientation, '100%');
                                                    $.pageload.fn.preloader.load_complete();
                                                    $.pageload.fn.pages.after_load(new_page_title, new_page_body_class, new_page_html_body, new_page_main_content, new_page_popup_content, target_top_level, element_href, new_page_popup_mode_enabled, new_page_inner_mode_enabled, new_page_inner_content, callback, pushstate, navigation_type, page_scroll_top_value, new_page_requires_protection, new_page_protection_login, new_page_html);
                                                }, 100);
                                            }
    
                                        }
                                    }
                                }
                            });
                        };
                        
                        // Start loading new page
                        pageload_load_new_page(element_href);
                    }

                },

                after_load: function(new_page_title, new_page_body_class, new_page_html_body, new_page_main_content, new_page_popup_content, target_top_level, element_href, new_page_popup_mode_enabled, new_page_inner_mode_enabled, new_page_inner_content, callback, pushstate, navigation_type, page_scroll_top_value, new_page_requires_protection, new_page_protection_login, new_page_html) {

                    // Show new page content
                    
                    if (new_page_popup_mode_enabled && !$('body').hasClass('site-popup-fallback-mode')) { // Skip this step if we are on a full page where the content usually opens as popup content, continue to open in fallback mode - not in a popup

                        // Popup mode content
                        
                        if ($('body').hasClass('page-popup-active')) {
                            // If a popup is already open
                            if ($.pageload.options.popup_content_update_url ){
                                history.replaceState({'ajaxPageLoad': true}, null, element_href);
                            }
                            $('body')
                                .addClass('page-popup-transition')
                                .delay(400)
                                .queue(function() {
                                    $('#popup_content').html(new_page_popup_content);
                                    $.pageload.fn.popup.after_load();
                                    $.pageload.fn.preloader.end_ajax();
                                    $(this).addClass('page-popup-transition2');
                                    $(this).dequeue();
                                })
                                .delay(10)
                                .queue(function() {
                                    $(this).removeClass('page-popup-transition page-popup-transition2');
                                    $(this).dequeue();
                                })
                            ;
                            // change url used in seo edit screen
                            if ($('#cms-frontend-toolbar-seo-admin .seo-tools-btn')) {
                                $('#cms-frontend-toolbar-seo-admin .seo-tools-btn').attr("href", element_href)
                                try {
                                    window.seo.init();
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        } else {
                            // If there is no existing popup, open a new one
                            if ($.pageload.options.popup_content_update_url ){
                                $.pageload.previous_url = element_href;
                                history.pushState({'ajaxPageLoad': true}, null, element_href);
                            }
                            // Open the popup
                            $.pageload.fn.popup.open(new_page_popup_content);
                            // change url used in seo edit screen
                            if ($('#cms-frontend-toolbar-seo-admin .seo-tools-btn')) {
                                $('#cms-frontend-toolbar-seo-admin .seo-tools-btn').attr("href", element_href)
                                if (window.seo && typeof window.seo != 'undefined') {
                                    window.seo.init();
                                }
                            }
                        }
                        
                        if (new_page_title) {
                            document.title = new_page_title;
                        }
                        
                        $.pageload.fn.pages.track_pageview(element_href);

                    } else if (new_page_inner_mode_enabled && callback) {

                        // Inner ajax content mode

                        callback(new_page_inner_content, element_href, new_page_main_content);

                        $('body')
                            .clearQueue()
                            .removeClass('ajax-initial-loading')
                            .delay(10)
                            .queue(function() {
                                $(this).dequeue();
                            })
                        ;

                        $.pageload.fn.preloader.end_ajax();
                        
                        if (pushstate) {
                            $.pageload.previous_url = element_href;
                            history.pushState({'ajaxPageLoad': true}, null, element_href);
                        }

                        $.pageload.fn.pages.track_pageview(element_href);

                    } else {

                        // Standard page content
                        if (callback && typeof callback != 'null' && typeof callback != 'undefined') {
                            callback();
                        }


                        if ($.pageload.options.content_load_adjacent) {
                            // Content load adjacent loads the content into a duplicate element which is appended after the current element
                            // This allows two pages to be visible at the same time and transition between them
                                // Unbind all events
                                $.pageload.options.destroy_after_load();
                                $(window).unbind();
                                $('#container *, #cms-frontend-toolbar *').unbind().off();
                            
                            // Clone and build the new objects
                                var cloned_content_area = $($.pageload.options.content_area_selector).get(0).cloneNode();
                                $($.pageload.options.content_area_selector).addClass('pageload-old-content-area');
                                $($.pageload.options.content_area_selector).after(cloned_content_area);
                                $($.pageload.options.content_area_selector).filter(':eq(1)').html(new_page_main_content).addClass('pageload-new-content-area');

                            // Initialise everything again
                                $.pageload.options.init_after_load();

                            // Do the page transition
                                setTimeout(function() {
                                    
                                    $.pageload.options.on_page_transition();
                                    $('body')
                                        .clearQueue()
                                        .addClass('page-transition')
                                        .removeClass('ajax-initial-loading')
                                        .delay($.pageload.options.page_transition_delay)
                                        .queue(function() {
                                            $(this).addClass('page-transition2');
                                            $(this).dequeue();
                                        })
                                    ;
                                }, 50);

                            setTimeout(function() {
                                $($.pageload.options.content_area_selector).filter(':eq(0)').remove();
                                $($.pageload.options.content_area_selector).removeClass('pageload-new-content-area');
                            }, $.pageload.options.page_transition_delay);
                        }

                        if (navigation_type == 'history_change') {
                            // If navigation_type has been set as 'history_change', instantly show the content
                            $('body')
                                .clearQueue()
                                .removeClass('ajax-initial-loading')
                            ;
                        } else {
                            // If navigation_type has been set as default, show the page transition effects
                            if (!$.pageload.options.content_load_adjacent) {
                                $.pageload.options.on_page_transition();
                                $('body')
                                    .clearQueue()
                                    .addClass('page-transition')
                                    .removeClass('ajax-initial-loading')
                                    .delay($.pageload.options.page_transition_delay)
                                    .queue(function() {
                                        $(this).addClass('page-transition2');
                                        $(this).dequeue();
                                    })
                                ;
                            }
                        }

                        setTimeout(function() {
                            
                            // Scroll page to top
                            $('html,body').animate(
                                {scrollTop: 0},
                                0,
                                'easeInOutQuad'
                            );

                            if (!$.pageload.options.content_load_adjacent) {
                                // This is done earlier with this option

                                // Unbind all events
                                $.pageload.options.destroy_after_load();
                                $(window).unbind();
                                $('#container *, #cms-frontend-toolbar *').unbind().off();
                            }

                            // Destroy jQuery plugin instances
                            $('#slideshow ul, #ig_slideshow, .lists ul li .panel_image_slideshow').cycle('destroy');

                            // Update CMS toolbar
                            $('#cms-frontend-toolbar').html($('#cms-frontend-toolbar', new_page_html_body).html());
                            
                            // init axe accessibility audit
                            try {
                                h.accessibility.axe_automatic_audit()
                            } catch(error) {
                                console.log(error);
                            }
                            
                            $('#top_nav.navigation ul li').removeClass('active');
                            $('#top_nav.navigation ul li a').removeAttr('aria-label');
                            $('#top_nav.navigation ul li a' + target_top_level + '').parent().addClass('active');
                            var nav_label = $('#top_nav.navigation ul li a' + target_top_level + '').text();
                            $('#top_nav.navigation ul li a' + target_top_level + '').attr('aria-label', ( nav_label + ' (current nav item)' ));
                            
                            

                            if ($('body').hasClass('page-transition')) {
                                new_page_body_class = new_page_body_class + ' page-transition';
                            }
                            $('body').attr('class', new_page_body_class);
                            
                            if (!$.pageload.options.content_load_adjacent) {
                                // Adjacent pageload will add the content in an alternative way, see above 
                                if ($($.pageload.options.content_area_selector).length) {
                                    // console.log('CHANGING HTML')
                                    $($.pageload.options.content_area_selector).html(new_page_main_content).css('margin-top', '');
                                } else {
                                    
                                    // Content area does not exist, try to force load the page manually
                                    window.location.href = element_href;
                                }
                            }
                            
                            // If the page requires protection, add the login form
                            
                            if (new_page_requires_protection) {
                                $('body').append(new_page_protection_login);
                            } else {
                                if (new_page_body_class.indexOf('page-requires-protection') < 0) {
                                    $('#protected_path_login').remove();
                                }
                            }

                            if (pushstate) {
                                $.pageload.previous_url = element_href;
                                history.pushState({'ajaxPageLoad': true}, null, element_href);
                            }
                            
                            if (new_page_title) {
                                document.title = new_page_title;
                            }
                            
                            // Grab pathname data attribute from new page and update it
                            var new_page_pathname = (new_page_html.match(/data-pathname=\"(.*?)\"/) ? new_page_html.match(/data-pathname=\"(.*?)\"/)[1] : '')
                            if (new_page_pathname) {
                                $('body').attr('data-pathname', new_page_pathname);
                            } else {
                                $('body').attr('data-pathname', window.location.pathname + window.location.search);
                            }
                            
                            $('body').attr('data-page-title', document.title);
                            
                            if (!$.pageload.options.content_load_adjacent) {
                                // This is done earlier with this option
                                $.pageload.options.init_after_load();
                            }

                            if (window.cms_toolbar) {
                                window.cms_toolbar.init();
                            }

                            $.pageload.options.after_load_complete();

                            if (!$('body').hasClass('site-generic-overlay-fallback-mode')) {
                                $('#overlay-close').trigger('click');
                            }
                            
                            // Scroll page to top
                            $('html,body').animate(
                                {scrollTop: 0},
                                0,
                                'easeInOutQuad'
                            );

                            $(window).trigger('resize');

                            $('html,body').scrollTop(page_scroll_top_value);

                            $.pageload.fn.preloader.end_ajax();

                            $.pageload.fn.pages.track_pageview(element_href);


                        }, ($.pageload.options.page_transition_delay));
                    }


                },

                track_pageview: function(element_href) {

                    // Track pageview with Analytics if it is installed

                    if (window._gaq || window.ga) {
                        if (window.ga) {
                            // Universal analytics
                            ga('send', 'pageview', element_href);
                            // Send tracker2 pageview if a secondary tracker has been installed
                            ga('tracker2.send', 'pageview', element_href);
                            ga('tracker3.send', 'pageview', element_href);
                            ga('artlogic_tracker.send', 'pageview', element_href);
                        } else if (window._gaq) {
                            // Legacy analytics
                            _gaq.push(['_trackPageview', element_href]);
                        }
                    }
                    
                    // Track pageview with Facebook Pixel if it is installed

                    if (typeof window.fbq != 'undefined') {
                        if (window.fbq) {
                            fbq('track', 'PageView');
                        }
                    }
                }

            }
        };


        // Initialise function

        //$(window).ready(function() {
            $.pageload.fn.init();
        //});

    };

})(window.jQuery);




/**
 * jQuery PageLoadWaitForImages
 *
 * Copyright 2016, Artlogic Media Ltd, http://www.artlogic.net/
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS / nodejs module
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    // Namespace all events.
    var eventNamespace = 'pageLoadwaitForImages';

    // CSS properties which contain references to images.
    $.pageLoadwaitForImages = {
        hasImageProperties: [
            'backgroundImage',
            'listStyleImage',
            'borderImage',
            'borderCornerImage',
            'cursor'
        ],
        hasImageAttributes: ['srcset']
    };

    // Custom selector to find all `img` elements with a valid `src` attribute.
    $.expr[':']['has-src'] = function (obj) {
        // Ensure we are dealing with an `img` element with a valid
        // `src` attribute.
        return $(obj).is('img[src][src!=""]');
    };

    // Custom selector to find images which are not already cached by the
    // browser.
    $.expr[':'].uncached = function (obj) {
        // Ensure we are dealing with an `img` element with a valid
        // `src` attribute.
        if (!$(obj).is(':has-src')) {
            return false;
        }

        return !obj.complete;
    };

    $.fn.pageLoadwaitForImages = function () {

        var allImgsLength = 0;
        var allImgsLoaded = 0;
        var deferred = $.Deferred();

        var finishedCallback;
        var eachCallback;
        var waitForAll;
        var multiple_elements;

        // Handle options object (if passed).
        if ($.isPlainObject(arguments[0])) {

            multiple_elements = arguments[0].multiple_elements;
            waitForAll = arguments[0].waitForAll;
            eachCallback = arguments[0].each;
            finishedCallback = arguments[0].finished;

        } else {

            // Handle if using deferred object and only one param was passed in.
            if (arguments.length === 1 && $.type(arguments[0]) === 'boolean') {
                waitForAll = arguments[0];
            } else {
                finishedCallback = arguments[0];
                eachCallback = arguments[1];
                waitForAll = arguments[2];
            }

        }

        // Handle missing callbacks.
        finishedCallback = finishedCallback || $.noop;
        eachCallback = eachCallback || $.noop;

        // Convert waitForAll to Boolean
        waitForAll = !! waitForAll;

        // Ensure callbacks are functions.
        if (!$.isFunction(finishedCallback) || !$.isFunction(eachCallback)) {
            throw new TypeError('An invalid callback was supplied.');
        }

        this.each(function () {
            // Build a list of all imgs, dependent on what images will
            // be considered.
            if (multiple_elements) {
                // If the 'multiple_elements' parameter has been suplied, use this, otherwise use the original element specified
                var obj = $(multiple_elements, this);
            } else {
                var obj = $(this);
            }
            var allImgs = [];
            // CSS properties which may contain an image.
            var hasImgProperties = $.pageLoadwaitForImages.hasImageProperties || [];
            // Element attributes which may contain an image.
            var hasImageAttributes = $.pageLoadwaitForImages.hasImageAttributes || [];
            // To match `url()` references.
            // Spec: http://www.w3.org/TR/CSS2/syndata.html#value-def-uri
            var matchUrl = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

            if (waitForAll) {;
                // Get all elements (including the original), as any one of
                // them could have a background image.
                obj.find('*').addBack().each(function () {
                    var element = $(this);
                    // If an `img` element, add it. But keep iterating in
                    // case it has a background image too.

                    if (element.is('img:has-src') &&
                        !element.is('[srcset]')) {
                        allImgs.push({
                            src: element.attr('src'),
                            element: element[0]
                        });
                    }

                    $.each(hasImgProperties, function (i, property) {
                        var propertyValue = element.css(property);
                        var match;
                        // If it doesn't contain this property, skip.
                        if (!propertyValue) {
                            return true;
                        }

                        // Get all url() of this element.
                        while (match = matchUrl.exec(propertyValue)) {
                            allImgs.push({
                                src: match[2],
                                element: element[0]
                            });
                        }
                    });

                    $.each(hasImageAttributes, function (i, attribute) {
                        var attributeValue = element.attr(attribute);
                        var attributeValues;

                        // If it doesn't contain this property, skip.
                        if (!attributeValue) {
                            return true;
                        }

                        allImgs.push({
                            src: element.attr('src'),
                            srcset: element.attr('srcset'),
                            element: element[0]
                        });

                    });

                });
            } else {
                // For images only, the task is simpler.
                obj.find('img:has-src')
                    .each(function () {
                    allImgs.push({
                        src: this.src,
                        element: this
                    });
                });
            }

            window.setTimeout(function() {
                allImgsLength = allImgs.length;
                allImgsLoaded = 0;


                if (allImgsLength === 0) {
                    finishedCallback.call(obj[0]);
                    deferred.resolveWith(obj[0]);
                }

                $.each(allImgs, function (i, img) {

                    var image = new Image();
                    var events =
                      'load.' + eventNamespace + ' error.' + eventNamespace;

                    // Handle the image loading and error with the same callback.
                    $(image).one(events, function me (event) {
                        // If an error occurred with loading the image, set the
                        // third argument accordingly.
                        var eachArguments = [
                            allImgsLoaded,
                            allImgsLength,
                            event.type == 'load'
                        ];
                        allImgsLoaded++;

                        eachCallback.apply(img.element, eachArguments);
                        deferred.notifyWith(img.element, eachArguments);

                        // Unbind the event listeners. I use this in addition to
                        // `one` as one of those events won't be called (either
                        // 'load' or 'error' will be called).
                        $(this).off(events, me);

                        if (allImgsLoaded == allImgsLength) {
                            finishedCallback.call(obj[0]);
                            deferred.resolveWith(obj[0]);
                            return false;
                        }

                    });

                    if (img.srcset) {
                        image.srcset = img.srcset;
                    }
                    image.src = img.src;
                });
            }, 0);
        });

        return deferred.promise();

    };
}));
