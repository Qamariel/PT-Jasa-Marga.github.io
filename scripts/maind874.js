(function($) {

	window.cart.cart_summary.update_callback = function() {
        if ($('#store_cart_widget').length) {
            var original_sub_total = $('#store_cart_widget .scw_total_price_amount_with_vat').text();
            if (original_sub_total != '' && typeof original_sub_total != 'undefined') {
                var new_sub_total = original_sub_total.replace('.00', '');
                $('#store_cart_widget .scw_total_price_amount_with_vat').text(new_sub_total);
            }
        }
    };

    window.cart.cart_summary.quick_cart_widget_open_callback = function() {
        $('#container_outer').removeClass('scrolling-down');
    };
    window.cart.wishlist_summary.quick_wishlist_cart_widget_open_callback = function() {
        $('#container_outer').removeClass('scrolling-down');
    };

    

    window.site = {

        init: function() {
			
            if (false) {

                setTimeout(function() {

                    $('body').addClass('page-transition-active');

                    setTimeout(function() {
                        $('body').addClass('page-transition');
                    }, 100);
                    setTimeout(function() {
                        $('body').addClass('page-transition-custom');
                    }, 1000);

                }, 300);

                return;
            }


			window.site.device.init();
            window.site.pageload.init();
            window.site.setup();




        },

        setup: function() {
            window.site.home.init()
            window.site.list_preview.init();
            window.site.horizontal_scroller.init();
            window.site.artworks.init();
            window.site.layout.init();
            window.site.video.init();
            window.site.slideshow.init();
            window.site.scroll.init();
            window.site.overlays.init();
            window.site.lazy_load.init();
            window.site.artlogic_inview.init();
            window.site.social_media.init();
            window.site.mailing_list_form.init();
            window.site.enquiry.init();
            window.site.quick_enquiry.init();
            window.site.forms.init();
            window.site.tracking.init();
            window.site.store.init();
            window.site.misc.init();
            window.site.artists.init();
            window.site.exhibitions.init();
            window.site.filters.init();

            window.site.objectfit_polyfill.init();

            if (window.location.pathname == '/whats-on/') {
                if (window.location.hash == '#forthcoming') {
                    if ($('section[data-label="Forthcoming"]').length) {
                        $('html,body').animate(
                            {scrollTop: $('section[data-label="Forthcoming"]').offset().top - 50},
                            800,
                            'easeInOutExpo'
                        );
                        
                    }
                }
                if (window.location.hash == '#past') {
                    if ($('section[data-label="Archive"]').length) {
                        $('html,body').animate(
                            {scrollTop: $('section[data-label="Archive"]').offset().top - 50},
                            800,
                            'easeInOutExpo'
                        );
                        
                    }
                }
            }
        },

        home: {

            canvas_effect_enabled: false,

            init: function() {
                window.site.home.setup();
            },

            start_slideshow_pre_init: function() {
                if (window.site.device.canvas_enabled()) {
                    if (window.window.canvasSlideshowInitialized) {
                        window.canvasSeekVideo(0, 0);
                        window.canvasStopEffect(4);
                    }
                }
            },

            start_slideshow: function(run_pre_init) {
                run_pre_init = typeof run_pre_init != 'undefined' ? run_pre_init : true;
                $('#main_slideshow').each(function() {
                    cycle_before(false, false, false, $('#main_slideshow .slide:eq(0)'), false);
                    if (!$('#main_slideshow').hasClass('slideshow-paused-by-default')) {
                        $('#main_slideshow').cycle('resume');
                    }

                    if (window.site.device.canvas_enabled()) {
                        if (window.window.canvasSlideshowInitialized) {
                            window.canvasSlideshowChange(0);
                        }
                    }

                    $('body').addClass('main_slideshow_active');
                    
                    setTimeout(function() {
                        if (run_pre_init) {
                            window.site.home.start_slideshow_pre_init();
                        }
                        $('body').addClass('main_slideshow_animate');
                    }, 400, run_pre_init);
                });
            },

            setup: function() {

                // Slideshow init

                $('body').removeClass('main_slideshow_active main_slideshow_animate');

                $('#homepage_overall_container').each(function() {
                    
                    // Vertical slider type only

                        if ($('#homepage_overall_container.slideshow-vertical').length ) {
                            $('#homepage_overall_container.slideshow-vertical').on('wheel', function(event) {
                                //if (!window.site.device.handheld()) {
                                    if (!$('#main_slideshow_nav').hasClass('slide-changing')) {
                                        var delta = (!event.deltaY || typeof event.deltaY == 'undefined' ? 0 : event.deltaY) || (!event.deltaX || typeof event.deltaX == 'undefined' ? 0 : event.deltaX);
                                        var direction = (delta < -1 ? 'up' : (delta > 1 ? 'down': ''));
                                        $('#main_slideshow').cycle('pause');
                                        if (direction == 'up') {
                                            change_slide('previous');
                                        }
                                        if (direction == 'down') {
                                            change_slide('next');
                                        }
                                    }
                                //}
                                event.preventDefault();
                            });
                        }

                    // Canvas / pixi init

                    if (window.site.device.canvas_enabled()) {

                        // Only initialize the canvas if it is supported by the device and appropriate for the size
                        
                        if ($('#canvas_wrapper_background').length && !$('#canvas_wrapper_background').hasClass('initialized')) {
                        
                            if (true) {
                                // Normal method

                                    $('#canvas_wrapper_background').addClass('initialized')

                                    var slides = $('#main_slideshow .slide');
                                    var spriteImages = slides.find('.image');
                                    var spriteImagesSrc = [];
                                    var texts = [];
                                    spriteImages.each(function() {
                                        var src = false;
                                        if ($(this).find('video source').length) {
                                            var src = $(this).find('video source').attr('src');
                                        } else {
                                            var src = $(this).find('img').attr('src');
                                        }
                                        spriteImagesSrc.push(src);
                                    });
                                    var initCanvasSlideshow = new CanvasSlideshow({
                                        slides: slides,
                                        sprites: spriteImagesSrc,
                                        displacementImage: '/images/dmaps/clouds.jpg',
                                        autoPlay: window.site.home.canvas_effect_enabled ? true : false,
                                        autoPlaySpeed: [4, 3],
                                        displaceScale: [5000, 10000],

                                                displaceScale: window.site.home.canvas_effect_enabled ? [1000, 1000] : [0, 0],

                                        displaceScaleTo: [400, 400],
                                        displaceScaleTo: [0, 0],

                                        //displacementImage: '/images/dmaps/pointilize.jpg',
                                        //displaceScale: [30, 30],
                                        //displaceScaleTo: [0,0],
                                        //autoPlaySpeed: [12, 12],

                                        fullScreen: true,
                                        interactive: window.site.home.canvas_effect_enabled ? true : false,
                                        interactionEvent: 'hover', // 'click', 'hover', 'both'
                                        displaceAutoFit: false,
                                        centerSprites: true,
                                        dispatchPointerOver: true // restarts pointerover event after click
                                    });

                                    // Get canvas ready for the stage
                                    if (window.site.home.canvas_effect_enabled) {
                                        window.canvasStartEffect(0);
                                    }

                            } else {
                                // Blob method
                                // Testing a vimeo cross origin workaround


                                    var req = new XMLHttpRequest();
                                    var video_url = $('#main_slideshow video source').attr('src');
                                    req.open('GET', video_url, true);
                                    req.responseType = 'blob';
                                    req.onload = function() {
                                        // Onload is triggered even on 404
                                        // so we need to check the status code
                                        if (this.status === 200) {
                                            // Video is now downloaded
                                            // and we can set it as source on the video element
                                            var videoBlob = this.response;
                                            var vid = URL.createObjectURL(videoBlob);
                                            
                                            var spriteImagesSrc = [vid];

                                            var slides = $('#main_slideshow .slide');
                                            /*var spriteImages = slides.find('.image');
                                            var spriteImagesSrc = [];
                                            var texts = [];
                                            spriteImages.each(function() {
                                                var src = false;
                                                if ($(this).find('video source').length) {
                                                    var src = $(this).find('video source').attr('src');
                                                } else {
                                                    var src = $(this).find('img').attr('src');
                                                }
                                                spriteImagesSrc.push(src);
                                            });*/
                                            var initCanvasSlideshow = new CanvasSlideshow({
                                                slides: slides,
                                                sprites: spriteImagesSrc,
                                                displacementImage: '/images/dmaps/clouds.jpg',
                                                autoPlay: window.site.home.canvas_effect_enabled ? true : false,
                                                autoPlaySpeed: [4, 3],
                                                displaceScale: [5000, 10000],

                                                displaceScale: window.site.home.canvas_effect_enabled ? [1000, 1000] : [0, 0],

                                                displaceScaleTo: [400, 400],
                                                displaceScaleTo: [0, 0],

                                                //displacementImage: '/images/dmaps/pointilize.jpg',
                                                //displaceScale: [30, 30],
                                                //displaceScaleTo: [0,0],
                                                //autoPlaySpeed: [12, 12],

                                                fullScreen: true,
                                                interactive: window.site.home.canvas_effect_enabled ? true : false,
                                                interactionEvent: 'hover', // 'click', 'hover', 'both'
                                                displaceAutoFit: false,
                                                centerSprites: true,
                                                dispatchPointerOver: true // restarts pointerover event after click
                                            });


                                            // Get canvas ready for the stage
                                            if (window.site.home.canvas_effect_enabled) {
                                                window.canvasStartEffect(0);
                                            }

                                        } else {
                                            // Error loading video
                                        }
                                    }
                                    req.onerror = function() {
                                        // Error loading video
                                        
                                    }
                                    req.send();

                            }
                        } else {
                            // Canvas already initialized, re-start first video
                            window.canvasPlayVideo(0);
                            window.addHoverEvents();
                        }
                        
                    } else {
                        // Device doesn't support this functionality, enable the fallback mode
                        $(this).addClass('device-canvas-fallback-mode');
                    }


                    // Setup each slide (non-canvas)

                    if ($('#main_slideshow .slide', this).length == 1) {
                        $(this).addClass('cycle-single-slide');
                    }
                    if ($('#homepage_overall_container').hasClass('device-canvas-fallback-mode')) {
                        // If in fallback mode, play all the videos to force them to load
                        $('#main_slideshow .slide video').each(function() {
                            $(this).get(0).play();
                        });
                    }


                    $('#main_slideshow .slide', this).each(function() {
                        if ($('a', this).length) {
                            $('.content, .image, .image_hover_area', this).css('cursor', 'pointer').click(function() {
                                $(this).closest('.slide').find('a').trigger('click');
                            });
                        }
                        var character_length = $('.faux_h1 .text_animate', this).text().length;
                        var character_size_factor = character_length * 0.44;
                        var character_size_factor = (character_size_factor < 3.4 ? 3.4 : character_size_factor);
                        var content_width = '80vw';

                        var calc_string = 'calc(' + content_width + ' / ' + character_size_factor + ')';
                        var calc_string_line_height = 'calc(' + content_width + ' / ' + (character_size_factor * 1.2) + ')';

                        var letter_spacing_factor = character_size_factor - (character_length * 0.5);
                        var letter_spacing = '-' + letter_spacing_factor + 'px';

                        $('.faux_h1', this).css({'font-size': calc_string, 'height': calc_string_line_height, 'letter-spacing': letter_spacing});
                    });

                    cycle_end = function(next_slide_index) {
                        // Change image in the canvas element
                        if (!$('#homepage_overall_container').hasClass('cycle-single-slide')) {
                            if (next_slide_index && typeof next_slide_index != 'undefined') {
    
                            } else {
                                // assume it is the next slide
                                next_slide_index = parseInt($('#main_slideshow .slide.cycle-slide-active').attr('data-index')) + 1;
                                if (next_slide_index > $('#main_slideshow .slide').length) {
                                    next_slide_index = 1;
                                }
                            }
    
                            if (!$('#homepage_overall_container').hasClass('device-canvas-fallback-mode')) {
                                if (window.window.canvasSlideshowInitialized) {
                                    window.canvasSlideshowChange(next_slide_index-1);
                                }
                            }
                            $('#main_slideshow').addClass('slide-changing');
    
                            //$('.cycle-slide.cycle-slide-active').find('.text_animate').textillate('out');
                            $('#main_slideshow, .scroll-container').addClass('slide-end');
                            $('#main_slideshow, .scroll-container').removeClass('slide-active');
                        }
                    }

                    cycle_before = function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {

                        this_index = $(incomingSlideEl).attr('data-index');
                        this_color = $(incomingSlideEl).attr('data-color');

                        $('#main_slideshow').removeClass('slide-changing');

                        $('#main_slideshow_nav li').removeClass('active');
                        $('#main_slideshow_nav li[data-index="' + this_index + '"]').addClass('active');

                        $('#main_slideshow_progress .number').text('0' + this_index);
                        $('#main_slideshow_pagination .number').text('0' + this_index);

                        if (outgoingSlideEl) {
                            $('.text_animate', outgoingSlideEl).textillate('out');
                        }

                        $('body').removeClass('color1 color2 color3 color4 color5 color6')

                        $('#main_slideshow, .scroll-container').removeClass('slide-begin slide-begin2 slide-active');
                        $('#main_slideshow, .scroll-container').removeClass('slide-end');

                        $('#main_slideshow video').each(function() {
                            $(this).get(0).pause();
                        });

                        // Play simple video if in non-canvas fallback mode

                        if ($('#homepage_overall_container').hasClass('device-canvas-fallback-mode')) {
                            if ($('video', incomingSlideEl).length) {
                                $('video', incomingSlideEl).get(0).play();
                            }
                        }

                        // Note: textillate text needs to be brough in at this point because it will flicker if delayed
                        $('.pre-title .text_animate', incomingSlideEl).textillate('in');

                        var slideshow_delay = 4700;
                        if (cycle_timeout_type == 'short') {
                            // If the short version has been initialised (mobile devices) shorten the delay
                            var slideshow_delay = 1700;
                        }

                        $('#main_slideshow')
                            .stop().clearQueue()
                            .animate({'display':'block'}, 10, function() {
                                $('#main_slideshow, .scroll-container').addClass('slide-active');
                                $('body').addClass(this_color);
                            })
                            .animate({'display':'block'}, 400, function() {
                                $('#main_slideshow, .scroll-container').addClass('slide-begin');
                                $('body').addClass(this_color);
                            })
                            .animate({'display':'block'}, 10, function() {
                                $('#main_slideshow, .scroll-container').addClass('slide-begin2');
                            })
                            .animate({'display':'block'}, slideshow_delay, function() {

                            })
                            .animate({'display':'block'}, 1000, function() {
                                if (!$('#main_slideshow').hasClass('cycle-paused')) {
                                    cycle_end();
                                }
                            })
                        ;
                    }

                    var cycle_timeout = 6620;
                    cycle_timeout_type = 'standard';
                    if (window.site.device.breakpoint() <= 2) {
                        var cycle_timeout = 3620;
                        cycle_timeout_type = 'short';
                    }

                    var cycle_settings = {
                        fx:       'fade',
                        speed:    1,
                        timeout:  cycle_timeout,
                        paused:    false,
                        slides: '>',
                        autoHeight: false,
                        swipe: true
                    };
                    $('#main_slideshow').unbind().cycle(cycle_settings);
                    $('#main_slideshow').on('cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
                        cycle_before(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag);
                    });
                    if (true || $('#main_slideshow >').length == 1 || $('#main_slideshow').hasClass('cycle-paused') || $('#main_slideshow').hasClass('slideshow-paused-by-default')) {
                        $('#main_slideshow').cycle('pause');
                        $('#main_slideshow_progress').addClass('paused');
                    }

                    $('#main_slideshow_pagination .prev').unbind().click(function() {
                        $('#main_slideshow').cycle('pause');
                        change_slide('previous');
                    });
                    $('#main_slideshow_pagination .next').unbind().click(function() {
                        $('#main_slideshow').cycle('pause');
                        change_slide('next');
                    });

                    $('#main_slideshow_progress .pause').click(function() {
                        if (!$('#main_slideshow').hasClass('cycle-paused')) {
                            $('#main_slideshow').cycle('pause');
                            $('#main_slideshow_progress').addClass('paused');
                        } else {
                            $('#main_slideshow').cycle('resume');
                            $('#main_slideshow').stop().clearQueue();
                            cycle_end();
                            $('#main_slideshow_nav')
                                .stop().clearQueue()
                                .animate({'display':'block'}, 800, function() {
                                    $('#main_slideshow').cycle('next');
                                    $('#main_slideshow_nav').removeClass('slide-changing');
                                })
                            ;
                            $('#main_slideshow_progress').removeClass('paused');
                        }
                    });

                    var total_slides = $('#main_slideshow >').length;
                    $('#main_slideshow_progress .total').text('0' + total_slides);
                    $('#main_slideshow_pagination .total').text('0' + total_slides);

                    $('#main_slideshow_nav li')
                        .click(function() {
                            $('#main_slideshow').cycle('pause');
                            if (!$(this).hasClass('active') && !$('#main_slideshow_nav').hasClass('slide-changing')) {
                                $('#main_slideshow_nav').addClass('slide-changing');
                                slide_index = $(this).attr('data-index');
                                cycle_end();
                                $(this).addClass('active');
                                $('#main_slideshow').cycle('pause');
                                $('#main_slideshow_nav')
                                    .stop().clearQueue()
                                    .animate({'display':'block'}, 500, function() {
                                        $('#main_slideshow').cycle(parseInt(slide_index) -1);
                                        $('#main_slideshow_nav').removeClass('slide-changing');
                                    })
                                ;
                            }
                        })
                    ;

                    change_slide = function(direction) {

                        if (direction == 'next') {
                            //$('#main_slideshow').cycle('pause');
                            $('#main_slideshow').stop().clearQueue();
                            $('#main_slideshow_nav').addClass('slide-changing');
                            next_slide_index = parseInt($('#main_slideshow .slide.cycle-slide-active').attr('data-index')) + 1;
                            if (next_slide_index > $('#main_slideshow .slide').length) {
                                next_slide_index = 1;
                            }
                            cycle_end(next_slide_index);
                            //$(this).addClass('active');
                            $('#main_slideshow_nav')
                                .stop().clearQueue()
                                .animate({'display':'block'}, 400, function() {
                                    $('#main_slideshow').cycle('next');
                                })
                                .animate({'display':'block'}, 800, function() {
                                    $('#main_slideshow_nav').removeClass('slide-changing');
                                })
                            ;
                        } else if (direction == 'previous') {
                            //$('#main_slideshow').cycle('pause');
                            $('#main_slideshow').stop().clearQueue();
                            $('#main_slideshow_nav').addClass('slide-changing');
                            next_slide_index = $('#main_slideshow .slide.cycle-slide-active').attr('data-index') - 1;
                            if (next_slide_index < 1) {
                                next_slide_index = $('#main_slideshow .slide').length;
                            }
                            cycle_end(next_slide_index);
                            //$(this).addClass('active');
                            $('#main_slideshow_nav')
                                .stop().clearQueue()
                                .animate({'display':'block'}, 400, function() {
                                    $('#main_slideshow').cycle('prev');
                                })
                                .animate({'display':'block'}, 800, function() {
                                    $('#main_slideshow_nav').removeClass('slide-changing');
                                })
                            ;
                        }
                    };

                    $(document).keydown(function(e) {
                        if (e.which == 38) {
                            // Up
                            change_slide('previous');
                            e.preventDefault(); // prevent the default action (scroll)
                        } else if (e.which == 40) {
                            // Down
                            change_slide('next');
                            e.preventDefault(); // prevent the default action (scroll)
                        }
                    });

                    if ($('body').hasClass('first-load-complete')) {
                        window.site.home.start_slideshow();
                    }

                });

            }

        },

        slideshow: {

            init: function() {
                
                window.site.slideshow.cascading();
                window.site.slideshow.slider.init();
                
            },

            slider: {

                init: function() {
                    $('.records_list_slider').each(function() {

                        var instance = $(this).find('.records_list_inner');
                        var slider_inifinite = true;
                        var lazyload_amount = 4;
                        if ($(instance).find('.item').length) {


                            $(instance).find('.item').each(function(){
                                if ($(this).find('.image').length) {
                                    var current_height = $(this).find('.image').height();
                                } else {
                                    var current_height = $(this).height();
                                }
                                var ratio_width = $(this).find('.image').attr('data-width');
                                var ratio_height = $(this).find('.image').attr('data-height');
                                if (current_height > 0 && ratio_width && ratio_height) {
                                    var new_width = 0;
                                    var ratio = (ratio_height / current_height);
                                    var new_width = ratio_width / ratio;
                                    if (new_width > 0) {
                                        $(this).find('.image').css('min-width', new_width + 'px');
                                    }
                                }
                            });

                            $(instance).flickity({
                                cellAlign: 'center',
                                resize: true,
                                prevNextButtons: false,
                                pageDots: false,
                                contain: true,
                                wrapAround: slider_inifinite,
                                imagesLoaded: false,
                                adaptiveHeight: false,
                                lazyLoad: lazyload_amount
                            });

                            var flkty = $(instance).data('flickity');
                            var item_count = $(instance).find('.item').length;
                            var item_width = Math.floor($(instance).find('.item:eq(0)')[0].getBoundingClientRect().width);
                            var instance_width = $(instance).width();
                            var items_per_group = instance_width / item_width;

                            // If there are not enough items to be scrolled, disable pagination and unbind the drag
                            if (items_per_group) {
                                 if (flkty.cells.length <= items_per_group) {
                                     flkty.unbindDrag();
                                     $(instance).closest('.records_list_slider').addClass('slider_disabled');
                                 }
                             }

                            // Initialise controls
                            $(this).find('.pagination_controls > div').click(function() {
                                if ($(this).hasClass('pagination_controls_prev')) {
                                    $(this).closest('.records_list_slider').find('.records_list_inner').flickity('previous');
                                    $(instance).trigger('dragEnd');
                                } else if ($(this).hasClass('pagination_controls_next')) {
                                    $(this).closest('.records_list_slider').find('.records_list_inner').flickity('next');
                                    $(instance).trigger('dragEnd');
                                }
                            });

                            // Event on start of drag
                            $(instance).on('dragStart.flickity', function() {
                                $('body').addClass('slider-drag');
                            });

                            // Event on end of drag
                            $(instance).on('dragEnd.flickity', function() {

                                // Find the tallest slide in the current set and scale slider height to this height

                                tallest_item = 0;
                                var item_count = $(instance).find('.item').length;
                                var item_width = Math.floor($(instance).find('.item:eq(0)')[0].getBoundingClientRect().width);
                                var instance_width = $(instance).width();
                                var items_per_group = instance_width / item_width;
                                var items_in_viewport = $(instance).find('.item.is-selected').nextAll().andSelf().slice(0, items_per_group);
                                var additional_items_in_viewport = {};

                                if ($(instance).closest('.records_list_slider').hasClass('slider_infinite')) {
                                    // In an infinite slideshow, the end of the slider will include images from the beginning of the list
                                    // This means we need to check the height of the items at the beginning of the list.
                                    // Work out the deficit of items in the existing selector then add the items from the beginning of the slider to the end.
                                    if (items_in_viewport.length < items_per_group) {
                                        var item_deficit = (items_per_group - items_in_viewport.length);
                                        var additional_items_in_viewport = $(instance).find('.item').slice(0, item_deficit);
                                        if (additional_items_in_viewport.length) {
                                            var items_in_viewport = $(items_in_viewport).add(additional_items_in_viewport);
                                        }
                                    }
                                }

                                $(window).trigger('resize');

                            });

                            // Event when slider stops moving completely
                            $(instance).on('settle.flickity', function() {
                                $('body').removeClass('slider-drag');
                            });

                            // Event on a new slide being moved into view
                            $(instance).on('select.flickity', function() {
                                window.site.slideshow.slider.after_change($(this));
                            });


                            // Fire events once initially to make sure processes have been run on the initial view before a transition has been made
                            $(instance).trigger('dragEnd.flickity');
                            window.site.slideshow.slider.after_change($(instance), true);
                        }


                    });

                    $('.records_list_slider.feature_list_slider .item').each(function() {
                        if ($('.content', this).index() == 0) {
                            $('.content', this).addClass('responsive-hidden');
                            $(this).append('<div class="content responsive-only">' + $('.content', this).html() + '</div>');
                        }
                    });


                },

                after_change: function(instance, forced) {
                    var flkty = $(instance).data('flickity');
                    var target = flkty.selectedCell.target;
                    var caption = $(flkty.selectedCell.element).attr('data-caption');
                    $(instance).closest('.records_list_slider').find('.records_list_slider_caption').html('');
                    if (caption && typeof caption != 'undefined') {
                        $(instance).closest('.records_list_slider').find('.records_list_slider_caption').html(caption);
                    }
                    if (false) {
                        // Not relevant because slider is continuous
                        if (!$(instance).closest('.records_list_slider').hasClass('slider_infinite')) {
                            if (target == flkty.cells[0].target) {
                                $(instance).closest('.records_list_slider').find('.pagination_controls .pagination_controls_prev').addClass('disabled');
                            } else if (target == flkty.getLastCell().target) {
                                $(instance).closest('.records_list_slider').find('.pagination_controls .pagination_controls_next').addClass('disabled');
                            } else {
                                // both buttons enabled
                                $(instance).closest('.records_list_slider').find('.pagination_controls .pagination_controls_prev').removeClass('disabled');
                                $(instance).closest('.records_list_slider').find('.pagination_controls .pagination_controls_next').removeClass('disabled');
                            }
                        }
                    }
                }
                
            },

            cascading: function() {
                $('.content_slideshow').each(function() {
                    var mastersettings = {
                        fx:     'fade',
                        speed:    1200,
                        timeout:  3000,
                        pause:   0,
                        slides: '> .item',
                        autoHeight: 'calc',
                        swipe: true
                    }
                    $(this).cycle(mastersettings);
                    $('.slide_pagination_controls .pagination_controls_prev', this).unbind().bind('click', function() {
                        $(this).closest('.content_slideshow').cycle('pause').cycle('prev');
                        return false;
                    });
                    $('.slide_pagination_controls .pagination_controls_next', this).unbind().bind('click', function() {
                        $(this).closest('.content_slideshow').cycle('pause').cycle('next');
                        return false;
                    });
                });
            }

        },

        video: {

        	init: function() {
                
                // Object-fit for IE/Edge
                objectFitVideos();

                if ($('body').fitVids) {
                    $('body').fitVids({ ignore: '.video_inline'});
                }

                if (window.site.device.video_inline()) {
                    $('body').addClass('device-video-inline-enabled');
                } else {
                    $('body').addClass('device-video-inline-disabled');
                }

                if (!window.site.device.video_inline()) {
                    $('body').addClass('device-video-fallback');
                }

               	$('.media_wrapper').each(function() {
	                var wrapper = $(this);
                    if (!$(this).hasClass('media_wrapper_has_canvas') || ($(this).hasClass('media_wrapper_has_canvas') && !window.site.device.canvas_enabled())){
                        // Each media wrapper may be disabled if there is an outside alternative which is currently active (in this case, video within canvas)
                        if ($(this).hasClass('media_has_video') && window.site.device.video_mode()) {
                            if ($('video', this).length) {
                                $(this).addClass('video_loading');
                                $('video', this).unbind().get(0).oncanplay = function() {
                                    var instance = $(this);
                                    window.setTimeout(function() {
                                        instance.closest('.media_wrapper').addClass('video_can_start');
                                        instance.closest('.media_wrapper').removeClass('video_loading');
                                        wrapper.closest('.media_wrapper').addClass('media_started');
                                    }, 000, instance);
                                };
                            }
                            window.setTimeout(function() {
                            	if (!wrapper.hasClass('video_can_start')) {
    	                        	wrapper.addClass('show_fallback');
                                    wrapper.closest('.media_wrapper').addClass('media_started');
    	                    	}
                            }, 1400, wrapper);
                        } else {
                            //wrapper.find('video').remove();
                        	if (wrapper.find('.slideshow').length) {
                        		wrapper.addClass('show_slideshow');
                        	} else {
                        		wrapper.addClass('show_fallback');
                        	}
                            wrapper.closest('.media_wrapper').addClass('media_started');
                        }
                    }
               	});

                
                if (!window.site.device.video_mode()) {

                    video_fallback_html = '<div class="link video_fallback_button prevent_scroll"><span class="video_fallback_paused prevent_scroll">Play video</span><span class="video_fallback_play prevent_scroll">Stop video</span></div>';
                    if ($('.media_wrapper .video_background video').length) {
                        $('.media_wrapper').append(video_fallback_html);
                    }
                    $('.video_fallback_button').unbind('click').bind('click', function() {
                        if (window.site.device.video_mode()) {
                            var section_element = $(this).closest('.media_wrapper');
                            if (section_element.hasClass('video_fallback_playing')) {
                                section_element.find('.video_background video').get(0).pause();
                                section_element.removeClass('video_fallback_playing');
                            } else {
                                section_element.find('.video_background video').get(0).play();
                                section_element.addClass('video_fallback_playing');
                            }
                        } else {
                            var video_src = $(this).closest('.media_wrapper').find('.video_background video source').attr('src');
                            var video_data_src = $(this).closest('section').find('.video_background video source').attr('data-src');
                            if (video_src && typeof video_src != 'undefined') {
                                var video_file = video_src;
                            } else {
                                var video_file = video_data_src;
                            }
                            if (video_file && typeof video_file != 'undefined') {
                                window.open(video_file);
                            }
                        }
                    });
                } else {
                    video_loading_html = '<div class="video_loading_icon"><span class="loader"></span>Video loading</div>';
                    if ($('.media_wrapper .video_background video').length) {
                        $('.media_wrapper .video_background').append(video_loading_html);
                    }
                }

                

                var vimeo_embeds = $('.video_embed_vimeo');
                vimeo_embeds.each(function() {
                    var player = $f(this); // Froogaloop selector

                    $(this).closest('.video_embed_wrapper').find('.video_embed_play').click(function() {
                        var player = $f($(this).closest('.video_embed_wrapper').find('iframe').get(0)); // Froogaloop selector
                        player.api("play");
                    });
                    $(this).closest('.video_embed_wrapper').find('.video_embed_pause').click(function() {
                        var player = $f($(this).closest('.video_embed_wrapper').find('iframe').get(0)); // Froogaloop selector
                        player.api("pause");
                    });
                });
				
        	}

        },

        layout: {

        	init: function() {
        		window.site.layout.textillate();
        		window.site.layout.grids.init();
        		window.site.layout.feature_panels();
        		window.site.layout.navigation();
                window.site.layout.hero.init();

        		$('#main_content').css('min-height', window.site.layout.window_height());
        		
                $('.notify_panel_mask').unbind().click(function() {
                    if ($('#store_quick_cart_widget').hasClass('active')) {
                        $('#sqcw_close').trigger('click');
                    }
                    if ($('#wishlist_quick_cart_widget').hasClass('active')) {
                        $('#wishlist_quick_cart_widget .notify_panel_close').trigger('click');
                    }
                    if ($('.content-overlay').hasClass('active')) {
                        $('.content-overlay .overlay-close-button').trigger('click');
                    }
                });
                
                var timer, el = $('#container_outer'), flag = false;
                $(window).add('#popup_content').scroll(function() {
                    var scrolling_element = $(this);
                    if (!flag) {
                        flag = true;
                        //if (!$('body').hasClass('content-swipe')) {
                            el.addClass('scrolling').removeClass('not-scrolling');
                            $(scrolling_element).addClass('scrolling').removeClass('not-scrolling');
		                //}
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        el.removeClass('scrolling').addClass('not-scrolling');
                        $(scrolling_element).removeClass('scrolling').addClass('not-scrolling');
                        flag = false;
                    }, 300, scrolling_element);
                });
                $('#container_outer').removeClass('scrolling').addClass('not-scrolling');

                $('#popup_content').bind('scroll', window.site.throttle(50, function() {
                    if ($('#popup_content').scrollTop() > 30) {
                        $('body').addClass('popup-scrolled');
                        $('body').removeClass('popup-not-scrolled');
                    } else {
                        $('body').removeClass('popup-scrolled');
                        $('body').addClass('popup-not-scrolled');
                    }
                }));
                $('#popup_content').bind('scroll', window.site.debounce(200, function() {
                    if ($('#popup_content').scrollTop() > 30) {
                        $('body').addClass('popup-scrolled');
                        $('body').removeClass('popup-not-scrolled');
                    } else {
                        $('body').removeClass('popup-scrolled');
                        $('body').addClass('popup-not-scrolled');
                    }
                }));

                if (!$('.scroll-container .faux_footer').length && $('#footer').length) {
                	$('.scroll-container').append('<div class="faux_footer"></div>');
                }

                $(window).resize(function() {
                	window.site.layout.resize();
                });
                window.site.layout.resize();
        	},

        	resize: function() {
        	    
        		if (true) {
	        		if (window.site.device.breakpoint() <= 2) {
	                    $('body').removeClass('fixed-footer');
	                    $('#footer').css('min-height', '')
	                    $('.faux_footer').css('height', '');
	                } else {
	                    if ($('#footer .inner').outerHeight() <= $(window).height()) {
	                        $('body').addClass('fixed-footer');
	                        $('#footer').each(function() {
	                            $(this).css('min-height', window.site.layout.window_height());
	                        });
	                        $('.faux_footer').each(function() {
	                            $(this).css('height', window.site.layout.window_height());
	                        });
	                    } else {
	                        $('body').removeClass('fixed-footer');
	                        $('#footer').css('min-height', '')
	                        $('.faux_footer').css('height', '');
	                    }
	                }
        		}

                if ($('.subsection-store-basket').length) {
                	var new_min_height = $(window).height();
                	$('#content_module').css('min-height', '0');
                	$('#sidebar').css('min-height', '0');
                	if ($('#sidebar').outerHeight() > $('#content_module').outerHeight()) {
                		var sidebar_height = $('#sidebar').outerHeight();
                		if (sidebar_height > new_min_height) {
                			var sidebar_height = sidebar_height;
                		}
                	}
                	if ($('#content_module').outerHeight() > $('#sidebar').outerHeight()) {
                		var content_height = $('#content_module').outerHeight();
                		if (content_height > new_min_height) {
                			var new_min_height = content_height;
                		}
                	}
                	$('#content_module, #sidebar').css('min-height', new_min_height);
				}

        	},

            window_height: function() {
                var window_height = $(window).height();
                var toolbar_height = $('body').hasClass('cms-frontend-toolbar-active') ? 28 : 0;
                return window_height - toolbar_height;
            },

            window_height_extended: function() {
                var extended_height = (window.site.layout.window_height() / 100) * 10;
                return window.site.layout.window_height() + extended_height;
            },

        	feature_panels: function() {
        		feature_panels_index = 0;
            	$('.scroll_section_panels section').each(function() {
        			feature_panels_index = feature_panels_index + 1;
            		$(this).attr('data-scrollinner-index', feature_panels_index);
            		$(this).addClass('panel_index_' + feature_panels_index);
            	});
        	},

        	navigation: function() {
        		$('#header #page_header').remove();
        		$('#header').removeClass('page-header-subsections');
        		var new_page_header_content = $('#page_header_mirror').length ? $('#page_header_mirror').html() : '';
        		if (!$('#header #page_header').length) {
        			$('#header').append('<div id="page_header"></div>')
        		}
        		$('#header #page_header').html(new_page_header_content);
        		if (new_page_header_content != '') {
        			$('#header').addClass('page-header-subsections');
        		}

                $('.page_navigation a').unbind('click.delayed-links').bind('click.delayed-links', function() {
                    var this_href = $(this).attr('href');
                    $('body').addClass('page-transition-delay');
                    if (typeof artworks_nav_hover_over_timeout != 'undefined') {
                        clearTimeout(artworks_nav_hover_over_timeout);
                    }
                    $('#header').removeClass('artworks-nav-hover');
                    //$(".nav-contact-module:not(.visible)").each(function(i){
                    //    var $item = $(this);
                    //    setTimeout(function() {
                    ///        $item.addClass('visible')
                    //    }, 300*i);
                    //});
                    setTimeout(function() {
                        $.pageload.load(this_href, true, false);
                    }, 600, this_href);
                    return false;
                });
        		//$.pageload.refresh($('#header #page_header'));
                $('#header').addClass('artworks-nav-not-hover');
                $('#header, #page_header').each(function() {
                    $(this).unbind('mouseover.dropnav, mouseout.dropnav').bind('mouseover.dropnav', function() {
                        if (!$('body').hasClass('page-transition-delay') && !$('body').hasClass('page-transition')) {
                            $(this).addClass('hovering');
                            if (typeof artworks_nav_hover_timeout != 'undefined') {
                                clearTimeout(artworks_nav_hover_timeout);
                            }

                            if (typeof artworks_nav_hover_over_timeout != 'undefined') {
                                clearTimeout(artworks_nav_hover_over_timeout);
                            }
                            artworks_nav_hover_over_timeout = setTimeout(function() {
                                $('#header').addClass('artworks-nav-hover');
                                $('#header').removeClass('artworks-nav-not-hover');
                            }, 100);
                        }
                    }).bind('mouseout.dropnav', function() {
                        $(this).removeClass('hovering');
                        if (!$('#header.hovering, #page_header.hovering').length) {
                            if (typeof artworks_nav_hover_over_timeout != 'undefined') {
                                clearTimeout(artworks_nav_hover_over_timeout);
                            }
                            artworks_nav_hover_timeout = setTimeout(function() {
                                $('#header').removeClass('artworks-nav-hover');
                                $('#header').addClass('artworks-nav-not-hover');
                            }, 1000);
                        }
                    });
                });

        	},

        	grids: {

        		init: function() {

                    $('.image_list ul li')
                        .each(function() {
                            if ($(this).find("video").length) {
                                var el = $(this).find('video')[0];
                                el.currentTime = 0;
                                el.pause();
                            }
                        })
                        .hover(function () {
                            if (!window.site.device.handheld()) {
                                if ($(this).find("video").length) {
                                    var el = $(this).find('video')[0];
                                    var playPromise = el.play();
                                    var $that = $(this);
                                    if (playPromise !== undefined) {
                                      playPromise.then(function (_) {
                                        // Automatic playback started!
                                        // Show playing UI.
                                        // $entry.addClass('video-ready');
                                        $that.addClass('video-reveal');
                                      }).catch(function (error) {// Auto-play was prevented
                                        // Show paused UI.
                                        console.log(error)
                                      });
                                    }
                                    el.currentTime = 0;
                                    // el.play();
                                    // $(this).addClass('video-reveal');
                                }
                            }
                        }, function () {
                            if (!window.site.device.handheld()) {
                                $(this).removeClass('video-reveal');
                                if ($(this).find("video").length) {
                                    var el = $(this).find('video')[0];
                                    el.pause();
                                }
                            }
                        })
                    ;

        			$('.column_list').each(function() {
        				$(this).delay(500).queue(function() {
		                    $('.column_list ul:not(.visible)').each(function(i){
		                        var $item = $(this);
		                        setTimeout(function() {
		                            $item.addClass('visible');
		                        }, 200*i);
		                    });
        					$(this).clearQueue();
        				});
        			});

        			$('.text_columns').each(function() {
        				$('.content_extended_text', this).each(function() {
        					$(this).closest('.content').addClass('extended_text_hidden');
        					$(this).closest('.content').find('.content_reveal_more_link a').unbind().click(function() {
        						$(this).closest('.content').removeClass('extended_text_hidden');
        						$(this).closest('.content').addClass('extended_text_show');
        						return false;
        					});
        				});
        			});

	                $('.records_grid.tile_grid').each(function() {
	                	if (!$('.tile_grid_original', this).length) {
		                    var original_html = $(this).html();
		                    $(this).html('');
		                    $(this).append('<div class="tile_grid_formatted"></div>');
		                    $(this).append('<div class="tile_grid_original"></div>');
		                    $('.tile_grid_original', this).html(original_html).css('visibility', 'hidden');
	                	}
	                });

        			window.site.layout.grids.resize();
        			$(window).bind('resize', function() {
	        			window.site.layout.grids.resize();
	        		});

	        		$('.records_grid.tile_grid')
	                    .each(function() {
	                        if ($('.tile_grid_formatted .item.revealable', this).length) {
		                        if (!$(this).find('.panel_footer_revealable_link').length) {
		                            $(this).append('<div class="panel_footer panel_footer_revealable_link"><div class="button link_more"><a href="#">View More</a></div></div>');
		                            $(this).find('.link_more a').click(function() {
		                                var link_original_top_offset = $(this).offset().top - ($(window).height() / 2);
		                                var current_offset_top = $(window).scrollTop() - ($(window).height() / 2);
		                                var items_to_reveal = ($(this).closest('.records_grid').attr('data-rows-to-reveal') && typeof $(this).closest('.records_grid').attr('data-rows-to-reveal') != 'undefined' ? $(this).closest('.records_grid').attr('data-rows-to-reveal') : 2);
					                    if (window.site.device.breakpoint() <= 2) {
					                    	var items_to_reveal = parseInt(items_to_reveal) * 2;
					                    }
					                    $('body').addClass('scroll_event_disabled, window-forced-scroll-up');

		                                // Extend the height of the container for a smoother opening effect
		                                var containing_group = $(this).closest('.records_grid').find('.tile_grid_formatted');
		                                var new_row_to_be_revealed = $(this).closest('.records_grid').find('.item.revealable').filter(':eq(0)');
		                                var containing_group_new_height = containing_group.height() + (new_row_to_be_revealed.height() * items_to_reveal);
		                                containing_group.css('height', containing_group.height());
		                                window.setTimeout(function() {
		                                	containing_group.css('height', containing_group_new_height);
		                                }, 20, containing_group);

	                                	// Reveal the items
		                                $(this).closest('.tile_grid').find('.tile_grid_formatted > .group').each(function() {
		                                    $('.item.revealable:lt(' + items_to_reveal + ')', this).removeClass('revealable');
		                                });
		                                var remaining_revealable_items = $(this).closest('.tile_grid').find('.tile_grid_formatted > .group .item.revealable', this).length;
		                                if (remaining_revealable_items == 0) {
		                                    $(this).closest('.panel_footer_revealable_link').addClass('disabled');
		                                }

		                                $('html,body').animate(
		                                    {scrollTop: link_original_top_offset},
		                                    1200,
		                                    'easeInOutExpo',
		                                    function() {
		                                    	window.setTimeout(function() {
			                                        $('body').removeClass('scroll_event_disabled, window-forced-scroll-up');
			                                    }, 500);
		                                        $(window).trigger('scroll');
	                                        	containing_group.css('height', '');
		                                    }
		                                );
		                                return false;
		                            });
		                        }
	                        }
	                    })
	                ;

	                // Progressive grid format

	        		$('.records_grid.progressive_grid').each(function() {
		        		if ($('.item.revealable', this).length) {
	                        if (!$(this).find('.panel_footer_revealable_link').length) {
	                            $(this).append('<div class="panel_footer panel_footer_revealable_link"><div class="button link_more"><a href="#">View More</a></div></div>');
                                $(this).find('.link_more a').unbind('click.records_grid').bind('click.records_grid', function() {
	                                var link_original_top_offset = $(this).offset().top - ($(window).height() / 4);
	                                var rows_to_reveal = ($(this).closest('.records_grid').attr('data-rows-to-reveal') && typeof $(this).closest('.records_grid').attr('data-rows-to-reveal') != 'undefined' ? $(this).closest('.records_grid').attr('data-rows-to-reveal') : 2);
	        						if (window.site.device.breakpoint() == 1) {
										var rows_to_reveal = rows_to_reveal * 2;
	        						}
	                                var current_visible_row = $(this).closest('.records_grid').find('.item').not('.revealable').last().attr('data-row-number');
	                                $('body').addClass('scroll_event_disabled');

	                                // Extend the height of the container for a smoother opening effect
	                                var containing_group = $(this).closest('.records_grid').find('.group');
	                                var new_row_to_be_revealed = $(this).closest('.records_grid').find('.item.revealable').filter(':eq(0)');
	                                var containing_group_new_height = containing_group.height() + (new_row_to_be_revealed.height() * rows_to_reveal);
	                                containing_group.css('height', containing_group.height());
	                                window.setTimeout(function() {
	                                	containing_group.css('height', containing_group_new_height);
	                                }, 20, containing_group);

	                                // Reveal the items
	                                $(this).closest('.records_grid').each(function() {
	                                	for(var i=0; i < rows_to_reveal; i++){
										    var row_index = parseInt(current_visible_row) + (i + 1);
										    $('.item.revealable[data-row-number="' + row_index + '"]', this).addClass('revealed').removeClass('revealable');
										}
	                                });
	                                var remaining_revealable_items = $(this).closest('.records_grid').find('.item.revealable', this).length;
	                                if (remaining_revealable_items == 0) {
	                                    $(this).closest('.panel_footer_revealable_link').addClass('disabled');
	                                }
	                                $('html,body').animate(
	                                    {scrollTop: link_original_top_offset},
	                                    1200,
	                                    'easeInOutExpo',
	                                    function() {
	                                        $('body').removeClass('scroll_event_disabled');
	                                        $(window).trigger('scroll');
	                                        containing_group.css('height', '');
	                                    }
	                                );
	                                
	                                $(window).trigger('resize');
	                                return false;
	                            });
	                        }
	                    }
	        		});

        		},

        		resize: function() {

        			$('.image_list, .records_grid.medium_grid, .records_grid.large_grid, .records_grid.full_grid').each(function() {
	        			$('.item', this).each(function() {
	        				var item_width = $(this).find('.image').width();
	        				var image_width = $(this).attr('data-width');
	        				var image_height = $(this).attr('data-height');
	        				var image_width_proportional = 0;
	        				var image_height_proportional = 0;
	        				if (image_width && image_height) {
	        					var image_width_proportional = item_width / image_width;
	        					var image_height_proportional = image_height * image_width_proportional;
	        					$(this).find('.image').not('.has_video').find('img').css('max-height', '');
	        					if (image_height_proportional > item_width) {
	        						// Set a maximum height based on a square proportion
	        						var image_height_proportional = item_width;
	        						$(this).find('.image').not('.has_video').css('max-height', image_height_proportional);
	        						$(this).find('.image').not('.has_video').find('img').css('max-height', image_height_proportional);
	        					}
	        					if (image_height_proportional) {
	        						$(this).find('.image').not('.has_video').css('min-height', image_height_proportional);
	        					}
	        				}
	        			});
	        		});


					$('.records_grid.tile_grid').each(function() {

	                    if ($('.tile_grid_original .group', this).length) {

	                        // Check if the script has already been run before and set variables
	                        if ($(this).hasClass('initialised')) {
	                            init_rerun = true;
	                            existing_formatted_list_column_count = $('.tile_grid_formatted .group', this).length;
	                        } else {
	                            $(this).addClass('initialised');
	                            init_rerun = false;
	                        }

	                        // Start initialising the new list

	                        init_allowed = true;

	                        $('.tile_grid_original', this).removeClass('hidden');

	                        tile_list_instance = $(this);
	                        tile_list_width = $(this).width();
	                        tile_list_column_width = Math.floor($('.tile_grid_original .group', this)[0].getBoundingClientRect().width + parseInt($('.tile_grid_original .group', this).css('margin-left')) + parseInt($('.tile_grid_original .group', this).css('margin-right')));
	                        var column_count = 3;
	                        var column_count_calculated = Math.floor(tile_list_width / tile_list_column_width);
	                        if (column_count_calculated < 7) {
	                            var column_count = column_count_calculated;
	                        }

	                        if (init_rerun) {
	                            // If the script is being run again, check if the column count is different to before. If not, stop the list from being rebuilt.
	                            if (existing_formatted_list_column_count == column_count) {
	                                init_allowed = false;
	                            }
	                        }

	                        if (init_allowed) {
	                            var columns = {}
	                            var fixed_list_order = $(this).closest('.tile_grid').attr('data-list-order') == 'fixed' ? true : false;
	                            column_loop = 0;
	                            column_count = Array(column_count).length;
	                            $.each(Array(column_count), function(index, value) {
                                    var this_height = 0;
	                                columns[index] = {'height': this_height, 'objects': []};
	                            });
	                            $('.tile_grid_original .item', this).each(function() {
                                    var content_height = $(this).find('.area').height();
                                    var item_index = $(this).index()+1;
                                    var total_item_count = $('.tile_grid_original .item').length;
	                                if (!$(this).attr('data-width') || !$(this).attr('data-height')) {
	                                	$(this).attr('data-width', '400');
	                                	$(this).attr('data-height', '400');
	                                    console.log('Width and height of each image is required as a data attribute for this script work.');
	                                }
                                    var height_to_width_factor = parseInt($(this).attr('data-width')) / tile_list_column_width;
                                    var relative_item_height = Math.ceil(parseInt($(this).attr('data-height')) / height_to_width_factor);
                                    
                                    if (Object.keys(columns).length) {
                                        if (fixed_list_order) {
                                        	// Fixed order, do not automatically find lowest height
    	                                    lowest_height_index = column_loop;
                                        	column_loop = column_loop + 1;
    	                                    if (column_loop >= column_count) {
                                        		column_loop = 0;
    	                                    }
                                        } else {
                                        	// Dynamic order based on shortest column height
    	                                    lowest_height_index = 0;
    	                                    loop_current_lowest_height = columns[0]['height'];
    	                                    $.each(columns, function(index, value) {
                                                if (item_index == total_item_count && total_item_count > 3) {
                                                    // If last item, behave in a different way
                                                    // It is more likely the item should be placed on the left hand side
                                                    // Check the final height 'after' the item would be placed to determine if it should revert to the first column
                                                    if (index == 0) {
                                                        lowest_height_index = index;
                                                        loop_current_lowest_height = value.height;
                                                    }
                                                    var first_column_height = columns[0].height;
                                                    if ((value.height + (relative_item_height * 0.2) < loop_current_lowest_height)) {
                                                        lowest_height_index = index;
                                                        loop_current_lowest_height = value.height;
                                                    }
                                                } else {
                                                    if ((value.height < loop_current_lowest_height)) {
                                                        lowest_height_index = index;
                                                        loop_current_lowest_height = value.height;
                                                    }
                                                }
    	                                    });
                                        }
                                        columns[lowest_height_index]['height'] = columns[lowest_height_index]['height'] + relative_item_height + content_height;
                                        columns[lowest_height_index]['objects'].push($(this).clone().find('.video_inline').remove().end());
                                    }
	                            });

	                            $('.tile_grid_formatted', tile_list_instance).html('');
	                            $.each(columns, function(index, value) {
	                                $('.tile_grid_formatted', tile_list_instance).append('<div class="group"></div>');
	                                $('.tile_grid_formatted', tile_list_instance).find('.group:last-child').append(value.objects);
	                            });
	                            $('.tile_grid_formatted', tile_list_instance).find('.group:last-child').addClass('last');

					            $('.tile_grid_formatted', tile_list_instance).find('.group').each(function() {
                                    var column_count = $(this).closest('.tile_grid_formatted').find('.group').length;
					                if ($(this).closest('.tile_grid').attr('data-initial-items') == '0') {

					                } else if (parseInt($(this).closest('.tile_grid').attr('data-initial-rows'))) {
                                        var initial_items = $(this).closest('.tile_grid').attr('data-initial-rows');
                                        var initial_items_per_column = parseInt(initial_items / column_count);
					                    if (window.site.device.breakpoint() <= 2) {
					                    	var initial_items_per_column = parseInt(initial_items_per_column) * 2;
					                    }
					                    $('.item', this).addClass('revealable');
					                    $('.item:lt(' + initial_items_per_column + ')', this).removeClass('revealable');
					                } else {
					                    var initial_items_per_column = window.site.lists.tile_list_options().initial_items_per_column;
					                    if (window.site.device.breakpoint() <= 2) {
					                    	var initial_items_per_column = parseInt(initial_items_per_column) * 2;
					                    }
					                    $('.item', this).addClass('revealable');
					                    $('.item:lt(' + initial_items_per_column + ')', this).removeClass('revealable');
					                }
					            });

					            // Re-initialise functions necessary on the newly created tile list
					            window.site.artlogic_inview.init();
                                $.pageload.refresh(tile_list_instance);
					            window.site.overlays.enquire.setup();
					            window.cart.add_to_cart($(tile_list_instance).find('.store_item .store_item_add_to_cart'));
                                window.cart.add_to_wishlist($(tile_list_instance).find('.add_to_wishlist'));
					            window.cart.remove_from_wishlist($(tile_list_instance).find('.store_item_remove_from_wishlist'));

	                        }

                            $('.tile_grid_original', this).addClass('hidden');
	                    }

						// Set the heights of each image based on the proportion, this defines the available area before the images have loaded
	        			$('.tile_grid_formatted .item', this).each(function() {
	        				var item_width = $(this).find('.image').width();
	        				var image_width = $(this).attr('data-width');
	        				var image_height = $(this).attr('data-height');
	        				var image_width_proportional = 0;
	        				var image_height_proportional = 0;
	        				if (image_width && image_height) {
	        					var image_width_proportional = item_width / image_width;
	        					var image_height_proportional = image_height * image_width_proportional;
	        					if (image_height_proportional) {
	        						$(this).find('.image').css('min-height', image_height_proportional);
	        					}
	        				}
	        			});

						// If there are as many or less items than there are columns, align the items by the bottom of each image
						if ($('.tile_grid_formatted .group', this).length >= $('.tile_grid_formatted .item', this).length) {
			        		$('.tile_grid_formatted .item', this).each(function() {
		        				var this_image_height = $(this).find('.image').height();
		        				$(this).closest('.tile_grid_formatted').find('.item').each(function() {
	        						if ($(this).find('.image').height() < this_image_height) {
	        							$(this).find('.image').css('min-height', this_image_height);
	        						}
		        				});
		        			});
						}
	                });


					// Progressive grid format

	        		$('.records_grid.progressive_grid').each(function() {

	        			initial_rows = $(this).attr('data-initial-rows') && typeof $(this).attr('data-initial-rows') != 'undefined' ? $(this).attr('data-initial-rows') : false;
	        			if (window.site.device.breakpoint() <= 2) {
	        				initial_rows = parseInt(initial_rows) * 4;
	        			}
	        			row_number = 0;
	        			row_offset = 0;

	        			$('.item', this).each(function() {
	        				var item_width = $(this).find('.image').width();
	        				var image_width = $(this).attr('data-width');
	        				var image_height = $(this).attr('data-height');
	        				var image_width_proportional = 0;
	        				var image_height_proportional = 0;
	        				if (image_width && image_height) {
	        					var image_width_proportional = item_width / image_width;
	        					var image_height_proportional = image_height * image_width_proportional;
	        					if (image_height_proportional) {
	        						$(this).find('.image').css('min-height', image_height_proportional);
	        					}
	        				}
	        				$(this).removeClass('revealable');
	        			});
		        		$('.item', this).each(function() {
	        				// Find adjacent elements

                        	$(this).addClass('parallax-resizing');
	        				var offset_top = $(this).offset().top;
	        				var this_image_height = $(this).find('.image').height();
	        				if (offset_top > row_offset) {
	        					row_number = row_number + 1;
	        					row_offset = offset_top;
	        				}
	        				$(this).attr('data-row-number', row_number);
                        	$(this).removeClass('parallax-resizing');
	        			});
	        			$('.item', this).not('.revealed').each(function() {
	        				// Hide revealable elements

	        				var row_number = $(this).attr('data-row-number');
	        				if (row_number && parseInt(row_number) > parseInt(initial_rows)) {
    							$(this).addClass('revealable');
    						}
	        			});
	        		});

	        		
					$('.works_grid .item, .standard_grid .item, .medium_grid .item, .large_grid .item').unbind()
						// tile mouse actions
						.on('mouseover', function(){
							var image_width = $(this).find('.image').width();
							var scale = '1.02';
							if (image_width > 400) {
								var scale = '1.01';
							}
							if (image_width > 600) {
								var scale = '1.05';
							}
							//$(this).find('.image img').css({'transform': 'scale(' + scale + ')'});
						})
						.on('mouseout', function(){
							//$(this).find('.image img').css({'transform': 'scale(1)'});
						})
						.on('mousemove', function(e){
							// Move image around when moving the mouse $(this).find('.image img').css({'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 +'%'});
						})
					;

        		}

        	},

        	textillate: function() {

        		$('.text_animate').textillate({
	              // the default selector to use when detecting multiple texts to animate
	              selector: '.texts',

	              // enable looping
	              loop: false,

	              // sets the minimum display time for each text before it is replaced
	              minDisplayTime: 2000,

	              // sets the initial delay before starting the animation
	              // (note that depending on the in effect you may need to manually apply
	              // visibility: hidden to the element before running this plugin)
	              initialDelay: 0,

	              // set whether or not to automatically start animating
	              autoStart: true,

	              // in animation settings
	              in: {
	                // set the effect name
	                effect: 'fadeInDown',

	                // set the delay between each character
	                delay: 7,

	                // set to true to animate all the characters at the same time
	                sync: false,

	                // randomize the character sequence
	                // (note that shuffle doesn't make sense with sync = true)
	                shuffle: false,

	                // reverse the character sequence
	                // (note that reverse doesn't make sense with sync = true)
	                reverse: false,

	                // callback that executes once the animation has finished
	                callback: function () {}
	              },

	              // out animation settings.
	              out: {
	                // set the effect name
	                effect: 'fadeOutUp',

	                // set the delay between each character
	                delay: 3,
	                sync: false,
	                shuffle: false,
	                reverse: false,
	                callback: function () {}
	              },

	              // callback that executes once textillate has finished
	              callback: function () {},

	              // set the type of token to animate (available types: 'char' and 'word')
	              type: 'char'
	            });

        	},

            hero: {

                init: function() {

                    $('#hero').each(function() {

                        $('#hero .slide .image').each(function() {
                            var related_link = $(this).closest('.slide').find('h1 a');
                            if (related_link && typeof related_link != 'undefined') {
                                $(this).css('cursor', 'pointer').unbind('click').bind('click', function() {
                                    related_link.trigger('click');
                                });
                            }
                        });

                        scroll_to_content = function() {
                            var scroll_offset = $('.scroll_section').not('.scroll_section_top').filter(':eq(0)').offset().top - ($(window).height() * 0.05);
                            setTimeout(function() {
                                $('html, body').on('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove', function(){
                                    $('html, body').stop();
                                });
                            }, 400);
                            $('html, body').animate({'scrollTop': scroll_offset}, 1200, 'easeInOutExpo', function() {
                                $('html, body').off('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove');
                            });
                        };
                        $('#hero .scroll').click(function() {
                            scroll_to_content();
                            return false;
                        });

                        $('#hero .arrow').click(function() {
                            scroll_to_content();
                            return false;
                        });

                        if ($(this).find('.slide').not('cycle-sentinel').length == 1) {
                            $('#hero').addClass('single-slide');
                            $('#hero').cycle('pause');
                        }

                        if ($('#hero_nav').length) {
                            $('#hero').addClass('has_navigation');
                        }

                        cycle_end = function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
                            
                            $('#hero').addClass('slide-end');
                            $('#hero').removeClass('slide-active');
                        }

                        var cycle_settings = {
                            fx:       'fade',
                            speed:    1,
                            timeout:  8000,
                            paused:    false,
                            slides: '> .slide',
                            autoHeight: false,
                            swipe: false
                        };
                        $(this).unbind().cycle(cycle_settings);
                        $(this).on('cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
                            window.site.layout.hero.change_slide_effects(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag);
                        });

                        var internal_link = document.referrer && typeof document.referrer != 'undefined' ? true : false;
                        //var show_splash_screen = ($.pageload.options.splash_screen_always_enabled && !internal_link) || ($.pageload.options.splash_screen_enabled && !h.getCookie('jquery_pageload_recent_visit')); // (!h.getCookie('jquery_pageload_recent_visit'))

                        //if (show_splash_screen && !$('body').hasClass('first-load-complete')) {
                        //    $('#hero').cycle('pause');
                        //} else {
                            var first_slide = $('#hero .slide').not('.cycle-sentinel').filter(':eq(0)');
                            window.site.layout.hero.change_slide_effects(null, null, null, first_slide, null);
                        //}

                        if ($('#hero >').length == 1) {
                            $('#hero').cycle('pause');
                        }
                        $('#hero_nav li')
                            .click(function() {
                                $('#hero').cycle('pause');
                                if (!$(this).hasClass('active') && !$('#hero_nav').hasClass('slide-changing')) {
                                    $('#hero_nav').addClass('slide-changing');
                                    slide_index = $(this).attr('data-index');
                                    cycle_end();
                                    $(this).addClass('active');
                                    $('#hero').cycle('pause');
                                    $('#hero_nav')
                                        .stop().clearQueue()
                                        .animate({'display':'block'}, 500, function() {
                                            $('#hero').cycle(parseInt(slide_index) -1);
                                            $('#hero_nav').removeClass('slide-changing');
                                        })
                                    ;
                                }
                            })
                        ;
                    });
                
                },

                change_slide_effects: function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
                    this_index = $(incomingSlideEl).attr('data-index');
                    $('#hero_nav li').removeClass('active');
                    $('#hero_nav li[data-index="' + this_index + '"]').addClass('active');

                    if (outgoingSlideEl) {
                        $('.text_animate', outgoingSlideEl).textillate('out');
                    }

                    $('#hero').removeClass('slide-begin slide-active');
                    $('#hero').removeClass('slide-end');
                    $('#hero').addClass('slide-begin');

                    $('#hero')
                        .stop().clearQueue()
                        .animate({'display':'block'}, 100, function() {
                            $(this).addClass('slide-active');
                            if ($('.pre-title .text_animate', incomingSlideEl).length) {
                                $('.pre-title .text_animate', incomingSlideEl).textillate('in');
                            } else {
                                $('.text_animate', incomingSlideEl).textillate('in');
                            }
                            if (!$('.post-title', incomingSlideEl).length) {
                                $('#hero').removeClass('slide-begin');
                            }
                        })
                        .animate({'display':'block'}, 2000, function() {
                            $('#hero').removeClass('slide-begin');
                            $('.post-title .text_animate', incomingSlideEl).textillate('in');
                        })
                        .animate({'display':'block'}, 5300, function() {
                            if (!$('#hero').hasClass('cycle-paused') && !$('#hero').hasClass('single-slide')) {
                                cycle_end(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag);
                            }
                        })
                    ;
                }

            }

        },

        scroll: {

            smooth_scroll_enabled: false, // true
            smooth_scroll_active: false,

            settings: {
                'scroll_section_elements': '.scroll-section',
                'scroll_parallax_elements': '.scroll-parallax', // Enable parallax functionality on these elements
                'scroll_parallax_overflow_elements': '.scroll-parallax-overflow' // List parallax elements which need to overflow e.g. full screen backgrounds
            },

            init: function() {
                window.site.scroll.layout();
                window.site.scroll.smooth_scroll.init();
                window.site.scroll.events.init();
                window.site.scroll.navigation();
            },

            layout: function() {

	            curslide = 0;

                last_scroll_position = $(window).scrollTop();
            	$('#container_outer').removeClass('scrolling-down scrolling-up');

                $('.pageload-content-area').each(function() {
                    scroll_section_index = 0;
                	$('.scroll_section', this).each(function() {
                		//$(this).css('min-height', window.site.layout.window_height());
            			scroll_section_index = scroll_section_index + 1;
                		$(this).attr('data-scrollinner-index', scroll_section_index);
                		$(this).addClass('section_index_' + scroll_section_index);
                	});
                });

	            if (typeof page_intro_timeout != 'undefined') {
	            	clearTimeout(page_intro_timeout);
	            	clearTimeout(page_intro_timeout2);
	            }
	            $('#container_outer').addClass('page-intro page-intro-start');
	            page_intro_timeout = setTimeout(function() {
					$('#container_outer').addClass('page-intro-1');
	            }, 400);
	            page_intro_timeout = setTimeout(function() {
					$('#container_outer').removeClass('page-intro-start');
	            }, 1800);
	            page_intro_timeout2 = setTimeout(function() {
					$('#container_outer').removeClass('page-intro page-intro-1 page-intro-start');
	            }, 2800);

	            $('#container')
	            	.addClass('scroll-section-setup')
	            	.delay(1000)
	            	.queue(function () {
			            $('#container')
			            	.removeClass('scroll-section-setup')
			            ;
			            $(this).dequeue();
	            	})
	            ;
	            
	            loopcount = 0;
	            $('.scroll_section').each(function(i) {
	                $(this).attr('data-scroll-index', i+1);
	                if (parseInt($(this).offset().top) == $(window).scrollTop()) {
	                    $(this).addClass('active active_completed');
	                }
	            });
            },

            events: {

                init: function() {

                    last_scroll_position = 0;
                    scrolling_down_offset = 50;
                    // This improves scroll performance in chrome, why?
                    $(window).bind('scroll', function() {
	                    if ($('.artwork_hero_image_container_outer').length && !$('#popup_content .artwork_hero_image_container_outer').length) {
	                    	var hero_max_height = ($(window).height() - $(window).scrollTop()) + 200;
	                    	if (hero_max_height < 0) {
	                    		var hero_max_height = 0;
	                    	}
	                    	$('.artwork_hero_image_container_outer').css('max-height', hero_max_height);
	                    }
                    });
                    $(window).bind('scroll', window.site.throttle(50, function() {
                        window.site.scroll.events.run();
                    }));
                    $(window).bind('scroll', window.site.debounce(200, function() {
                        window.site.scroll.events.run();
                    }));
                    window.site.scroll.events.run();
                },

                run: function() {
                    if ($(window).scrollTop() > 0) {
                        if (last_scroll_position > $(window).scrollTop()) {
                            if (last_scroll_position + 5 > $(window).scrollTop()) {
                                if (!$('body').hasClass('window-forced-scroll-up')) {
                                    if (!$('body').hasClass('page-popup-active') && !$('body').hasClass('overlay-open')) {
                                        $('#container_outer').addClass('scrolling-up');
                                        $('#container_outer').removeClass('scrolling-down');
                                    }
                                }
                            }
                        } else {
                            if ($(window).scrollTop() > last_scroll_position) {
                                if ($(window).scrollTop() > scrolling_down_offset) {
                                    if (!$('body').hasClass('page-popup-active') && !$('body').hasClass('overlay-open')) {
                                        $('#container_outer').removeClass('scrolling-up');
                                        $('#container_outer').addClass('scrolling-down');
                                    }
                                }
                            }
                        }
                    } else {
                        $('#container_outer').removeClass('scrolling-down scrolling-up');
                    }
                    if ($('body').hasClass('page-popup-visible')) {
                        $('#container_outer').removeClass('page-top');
                    } else {
                        if ($(window).scrollTop() > 100) {
                            if ($('#container_outer').hasClass('page-top')) {
                                $('#container_outer').removeClass('page-top');
                            }
                        } else {
                            if (!$('#container_outer').hasClass('page-top')) {
                                $('#container_outer').addClass('page-top');
                            }
                        }
                    }
                    window.site.scroll.subnav_active_change();
                    last_scroll_position = $(window).scrollTop();
                }
                    
            },

            navigation: function() {
                
                if (!$('#feature_panel_section_nav').length) {
                    $('.scroll_section_panels:last').after('<div id="feature_panel_section_nav"><ul></ul></div><div id="feature_panel_section_heading"><div id="feature_panel_section_heading_content" class="splash_heading"></div></div>')
                }

                if ($('#feature_panel_section_nav').length && !$('#feature_panel_section_nav').hasClass('side_nav_filters')) {
                    jQuery.fn.reverse = [].reverse;
                    $('.feature_panels section').each(function() {
                        var this_label = $(this).attr('data-label');
                        var this_index = $(this).attr('data-scrollinner-index');
                        if (this_label && this_index && typeof this_label != 'undefined' && typeof this_index != 'undefined') {
                            $('#feature_panel_section_nav ul').append('<li data-index="' + this_index + '"><a>' + this_label + '</a></li>');
                        } else {
                            $('#feature_panel_section_nav ul').append('<li data-index="' + this_index + '" class="no-label"></li>');
                        }
                    });

                    if ($('#feature_panel_section_nav ul li').not('.no-label').length <= 1) {
                        $('#feature_panel_section_nav').addClass('nav-hidden');
                    } else {
                        $('#feature_panel_section_nav').removeClass('nav-hidden');
                    }

                    $('#feature_panel_section_nav ul li').unbind().click(function() {
                        $('body').addClass('window-forced-scroll-up');
                        var this_index = $(this).attr('data-index');
                        var related_item = $('.feature_panels section[data-scrollinner-index="' + this_index + '"]');
                        if (related_item.length) {
                            var direction = (related_item.offset().top > $(window).scrollTop() ? 'down' : 'up');
                            if (false && $('#header').length > 0 && direction == 'up') {
                                var offset = 100;
                                var offset = offset + $('#header').outerHeight();
                            } else {
                                var offset = 40;
                            }
                            if ($('#cms-frontend-toolbar-container').length > 0) {
                                var offset = offset + $('#cms-frontend-toolbar-container').outerHeight();
                            }
                            var related_item_offset = related_item.offset().top - offset;
                            var related_item_offset = (related_item_offset < 1 ? 0 : related_item_offset);
                            $('html,body').animate(
                                {scrollTop: related_item_offset},
                                800,
                                'easeInOutExpo',
                                function() {
                                    $('body').delay(100).queue(function() {
                                        $(this).removeClass('window-forced-scroll-up');
                                        $(this).dequeue();
                                    });
                                    window.site.scroll.subnav_active_change();
                                }
                            );
                        }
                        return false;
                    });
                }

            },

            subnav_active_change: function() {
                var windowPos = $(window).scrollTop(); // get the offset of the window from the top of page
                var windowHeight = $(window).height(); // get the height of the window
                var docHeight = $(document).height();

                $('#feature_panel_section_nav ul li')
                    .each(function() {
                        var this_index = $(this).attr('data-index');
                        var related_item = $('.feature_panels section[data-scrollinner-index="' + this_index + '"]');
                        if (related_item.length) { 
                            var item_theme = related_item.attr('data-theme');
                            var offset = windowHeight/2;
                            if ($('#cms-frontend-toolbar-container').length > 0) {
                                var offset = offset + $('#cms-frontend-toolbar-container').outerHeight();
                            }
                            var divPos = related_item.offset().top - offset; // get the offset of the div from the top of page
                            var divHeight = related_item.outerHeight(); // get the height of the div in question
                            if (windowPos >= divPos && windowPos < (divPos + divHeight)) {
                                // This item is active
                                if (!$("#feature_panel_section_nav ul li[data-index='" + this_index + "']").hasClass('active')) {
                                    $("#feature_panel_section_nav ul li[data-index='" + this_index + "']").closest('li').addClass("active");

                                    if (item_theme == 'reversed') {
                                        $('body').addClass('content-type-reversed');
                                    } else {
                                        $('body').removeClass('content-type-reversed');
                                    }
                                    if (related_item.find('.panel_heading_splash').length) {
                                        if (typeof section_intro_timeout != 'undefined') {
                                            clearTimeout(section_intro_timeout);
                                            clearTimeout(section_intro_timeout2);
                                        }
                                        $('#feature_panel_section_heading_content').html(related_item.find('.panel_heading_splash').text());
                                        var initial_timeout = $('#feature_panel_section_heading').hasClass('visible') ? 0 : 0; 
                                        section_intro_timeout = setTimeout(function() {
                                            $('#feature_panel_section_heading').addClass('visible');
                                        }, initial_timeout, related_item);

                                        section_intro_timeout2 = setTimeout(function() {
                                            $('#feature_panel_section_heading').removeClass('visible');
                                        }, 2000, related_item);
                                    } else {
                                        $('#feature_panel_section_heading').removeClass('visible');
                                    }
                                }
                            } else {
                                // This item is not active
                                $("#feature_panel_section_nav ul li[data-index='" + this_index + "']").closest('li').removeClass("active");
                            }
                        }
                    })
                    .promise()
                    .done(function() {
                        
                    })
                ;

                // General events - revert or figure out what to do if no items are active
                if ($('#feature_panel_section_nav li').length > 1 && $('#feature_panel_section_nav .active').length < 1) {
                    var first_item = $('#feature_panel_section_nav li').filter(':eq(0)');
                    var first_item_index = first_item.attr('data-index');
                    var related_item = $('.feature_panels section[data-scrollinner-index="' + first_item_index + '"]').length ? $('.feature_panels section[data-scrollinner-index="' + first_item_index + '"]') : false;
                    var related_item_below_scroll = false;
                    if (related_item) {
                        if (related_item.offset().top > $(window).scrollTop()) {
                            var related_item_below_scroll = true;
                        }
                    }
                    if (related_item_below_scroll) {
                        // We are above the first item, the initial theme should be set as the first item theme
                        var item_theme = related_item.attr('data-theme');
                        if (item_theme == 'reversed') {
                            $('body').addClass('content-type-reversed');
                        } else {
                            $('body').removeClass('content-type-reversed');
                        }
                    } else {
                        // No items are active, revert theme
                        $('body').removeClass('content-type-reversed');
                        $('#feature_panel_section_heading').removeClass('visible');
                        if (typeof section_intro_timeout != 'undefined') {
                            clearTimeout(section_intro_timeout);
                            clearTimeout(section_intro_timeout2);
                        }
                    }
                }

                if(windowPos + windowHeight == docHeight) {
                    if (!$("#feature_panel_section_nav ul li:last-child").closest('li').hasClass("active")) {
                        var navActiveCurrent = $(".active").attr("href");
                        $("#feature_panel_section_nav ul li[href='" + navActiveCurrent + "']").closest('li').removeClass("active");
                        $("#feature_panel_section_nav ul l li:last-child").closest('li').addClass("active");
                    }
                }
            },

            smooth_scroll: {

                init: function() {
                    $(window).bind('resize', window.site.scroll.smooth_scroll.resize);
                    window.site.scroll.smooth_scroll.scroll_init();
                    if (window.site.scroll.smooth_scroll.device_enabled()) {
                        window.site.scroll.smooth_scroll.setup();
                        window.site.scroll.smooth_scroll.resize_container();
	                    $(window).load(function() {
	                        window.site.scroll.smooth_scroll.resize_container();
	                    });
                    } else {
                        window.site.scroll.smooth_scroll.fallback();
                    }
                },

                setup: function() {
                    $('.scroll-container').addClass('active');
                    $('body').addClass('smooth-scroll-enabled');
                    window.site.scroll.smooth_scroll_active = true;
                    requestAnimationFrame(window.site.scroll.smooth_scroll.loop);
                },

                fallback: function() {
                    $('.scroll-container').addClass('standard');
                    $('body').addClass('smooth-scroll-fallback');
                    window.site.scroll.smooth_scroll_active = false;
                },

                resize: function() {
                    $(window).trigger('scroll');
                    if (window.site.scroll.smooth_scroll_active) {
                        window.site.scroll.smooth_scroll.resize_container();
                    }
                    window.site.scroll.smooth_scroll.resize_elements();
                },

                scroll_init: function() {
                    var scrollElements = $(window.site.scroll.settings.scroll_parallax_elements);
                    scrollElements.each(function() {
                        if (!$(this).attr('data-level') || typeof $(this).attr('data-level') == 'undefined') {
                            var level = $(this).css('zIndex');
                            if (level == 0) {
                                var level = 1;
                            }
                            $(this).attr('data-level', level);
                        }
                    });
                    window.site.scroll.smooth_scroll.resize_elements();
                },

                resize_elements: function() {
                	if (window.site.scroll.smooth_scroll_active) {
	                    $(window.site.scroll.settings.scroll_parallax_elements + ', ' + window.site.scroll.settings.scroll_section_elements).each(function() {
	                        var element = $(this);
	                        var transform = element.css('transform');
	                        element.addClass('parallax-resizing');
	                        element.attr('data-top', element.offset().top);
	                        element.attr('data-scrollheight', window.site.layout.window_height());
	                        element.attr('data-bottom', element.offset().top + element.outerHeight());
	                        element.attr('data-start', element.offset().top - window.site.layout.window_height());
	                        element.attr('data-stop', element.offset().top + element.outerHeight());
	                        element.css({
	                            transform: transform,
	                            backgroundColor: 'transparent'
	                        });
	                        element.removeClass('parallax-resizing');
	                    });
	                    $(window.site.scroll.settings.scroll_parallax_overflow_elements).each(function() {
	                        var element = $(this);
	                        var wh = $(window).height();
	                        var offsetTop = element.attr('data-top');
	                        var offsetBottom = element.attr('data-bottom');
	                        var level = Number(element.attr('data-level'));
	                        var amplitude = -wh;
	                        var movement = amplitude / (5 / level);
	                        var start = element.attr('data-start');
	                        var stop = element.attr('data-stop');
	                        var percent = (start - start) / (stop - start);
	                        percent = percent - 0.5;
	                        var maximum_offset = movement * percent;
	                        var maximum_offset_top = maximum_offset;
	                        if (element.offset().top < 20) {
	                            var maximum_offset_top = 0;
	                        }
	                        element.css({'top': -maximum_offset_top + 'px', 'bottom': -maximum_offset + 'px'});
	                    });
                	}
                },

                translate_y: function(element) {
                    var style = window.getComputedStyle(element.get(0));
                    var matrix = style.getPropertyValue("-webkit-transform") || style.getPropertyValue("-moz-transform") || style.getPropertyValue("-ms-transform") || style.getPropertyValue("-o-transform") || style.getPropertyValue("transform");
                    if (matrix === 'none') {
                        matrix = 'matrix(0,0,0,0,0)';
                    }
                    var values = matrix.match(/([-+]?[\d\.]+)/g);
                    return values[14] || values[5] || 0;
                },

                new_translate_y: function(element) {
                    var computed_style = window.getComputedStyle(element.get(0));
                    var position = computed_style.getPropertyValue('-webkit-transform') || computed_style.getPropertyValue('-moz-transform') || computed_style.getPropertyValue('-ms-transform') || computed_style.getPropertyValue('-o-transform') || computed_style.getPropertyValue('transform');
                    if (!position || typeof position == 'undefined' || position === 'none') {
                        return 0;
                    } else {
                        var split_position_keys = position.replace(/matrix(3d)?\(|\)/g, '').split(',');
                        if (split_position_keys[14]) {
                            return split_position_keys[14];
                        } else if (split_position_keys[5]) {
                            return split_position_keys[5];
                        } else {
                            return 0;
                        }
                    }
                },

                loop: function() {
                    var container = $('.scroll-container');
                    var wh = $(window).height();
                    var windowScrollTop = $(window).scrollTop();
                    var activeOffset = $(window).height() / 2;
                    var windowScrollTopActiveOffset = windowScrollTop + activeOffset;
                    var destY = windowScrollTop;
                    var currentY = -window.site.scroll.smooth_scroll.translate_y(container);
                    var containerY = -window.site.scroll.smooth_scroll.translate_y(container);

                    if (Math.round(currentY) != Math.round(destY)) {
                        var newY = Math.round(currentY + ((destY - currentY) * 0.1));
                        container.css({
                            transform: 'translate3d(0, -' + newY + 'px, 0)'
                        });
                        $(window).trigger('smoothscroll');
                    }
                    var parallax_elements = $(window.site.scroll.settings.scroll_parallax_elements);
                    if (parallax_elements != null) {
                        parallax_elements.each(function() {
                            var element = $(this);
                            var offsetTop = element.attr('data-top');
                            var offsetBottom = element.attr('data-bottom');
                            var level = Number(element.attr('data-level'));
                            var amplitude = -wh;
                            var movement = amplitude / (5 / level);
                            if (offsetTop > (windowScrollTop + (wh * 1.3))) {
                                element.css({
                                    transform: 'translate3d(0, ' + (-movement * 0.5) + 'px, 0)'
                                });
                            } else if (offsetBottom < (windowScrollTop * 0.7)) {
                                element.css({
                                    transform: 'translate3d(0, ' + (movement * 0.5) + 'px, 0)'
                                });
                            } else {
                                var start = element.attr('data-start');
                                var stop = element.attr('data-stop');
                                var percent = (windowScrollTop - start) / (stop - start);
                                percent = percent - 0.5;
                                var destY = movement * percent;
                                var currentY = 0;
                                var transform = element.css('transform');
                                if (transform != 'none')
                                    currentY = parseFloat(element.css('transform').split(',')[5]);
                                if (level > 0)
                                    var newY = currentY + ((destY - currentY) * 0.1);
                                else
                                    var newY = currentY + ((destY - currentY) * 0.5);
                                element.css({
                                    transform: 'translate3d(0, ' + (newY) + 'px, 0)'
                                });
                                var image = element.find('> .image, .image-container > .image').not('.fixed');
                                if (image.length == 1) {
                                    image.css({
                                        top: 100 * percent
                                    });
                                }
                            }
                        });
                    }

                    requestAnimationFrame(window.site.scroll.smooth_scroll.loop);
                },

                resize_container: function() {
                    var container = $('.scroll-container');
                    $('body').css({
                        height: container.outerHeight()
                    });
                },

                device_enabled: function() {
                    if (window.site.scroll.smooth_scroll_enabled) {
                        var mobile_version = window.site.device.handheld() || $(window).width() < 900 || ($.browser.msie && $.browser.version < 10);
                        return !mobile_version;
                    } else {
                        return false;
                    }
                }

            }
        },

        pageload: {

            splash_dev_mode: false, 
            splash_act_as_server: true,

            init: function() {
            	if ($('body').hasClass('section-error')) {
            		$('body').addClass('first-load-complete');
            		return false;
            	}
                if ('scrollRestoration' in history) {
                	if (window.site.scroll.smooth_scroll_enabled) {
                    	history.scrollRestoration = 'manual';
                    } else {
                    	history.scrollRestoration = 'auto';
                    }
                }
                $('a[href="/artworks/"], a[href^="/artworks/section/"]').each(function() {
                    var this_href = $(this).attr('href');
                	$(this).addClass('link-no-ajax artworks-overlay-button');
                    if (this_href.indexOf('/artworks/section/') == 0 && this_href != '/artworks/section/') {
                        var relative_id = this_href.replace('/artworks/section/', '').replace('/', '');
                        $(this).attr('data-relative-id', relative_id);
                    }
                });

                $('a[href^="/store/artworks/"]').each(function() {
                    if (!$(this).closest('.artwork_detail').length) {
                        if (!$(this).hasClass('pageload-link-type-popup-enabled-content')) {
                            $(this).addClass('pageload-link-type-popup-enabled-content');
                        }
                    }
                });
                $('a[href^="/content/feature/"]').each(function() {
                    if ($(this).attr('href').indexOf('/detail/') > -1) {
                        if (!$(this).closest('.artwork_detail').length) {
                            if (!$(this).hasClass('pageload-link-type-popup-enabled-content')) {
                                $(this).addClass('pageload-link-type-popup-enabled-content');
                            }
                        }
                    }
                });

                $('a.pageload-link-type-popup-enabled-content').click(function() {
                    // Assume background will be reversed - popups are reversed by default
                    //$('body').addClass('content-type-reversed-popup');
                });

                $.pageload({
                    
                    ///////////////////////////////////
                    // Ajax navigation removed for development
                    ///////////////////////////////////
                    'ajax_navigation_enabled': true,


                    'splash_screen_enabled': true,
                    
                    	'splash_screen_always_enabled': !$('body').hasClass('site-version-development-mode') || window.site.pageload.splash_dev_mode || window.site.pageload.splash_act_as_server ? true : false,
                    	'development_mode': false,
                        'development_mode_pause_splash_screen': window.site.pageload.splash_dev_mode ? true : false,


           			'splash_screen_cookie_expiry': 300, // 5m
                    'splash_screen_delay_after_complete': 1000,
                    'splash_screen_auto_delays_enabled': false,
                    //'page_transition_delay': 1200,
                    'page_transition_delay': 810,
                    'popup_content_enabled': true,
                    'verbose': false,
                    'content_area_selector': '.pageload-content-area',
                    'content_load_adjacent': false,

                    'splash_screen_primary_preload_images_selector': '',
                    'preload_images_selector': '',
                    'preload_videos_selector': '',
                    'popstate_custom_functions': {
                        '/artworks/': function(e) {
                            var relative_id = e.originalEvent.state.customArtworksDefaultCategory;
                            $('.artworks-overlay-button:eq(0)').trigger('click');
                            if (relative_id) {
                                $('.artworks-overlay .artwork-nav-top-level[data-id="' + relative_id + '"]').trigger('click');
                            }
                        }
                    },
                    'after_load_complete': function() {
                        setTimeout(function() {
                            if (window._hsq && typeof window._hsq != 'undefined') {
                                var _hsq = window._hsq = window._hsq || [];
                                _hsq.push(['setPath', window.location.pathname]);
                                _hsq.push(['trackPageView']);
                            }
                        }, 400);
                    },
                    'destroy_after_load': function() {
                        if ($('.artworks-overlay').hasClass('active')) {
                            var default_category = false;
                            if ($('.artwork-navigation .artwork-nav-top-level.active').length) {
                                var default_category = $('.artwork-navigation .artwork-nav-top-level.active').attr('data-id');
                            }
                            history.pushState({'ajaxPageLoad': true, 'customArtworksDefaultCategory': default_category}, null, '/artworks/');
                        }

                        if ($('body').hasClass('page-popup-active')) {
                            // A popup is open, close it
                            $.pageload.popup_close(true);
                        }

	                    if ($('.artworks-overlay').hasClass('active')) {
	                    	$('.artworks-overlay-close-button').trigger('click');
	                    }

                        $('video').remove();
                        $('.image_gallery_multiple').cycle('destroy');
                        $('#hero').cycle('destroy');
                        $('.content_slideshow').cycle('destroy');
                        $('#main_slideshow').cycle('destroy');
                        $('#hero').stop().clearQueue().unbind();
                        $('body').removeClass('page-transition-delay');
                        window.site.artlogic_inview.destroy();
                    },
                    'popup_before': function() {
                        window.site.pageload.popup_after_open('before');
                    },
                    'popup_after': function() {
                        window.site.pageload.popup_after_open('after');
                    },
                    'popup_after_close': function() {
                        window.site.pageload.popup_after_close();
                    },
                    'before_load': function() {
                        if (typeof mailings_popup_timeout != 'undefined') {
                            clearTimeout(mailings_popup_timeout);
                        }
                        if ($('.search-overlay').hasClass('active') && !$('.search-overlay').hasClass('search-loading')) {
                    		window.site.overlays.search.close();
                    	}
                        if ($('.enquire-overlay').hasClass('active')) {
                    		window.site.overlays.enquire.close();
                    	}
	                    if ($('.mailing-overlay').hasClass('active')) {
	                        window.site.overlays.mailings.close();
	                    }
                        if ($('.content-overlay').hasClass('active')) {
                            window.site.overlays.content.close();
                        }
                        if ($('#main_slideshow').length) {
                            if (window.window.canvasSlideshowInitialized) {
                                window.canvasPauseVideo(parseInt($('#main_slideshow .slide.cycle-slide-active').attr('data-index'))-1);
                            }
                        }
                        if ($('#store_quick_cart_widget').hasClass('active')) {
                            $('#store_quick_cart_widget .notify_panel_close').trigger('click');
                        }
                        if ($('#wishlist_quick_cart_widget').hasClass('active')) {
                            $('#wishlist_quick_cart_widget .notify_panel_close').trigger('click');
                        }
                    },
                    'preloader_in': function(short_load) {
                        if (!short_load) {
                            window.site.splash_screen.init();
                        } else {
                            // Start the homepage slideshow (can be done anywhere in the code, e.g. after the splash screen has finished)
                            window.site.home.start_slideshow();
                        }
                    },
                    'splash_screen_in': function() {
                    },
                    'splash_screen_out': function() {
                        window.site.splash_screen.splash_screen_end();
                    },
                    'init_after_splash_screen': function() {
                        
                    },

                    'page_transition_start': function() {
                        window.site.splash_screen.letter_animation_start(false);
                    },

                    'page_transition_end': function() {
                        setTimeout(function() {
                            window.site.splash_screen.letter_animation_stop();
                        }, 500);
                    }
                });
                $('.nav-overlay .nav-wrapper ul li a').unbind().click(function() {
                    if ($(this).hasClass('external')) {
                        $('.nav-close-button').trigger('click');
                    } else if (!$(this).hasClass('link-no-ajax')) {
                        $('.nav-close-button').trigger('click');
                        $.pageload.load($(this).attr('href'), true, false);
                        return false;
                    }
                });
                $('#sqcw_checkout a').unbind().click(function() {
                	$.pageload.load($(this).attr('href'), true, function() {
	                    $('#sqcw_close').trigger('click');
                	});
                	return false;
                });
            },

            close_popup: function() {
                window.history.back();
                //$('#popup_box > .inner > .close').trigger('click');
                $('body').removeClass('content-reversed content-not-reversed content-type-reversed-popup');
                $('body').removeClass('user-distraction-free')
                $('body').removeClass('page-artwork-detail-standard');
                $('#popup_box').animate({'scrollTop': 0}, 600);
                $('#popup_content').html('');
            },

            popup_after_open: function(type) {
                $('body').addClass('popup-not-scrolled');

                if (type == 'after') {
                    $('#popup_container').addClass('popup-content-reversed');
                    $('body').addClass('content-type-reversed-popup');
                }
                if (type == 'after' && !$('#popup_content .content-reversed').length) {
                    $('#popup_container').removeClass('popup-content-reversed');
                    $('body').removeClass('content-type-reversed-popup');
                }
                $('body').removeClass('user-inactive user-idle window-scrolled');
            	$('#container_outer').removeClass('scrolling-down scrolling-up');
                window.cart.init();
                window.cart.cart_summary.get_summary(false);

                window.site.social_media.init();
                window.site.overlays.enquire.init();

                window.site.lazy_load.setup();
                window.site.lazy_load.fire('#popup_box .inview_element');

                window.site.artworks.setup();

                $(window).trigger('resize');
                window.site.misc.init('popup');
            },

            popup_after_close: function() {
                $('body').removeClass('content-type-reversed-popup');
                $('body').removeClass('popup-hidable-content user-distraction-free');
                $('body').removeClass('content-reversed content-not-reversed');
                $('body').removeClass('zoom-active user-distraction-free');
                $('body').removeClass('popup-scrolled popup-not-scrolled');
                $('#popup_box .artwork_detail.artwork_detail_variant_video .video').html('');
                $('.image_gallery_multiple').cycle('destroy');
                window.site.scroll.events.run();
                $('#popup_content').scrollTop(0);
            }

        },

        splash_screen: {
            init: function() {

                window.site.splash_screen.letter_animation_start(true);

                $('body').addClass('main-content-hide');
                window.setTimeout(function() {
                    $('body').addClass('active-init');
                    $('body').addClass('splash-init');
                }, 10);
                window.setTimeout(function() {
                    $('.splash-bg').addClass('open start');
                    $('body').addClass('splash-open');
                    // start letter transition
                    $('.hero video').each(function() {
                    	$(this).get(0).pause();
                    });
                }, 500);
                window.setTimeout(function() {
                    window.site.splash_screen.splash_screen_start();
                }, 400);
            },

            splash_screen_start: function() {
                setTimeout(function() {
                	$('.splash-container').addClass('start');
                }, 800);
            },
            
            splash_screen_end: function() {
                setTimeout(function() {

                    window.site.splash_screen.letter_animation_stop();

                    $('.splash-container').addClass('end');

                    // Start the homepage slideshow
                    setTimeout(function() {
                        window.site.home.start_slideshow_pre_init();
                    }, 1000);
                    setTimeout(function() {
                        window.site.home.start_slideshow(false);
                    }, 1500);

                    setTimeout(function() {
                        $('body').removeClass('main-content-hide');
                        window.site.splash_screen.hide_splash();
                    }, 1500);
                }, 1000);
            },

            hide_splash: function() {
                $('.splash-bg').removeClass('open start');
                // stop letter transition
                $('body').removeClass('splash-open');

                $('body').delay(1200).queue(function() {
                    $('body').removeClass('active-init');
                    $('body').removeClass('splash-init');
                    
                    window.site.overlays.mailings.auto();
                    
                    $(window).trigger('resize');
                    $(this).dequeue();
                });
            },

            letter_animation_start: function(splash_mode) {
                var splash_mode = splash_mode && typeof splash_mode != 'undefined' ? splash_mode : false;
                if (splash_mode) {
                    // Splash mode
                    if (window.site.device.breakpoint() < 3) {
                        $('.splash-container .transition-logo-mobile span:eq(0)').addClass('active');
                        $('.splash-container .transition-logo-mobile').each(function(){
                            (function($set){
                                splash_letter_animation_mobile = setInterval(function(){
                                    window.site.splash_screen.letter_animation_run($set);
                                }, 65);
                            })($(this));
                        });
                    } else {
                        $('.splash-container .transition-logo-desktop span:eq(0)').addClass('active');
                        $('.splash-container .transition-logo-desktop').each(function(){
                            (function($set){
                                splash_letter_animation_desktop = setInterval(function(){
                                    window.site.splash_screen.letter_animation_run($set);
                                }, 65);
                            })($(this));
                        });
                    }
                } else {
                    // Page transition mode
                    if (window.site.device.breakpoint() < 3) {
                        $('#container .transition-logo-mobile span:eq(0)').addClass('active');
                        $('#container .transition-logo-mobile').each(function(){
                            (function($set){
                                letter_animation_mobile = setInterval(function(){
                                    window.site.splash_screen.letter_animation_run($set);
                                }, 65);
                            })($(this));
                        });
                    } else {
                        $('#container .transition-logo-desktop span:eq(0)').addClass('active');
                        $('#container .transition-logo-desktop').each(function(){
                            (function($set){
                                letter_animation_desktop = setInterval(function(){
                                    window.site.splash_screen.letter_animation_run($set);
                                }, 65);
                            })($(this));
                        });
                    }
                }
            },

            letter_animation_stop: function() {
                if (typeof splash_letter_animation_mobile != 'undefined') {
                    window.clearInterval(splash_letter_animation_mobile);
                }
                if (typeof splash_letter_animation_desktop != 'undefined') {
                    window.clearInterval(splash_letter_animation_desktop);
                }
                if (typeof letter_animation_mobile != 'undefined') {
                    window.clearInterval(letter_animation_mobile);
                }
                if (typeof letter_animation_desktop != 'undefined') {
                    window.clearInterval(letter_animation_desktop);
                }
                $('.transition-logo-desktop span, .transition-logo-mobile span').removeClass('active');
            },

            letter_animation_run: function(instance) {
                var $set = instance;
                var $cur = $set.find('.active').removeClass('active');
                var $next = $cur.next().length?$cur.next():$set.children().eq(0);
                $next.addClass('active');
            }

        },

        overlays: {

            init: function() {
                window.site.overlays.content.init();
                window.site.overlays.search.init();
                window.site.overlays.mailings.init();
                window.site.overlays.enquire.init();
                window.site.overlays.navigation();
                window.site.overlays.artworks();
            },

	        search: {

	            init: function() {
                	window.site.overlays.search_form.init();
	                window.site.overlays.search.setup();

	            },

	            setup: function() {

	                //window.site.overlays.search.open($('#search'));

	                $('#search_menu, .search-close-button').unbind().click(function() {
	                	var clicked_element = $(this);
	                    $('body').addClass('active-init');
	                    window.setTimeout(function() {
	                        if ($('.search-overlay').hasClass('active')) {
                        		window.site.overlays.search.close();
	                        } else {
                        		window.site.overlays.search.open(clicked_element);
	                        }
	                    }, 50, clicked_element);
	                    return false;
	                });

	                $('#sw_form').each(function() {
	                	if (!$(this).find('.form_row .loader').length) {
	                		$(this).find('.form_row').append('<span class="loader"></span>');
	                	}
	                });

	                $('#quick_search_widget .button a').unbind().click(function() {
	                    window.site.overlays.search.submit_form($(this).closest('#quick_search_widget').find('form'));
	                    return false;
	                });

	            },

	            close: function() {
                    window.setTimeout(function() {
                        $('body').removeClass('active-init');
                    }, 600);
                    $('.search-overlay .overlay-bg').removeClass('open');
                    $('.search-overlay').removeClass('active');
                    $('body, html').removeClass('overlay-open');
                    $('.search-wrapper.visible').removeClass('visible');
	            },

	            open: function(clicked_element, data) {
                	$('#container_outer').removeClass('scrolling-down scrolling-up');
                    $('.search-overlay .overlay-bg').addClass('open');
                    $('.search-overlay').addClass('active');
                    $('body, html').addClass('overlay-open');
                    
                    $('.search-wrapper:not(.visible)').each(function(i) {
                        var $item = $(this);
                        setTimeout(function() {
                            $item.addClass('visible')
                        }, 300*i);
                    });

	                if (window.ga) {
	                    // Track the click in Analytics
                        analytics_params = {
                          'hitType': 'event',
                          'eventCategory': 'Search form opened',
                          'eventAction': window.location.pathname,
                          'eventLabel': $(document).attr('title')
                        };
                        ga('send', analytics_params);
                        ga('tracker2.send', analytics_params);
	                }
	                
	                $('input#sw_field_search')[0].focus();

	            },

	            clear_form: function() {
	                window.site.overlays.search_form.reset_form();
	            },

	            submit_form: function(instance) {

	            },

	            after_submit: function() {

	            }

	        },

	        search_form: {

	            init: function() {

	                window.site.overlays.search_form.setup();

	            },

	            setup: function() {


	                $('input#sw_field_search')
	                    .unbind()
	                    .each(function() {

	                    })
	                    .blur(function() {
	                        if ($(this).val() == '') {
	                            $(this).removeClass('active');
	                        }
	                    })
	                    .focus(function() {
	                        if ($(this).val() == '') {
	                            $(this).addClass('active');
	                        }
	                    })
	                    .keypress(function(e) {
	                        window.site.overlays.search_form.form_submit();
	                    })
	                ;

	                $('#sw_field_search_button').unbind().bind('click', function() {
	                    window.site.overlays.search_form.form_submit();
	                    return false;
	                });

	                $('input#sw_field_search').closest('form').submit(function() {
	                    return false;
	                });

	                $('#sw_more').unbind('click.search_view_more_actions').bind('click.search_view_more_actions', function() {
	                    
	                });
	                
	            },

	            form_submit: function() {
	                var search_value = $('input#sw_field_search').val();
	                if (search_value && search_value.length >= 2) {
	                    $('input#sw_field_search').stop().clearQueue();
	                    $('.search-overlay').addClass('search-loading');
	                    $('input#sw_field_search')
	                        .animate({'opacity': '1'}, 600, function() {
	                            var element_href = '/search/results/?s=' + search_value + '&instant=1';
	                            $.pageload.load(element_href, true, function() {
	                                if (new_page_inner_content) {
	                                    $('#quick_search_widget .notify_panel_content').scrollTop(0);
	                                    $('#sw_results').html(new_page_inner_content);
	                                    $('.search-overlay').removeClass('search-loading search-results-active');
	                                    if ($('#sw_results .item').not('.search-grid-no-results').length) {
	                                        $('.search-overlay').addClass('search-results-active');
	                                        $('#sw_more').attr('href', element_href.replace('&instant=1', ''));
	                                    }
	                                    window.site.layout.grids.init();
                                        window.site.lazy_load.setup();
                                        //window.site.lazy_load.fire($('#sw_results .image_lazy_load'));
	                                    window.site.artlogic_inview.init();
	                                    $(window).trigger('resize');
	                                    $.pageload.refresh($('#quick_search_widget'));
	                                }
	                            }, null, null, null, '');
	                        })
	                    ;
	                }
	            },

	            reset_form: function(instance) {
	                $('input#sw_field_search').val($('input#sw_field_search').attr('data-default-value'));
	                $('#sw_results').html('');
	            }

	        },
	        
            mailings: {

                init: function() {
                    window.site.overlays.mailings.setup();
                },

                setup: function() {

                    $('#mailinglist_signup_button, .mailing-close-button').unbind().click(function() {
                        var clicked_element = $(this);
                        $('body').addClass('active-init');
                        window.setTimeout(function() {
                            if ($('.mailing-overlay').hasClass('active')) {
                                window.site.overlays.mailings.close();
                            } else {
                                window.site.overlays.mailings.open(clicked_element);
                            }
                        }, 50, clicked_element);
                        return false;
                    });
                    
                    window.site.overlays.mailings.auto();

                },
                
                auto: function() {
                
                    // Auto open on all pages other than the homepage
                    if (window.location.pathname != '/') {
                        
                        
                        var cookie_info = h.getCookie('mailinglist_signup_generic_shown');
                        var popup_shown = cookie_info && typeof cookie_info != 'undefined' ? true : false;
                    
                        if (!popup_shown) {
                            mailings_popup_timeout = setTimeout(function() {
                                if (!$('body').hasClass('splash-init') && !$('body').hasClass('splash-open')) {
                                    $('body').addClass('active-init');
                                    window.setTimeout(function() {
                                        if (window.location.pathname == '/store/') {
                                            window.site.overlays.mailings.open(null, null, 'prints');
                                        } else {
                                            window.site.overlays.mailings.open();
                                        }
                                    }, 50);
                                    h.setCookie('mailinglist_signup_generic_shown', true, 30);
                                }
                            }, 2000);
                        }
                        
                    }
                    
                },

                close: function() {
                    window.setTimeout(function() {
                        if (!$('.overlay.active').not('.mailing-overlay').length) {
                            $('body').removeClass('active-init');
                        }
                    }, 600);

                    if (!$('.overlay.active').not('.mailing-overlay').length) {
                        $('body, html').removeClass('overlay-open');
                    }

                    //$('body').removeClass('quick_contact_widget_active');
                    $('.mailing-overlay .overlay-bg').removeClass('open');
                    $('.mailing-overlay').removeClass('active');

                    $(".mailing-input-wrapper.visible, .mailing-contact-wrapper.visible").removeClass('visible');
                },

                open: function(clicked_element, data, form_type) {
                    $('#container_outer').removeClass('scrolling-down scrolling-up');
                    $('.mailing-overlay .overlay-bg').addClass('open');
                    $('.mailing-overlay').addClass('active');
                    $('body, html').addClass('overlay-open');
                    
                    $(".mailing-input-wrapper:not(.visible),.mailing-contact-wrapper:not(.visible)").each(function(i){
                        var $item = $(this);
                        setTimeout(function() {
                            $item.addClass('visible')
                        }, 300);
                    });

                    if (window.ga) {
                        // Track the click in Analytics
                        analytics_params = {
                          'hitType': 'event',
                          'eventCategory': 'Mailing list form opened',
                          'eventAction': window.location.pathname,
                          'eventLabel': $(document).attr('title')
                        };
                        ga('send', analytics_params);
                        ga('tracker2.send', analytics_params);
                    }

                    var form_type = form_type && typeof form_type != 'undefined' ? form_type : 'standard';
                    var data = data && typeof data != 'undefined' ? data : {};
                
                    // Reset form
                    $('#mailinglist_signup .form_checkboxes input').prop('checked', false);
                    $('#mailinglist_signup').removeClass('variant_prints variant_collector');
                    
                    // Load fields as required
                    if (form_type == 'prints') {
                        $('#mailinglist_signup').addClass('variant_prints');
                        $('#mailinglist_signup .form_checkboxes input.checkbox_required_prints').prop('checked', true);
                    } else if (form_type == 'collector') {
                        $('#mailinglist_signup').addClass('variant_collector');
                        $('#mailinglist_signup .form_checkboxes input.checkbox_required_collector').prop('checked', true);
                    } else {
                        $('#mailinglist_signup .form_checkboxes input').prop('checked', false);
                        //$('#mailinglist_signup .form_checkboxes input.checkbox_required_standard').prop('checked', true);
                    }

                }

            },
            
            enquire: {

                init: function() {
                    window.site.overlays.enquire.setup();
                },

                setup: function() {
                    
                    $('.enquire_link, .enquire-close-button').unbind().click(function() {
                        var clicked_element = $(this);
                        $('body').addClass('active-init');
                        window.setTimeout(function() {
                            if ($('.enquire-overlay').hasClass('active')) {
                                window.site.overlays.enquire.close();
                            } else {
                                if (clicked_element.attr('data-type') && typeof clicked_element.attr('data-type') != 'undefined') {
                                    window.site.overlays.enquire.open(clicked_element, {}, clicked_element.attr('data-type'));
                                } else {
                                    window.site.overlays.enquire.open(clicked_element);
                                }
                            }
                        }, 50, clicked_element);
                        return false;
                    });
    
                    $('#quick_contact_widget .form_checkboxes.form_checkboxes_one_plus_required').each(function() {
                        $(this).find('input').change(function() {
                            var these_checkboxes = $(this).closest('.form_checkboxes').find('input');
                            if (these_checkboxes.filter(':checked').length < 1) {
                                these_checkboxes.eq(0).prop('checked', true);
                            }
                        }); 
                    });

                    $('input, textarea', '#quick_contact_widget')
                        .each(function() {
                            $(this).attr('default-value', $(this).parent().find('> label').text());
                            if ($(this).val() != '' && $(this).val() != $(this).attr('default-value')) {
                                $(this).addClass('active');
                            } else {
                                $(this).val($(this).attr('default-value'));
                            }
                        })
                        .change(function() {
                            $(this).closest('.form_row').removeClass('error');
                        })
                        .focus(function() {
                            $(this).closest('.form_row').removeClass('error');
                            if ($(this).val() == $(this).attr('default-value')) {
                                $(this).addClass('active');
                                $(this).val('');
                            }
                            var field_offset_top = $(this).offset().top - 200;
                            $('#quick_contact_widget .notify_panel_content').animate({'scrollTop': field_offset_top}, 0);
                        })
                        .blur(function() {
                            $(this).attr('default-value', $(this).parent().find('label').text());
                            if ($(this).val() == '' || $(this).val() == $(this).attr('default-value')) {
                                $(this).val($(this).attr('default-value'));
                                $(this).removeClass('active');
                            }
                        })
                    ;

                    $('select', '#quick_contact_widget')
                        .each(function() {
                            $(this).attr('default-value', $(this).val());
                        })
                        .change(function() {
                            if ($(this).val() != '') {
                                $(this).addClass('active');
                            } else {
                                $(this).removeClass('active');
                            }
                        })
                    ;

                    $('#quick_contact_widget .notify_panel_close').unbind().click(function() {
                        window.site.enquiry.close();
                    });

                    $('#quick_contact_widget .button a').unbind().click(function() {
                        window.site.overlays.enquire.submit_form($(this).closest('#quick_contact_widget').find('form'));
                        return false;
                    });

                    $('#quick_contact_widget').each(function() {
                        if (!$(this).hasClass('initialized')) {
                            if (false) {
                                $.ajax({
                                    url: "/custom/get_user_data/",
                                    cache: false,
                                    method: 'POST',
                                    success: function(data) {
                                        if (data) {
                                            var parsed_data = JSON.parse(data);
                                            $.each(parsed_data, function(k, v) {
                                                if (v && v != '') {
                                                    $('#quick_contact_widget').find('input[name="' + k + '"]').val(v).addClass('active');
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                        $(this).addClass('initialized');
                    });

                },

                close: function() {
                    window.setTimeout(function() {
                        if (!$('.overlay.active').not('.enquire-overlay').length) {
                            $('body').removeClass('active-init');
                        }
                    }, 600);

                    if (!$('.overlay.active').not('.enquire-overlay').length) {
                        $('body, html').removeClass('overlay-open');
                    }

                    $('body').removeClass('quick_contact_widget_active');
                    $('.enquire-overlay .overlay-bg').removeClass('open');
                    $('.enquire-overlay').removeClass('active');

                    $(".enquire-input-wrapper.visible, .enquire-contact-wrapper.visible").removeClass('visible');
                },

                open: function(clicked_element, data, form_type) {
                    $('#container_outer').removeClass('scrolling-down scrolling-up');
                    $('.enquire-overlay .overlay-bg').addClass('open');
                    $('.enquire-overlay').addClass('active');
                    $('body, html').addClass('overlay-open');
                    
                    $(".enquire-input-wrapper:not(.visible),.enquire-contact-wrapper:not(.visible)").each(function(i){
                        var $item = $(this);
                        setTimeout(function() {
                            $item.addClass('visible')
                        }, 300);
                    });

                    if (window.ga) {
                        // Track the click in Analytics
                        analytics_params = {
                          'hitType': 'event',
                          'eventCategory': 'Enquiry form opened',
                          'eventAction': window.location.pathname,
                          'eventLabel': $(document).attr('title')
                        };
                        ga('send', analytics_params);
                        ga('tracker2.send', analytics_params);
                    }

                    var form_type = form_type && typeof form_type != 'undefined' ? form_type : 'standard';
                    var data = data && typeof data != 'undefined' ? data : {};

                    $('body').addClass('quick_contact_widget_active');
                    $('#quick_contact_widget').addClass('active');
                    $('#quick_contact_widget').clearQueue().delay(10).queue(function() {
                        $(this).addClass('animate').dequeue();
                    });
                    $('#quick_contact_widget').removeClass('success enquiry-type-event-interest enquiry-type-exhibition-catalogue-request');

                    $('#quick_contact_widget form #qcw_field_originating_page').val(window.location.pathname);
                    
                    var additional_field_artist_interest = '';
                    if (clicked_element && typeof clicked_element != 'undefined') {
                        var additional_field_content = $(clicked_element).attr('data-contact-form-details');
                        var additional_field_image = $(clicked_element).attr('data-contact-form-image');
                        var additional_field_parent_id = $(clicked_element).attr('data-contact-form-parent-id');
                        var additional_field_stock_number = typeof $(clicked_element).attr('data-contact-form-stock-number') != 'undefined' ? $(clicked_element).attr('data-contact-form-stock-number') : '';
                        var additional_field_artist_interest = typeof $(clicked_element).attr('data-contact-form-artist-interest') != 'undefined' ? $(clicked_element).attr('data-contact-form-artist-interest') : '';
                        
                        var form_type = $(clicked_element).attr('data-type') && typeof $(clicked_element).attr('data-type') != 'undefined' ? $(clicked_element).attr('data-type') : form_type;
                        var form_subtype = $(clicked_element).attr('data-subtype') && typeof $(clicked_element).attr('data-subtype') != 'undefined' ? $(clicked_element).attr('data-subtype') : '';
                    }
                    
                    $('#quick_contact_widget form #qcw_field_artist_interest').val(additional_field_artist_interest);
                    
                    $('#qcw_field_contact_type').val(form_type);

                    if (form_type == 'event-interest') {
                        $('#quick_contact_widget').addClass('enquiry-type-event-interest');
                    }
                    
                    if (form_type == 'exhibition-catalogue-request') {
                        $('#quick_contact_widget').addClass('enquiry-type-exhibition-catalogue-request');
                    }
                    

                    if (additional_field_content || form_type == 'sales') {

                        // Sales / artwork enquiry form type
                        if (additional_field_content) {
                            if ($('#quick_contact_widget .notify_panel_items').length) {
                                $('#quick_contact_widget .notify_panel_items').html('<ul><li></li></ul>');
                                $('#quick_contact_widget .notify_panel_items li').html('<div class="content">' + decodeURIComponent(additional_field_content) + '</div>');
                                if (additional_field_image) {
                                    var website_domain = '';
                                    if (additional_field_image.substr(0,7) != 'http://' && additional_field_image.substr(0,8) != 'https://') {
                                        var website_domain = 'http://' + document.location.host;
                                    }
                                    $('#quick_contact_widget .notify_panel_items li').prepend('<div class="image"><div><img src="' + website_domain + additional_field_image + '"/></div></div>');
                                }
                                $('#quick_contact_widget form #qcw_field_item').val(encodeURIComponent($('#quick_contact_widget .notify_panel_items li').html()));
                                $('#quick_contact_widget form #qcw_field_stock_number').val(additional_field_stock_number);
                                
                            }
                        }
                    }


                },

                clear_form: function() {
                    $('#qcw_field_item').val('');
                    $('#qcw_field_message', '#quick_contact_widget').each(function() {
                        $(this).val($(this).attr('default-value')).removeClass('active');
                    });
                    $('#qcw_field_subject', '#quick_contact_widget').each(function() {
                        $(this).val('').removeClass('active');
                    });
                    $('#quick_contact_widget .notify_panel_items').html('');
                },
                
                checkboxes_valid: function(instance) {
                    if ($('.form_checkboxes.form_checkboxes_one_plus_required', instance).length) {
                        var these_checkboxes = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).find('input:checked');
                        var these_checkboxes2 = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(1).find('input:checked');
                        var these_checkboxes3 = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(2).find('input:checked');
                        if (these_checkboxes.length > 0) {
                            if ($('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(1).length == 0) {
                                return true;
                            }
                        } else {
                            return false;
                        }
                        if (these_checkboxes2.length > 0 && these_checkboxes3.length > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                },

                submit_form: function(instance) {
                    
                    if (!window.site.overlays.enquire.checkboxes_valid(instance)) {
                        h.alert('Please fill in all the required fields and select one of each category.');
                    } else {
    
                        if (instance) {
                            $('#quick_contact_widget .button').addClass('loading');
                            $('.error_row', instance).removeClass('active');
    
                            data = {}
                            $('input, select, textarea', instance).each(function() {
                                var field_value = $(this).val();
                                if (field_value != $(this).attr('default-value')) {
                                    if ($(this).attr('name') == 'mailchimp_list_id') {
                                        if ($(this).is(':checked')) {
                                            if (data['what_interests_u'] && typeof data['what_interests_u'] != 'undefined') {
                                                // If the checkbox data already exists, add to it
                                                data['what_interests_u'] = data['what_interests_u'] + ', ' + $(this).attr('data-hs-value');
                                            } else {
                                                data['what_interests_u'] = $(this).attr('data-hs-value');
                                            }
                                        }
                                    }
                                    if ($(this).attr('name') == 'mailchimp_category_id') {
                                        if ($(this).is(':checked')) {
                                            if (data['what_best_describes_u'] && typeof data['what_best_describes_u'] != 'undefined') {
                                                // If the checkbox data already exists, add to it
                                                data['what_best_describes_u'] = data['what_best_describes_u'] + ', ' + $(this).attr('data-hs-value');
                                            } else {
                                                data['what_best_describes_u'] = $(this).attr('data-hs-value');
                                            }
                                        }
                                    }
                                    if ($(this).attr('name') == 'mailchimp_category2_id') {
                                        if ($(this).is(':checked')) {
                                            if (data['do_you_work_in_the_arts'] && typeof data['do_you_work_in_the_arts'] != 'undefined') {
                                                // If the checkbox data already exists, add to it
                                                data['do_you_work_in_the_arts'] = data['do_you_work_in_the_arts'] + ', ' + $(this).attr('data-hs-value');
                                            } else {
                                                data['do_you_work_in_the_arts'] = $(this).attr('data-hs-value');
                                            }
                                        }
                                    }
                                    
                                    if ($(this).attr('type') == 'checkbox') {
                                        if ($(this).attr('name') == 'mailchimp_list_id') {
                                            if ($(this).is(':checked')) {
                                                if (data[$(this).attr('name')] && typeof data[$(this).attr('name')] != 'undefined') {
                                                    // If the checkbox data already exists, add to it
                                                    data[$(this).attr('name')] = data[$(this).attr('name')] + ',' + $(this).val();
                                                } else {
                                                    data[$(this).attr('name')] = $(this).val();
                                                }
                                            }
                                        } else if ($(this).attr('name') == 'terms') {
                                            data[$(this).attr('name')] = $(this).is(':checked') ? '1' : '';
                                        } else {
                                            data[$(this).attr('name')] = $(this).is(':checked') ? 'Yes' : 'No';
                                        }
                                    } else {
                                        if ($(this).attr('name') == 'message') {
                                            var this_value = field_value.replace(/\n/g, '<br />').replace('%', 'percent');
                                        } else {
                                            var this_value = $(this).val();
                                        }
                                        data[$(this).attr('name')] = this_value;
                                    }
                                }
                            })
                            .promise()
                            .done(function() {
                                var data_string = '';
                                
                                var data_string = Object.keys(data).map(function(key) {
                                    return key + '=' + data[key]
                                }).join('&');
    
                                data_string = data_string + '&submit=1&originating_page=' + encodeURIComponent(window.location.pathname + window.location.search) + '&';
                                
                                $.ajax({
                                    url: "/enquiry/",
                                    data: data_string,
                                    cache: false,
                                    method: 'POST',
                                    dataType: 'json',
                                    success: function(data) {
                                        setTimeout(function() {
                                            $('#quick_contact_widget .button').removeClass('loading');
                                        }, 1600);
                                        $('#quick_contact_widget')
                                            .delay(400)
                                            .queue(function() {
                                                if (data['success'] == 1) {
                                                    window.site.hubspot.log($(instance));
                                                    window.archimedes.archimedes_core.analytics.track_campaigns.save_form_data($('#quick_contact_widget'));
        
                                                    $('#quick_contact_widget').addClass('success');
                                                    if (window.ga) {
                                                        // Track in Analytics
                                                        analytics_params = {
                                                          'hitType': 'event',
                                                          'eventCategory': 'Enquiry form submit success',
                                                          'eventAction': window.location.pathname,
                                                          'eventLabel': $(document).attr('title')
                                                        };
                                                        ga('send', analytics_params);
                                                        ga('tracker2.send', analytics_params);
                                                    }
        
                                                    window.site.overlays.enquire.close();
        
                                                    $('#quick_contact_widget')
                                                        .delay(200)
                                                        .queue(function() {
                                                            h.alert('<h2>Thank you</h2><div>Your enquiry has been sent.</div>');
                                                            $(this).dequeue();
                                                        })
                                                    ;
                                                    
                                                    if (typeof fbq != 'undefined') {
                                                        fbq('track', 'Contact');
                                                    }
        
                                                } else {
                                                    var error_message = '';
                                                    if (data['error_message'] && typeof data['error_message'] != 'undefined') {
                                                        var error_message = data['error_message'];
                                                    }
                                                    var field_errors = [];
                                                    if (data['field_errors'] && typeof data['field_errors'] != 'undefined') {
                                                        var field_errors = data['field_errors'];
                                                    }
                                                    $.each(field_errors, function(i, v) {
                                                        $('#quick_contact_widget').find('[name="' + v + '"]').closest('.form_row').addClass('error');
                                                    });
                                                    if (error_message) {
                                                        h.alert(error_message);
                                                    }
        
                                                    if (window.ga) {
                                                        // Track in Analytics
                                                        analytics_params = {
                                                          'hitType': 'event',
                                                          'eventCategory': 'Enquiry form submit error',
                                                          'eventAction': window.location.pathname,
                                                          'eventLabel': $(document).attr('title')
                                                        };
                                                        ga('send', analytics_params);
                                                        ga('tracker2.send', analytics_params);
                                                    }
        
                                                }
                                                $(this).dequeue();
                                            })
                                       ;
                                    }
                                });
                            });
                        }
                    }

                },

                after_submit: function() {

                }

            },

            content: {

                init: function() {
                    window.site.overlays.content.setup();
                },

                setup: function() {

                    $('.content_overlay_link_example, .content-overlay .overlay-close-button').unbind().click(function() {
                        var clicked_element = $(this);

                        if ($('.content-overlay').hasClass('active')) {
                            window.site.overlays.content.close();
                        } else {
                            window.site.overlays.content.open(clicked_element);
                        }

                        return false;
                    });

                },

                close: function() {
                    window.setTimeout(function() {
                        $('body').removeClass('active-init');
                    }, 600);
                    $('.content-overlay .overlay-bg').removeClass('open');
                    $('.content-overlay').removeClass('active');
                    $('body, html').removeClass('overlay-open content-overlay-open');
                    $(".content-overlay-wrapper.visible").removeClass('visible');

                    $('.content-overlay .overlay-container-inner').scrollTop(0);

                    $('.list-preview-track-list .item').removeClass('active');
                    $('.list-preview-track-list').removeClass('item-preview-active');
                },

                open: function(clicked_element, received_html) {
                    var received_html = (received_html && typeof received_html != 'undefined' ? received_html : '');

                    $('#content-overlay-content').html(received_html);

                    $('body').addClass('active-init');

                    $(clicked_element).closest('.item').addClass('active');
                    $(clicked_element).closest('.list-preview-track-list').addClass('item-preview-active');

                    setTimeout(function() {
                        $('#container_outer').removeClass('scrolling-down scrolling-up');
                        $('.content-overlay .overlay-bg').addClass('open');
                        $('.content-overlay').addClass('active');
                        $('body, html').addClass('overlay-open content-overlay-open');
                        
                        setTimeout(function() {
                            $('.content-overlay-wrapper:not(.visible)').each(function(i){
                                $(this).addClass('visible')
                            });
                        }, 700, clicked_element);
                    }, 50, clicked_element);

                    if (window.ga) {
                        // Track the click in Analytics
                        analytics_params = {
                          'hitType': 'event',
                          'eventCategory': 'Whats on event preview opened',
                          'eventAction': window.location.pathname,
                          'eventLabel': $(document).attr('title')
                        };
                        ga('send', analytics_params);
                        ga('tracker2.send', analytics_params);
                    }

                }

            },

            navigation: function() {
                $('#menu, .nav-close-button').unbind().click(function() {
                	$('#container_outer').removeClass('scrolling-down scrolling-up');
                    $('body').addClass('active-init');
                    window.setTimeout(function() {
                        if ($('.nav-overlay').hasClass('active')) {
                            window.setTimeout(function() {
                                $('body').removeClass('active-init');
                            }, 600);
                            $('.nav-overlay .overlay-bg').removeClass('open');
                            $('.nav-overlay').removeClass('active');
                            $('body, html').removeClass('overlay-open nav-overlay-open');

                            $(".nav-contact-module.visible, .nav-wrapper li.visible").removeClass('visible');
                        } else {
                            $('.nav-overlay .overlay-bg').addClass('open');
                            $('.nav-overlay').addClass('active');
                            $('body, html').addClass('overlay-open nav-overlay-open');

                        
                            $(".nav-contact-module:not(.visible)").each(function(i){
                                var $item = $(this);
                                setTimeout(function() {
                                    $item.addClass('visible')
                                }, 300*i);
                            });
                            $(".nav-wrapper li:not(.visible)").each(function(i){
                                var $item = $(this);
                                setTimeout(function() {
                                    $item.addClass('visible')
                                }, 100*i);
                            });
                        }
                    }, 50);

                });
                
                $('.fire-pageload').unbind().click(function() {

                    var this_link = $(this).attr('data-link');
                    
                    $('.nav-overlay').addClass('animate-out').removeClass('active');
                    
                    $(".nav-contact-module.visible").each(function(i){
                        var $item = $(this);
                        setTimeout(function() {
                            $item.removeClass('visible');
                        }, 300*i);
                    });
                    $(".nav-wrapper li.visible").each(function(i){
                        var $item = $(this);
                        setTimeout(function() {
                            $item.removeClass('visible');
                        }, 100*i);
                    });

                    window.setTimeout(function() {
                        window.location.href = this_link;
                    }, 1500, this_link);
                });

            },

            artworks: function() {
                        //history.pushState({'ajaxPageLoad': true}, null, '/artworks/');
                        //$('body').addClass('page-popup-clicked-close');
                        //window.history.back();
                $('.artworks-overlay-button, .artworks-overlay-close-button').unbind('click.artworks-overlay-click').bind('click.artworks-overlay-click', function(e) {
                    var clicked_element = $(this);
                	$('#container_outer').removeClass('scrolling-down scrolling-up');
                    $('body').addClass('active-init');
                    window.setTimeout(function() {
                        if ($('.artworks-overlay').hasClass('active')) {
                            $('.artworks-overlay').removeClass('show-content');

                            $(".nav-contact-module.visible, .nav-wrapper li.visible").removeClass('visible');
                            

                            setTimeout(function() {
	                            $('.artworks-overlay .overlay-bg').removeClass('open');
	                            $('.artworks-overlay').removeClass('active');
                            	$('body, html').removeClass('overlay-open artworks-overlay-open');

	                            setTimeout(function() {
	                                $('body').removeClass('active-init');
                                    $('.artwork-nav-top-level').removeClass('active not-active');
                                    $('.artworks-overlay-content').removeClass('second-level-active');
	                            }, 600);
                            }, 200);
                            
		                    $('.artwork-nav-top-level .artwork-nav-hero').each(function() {
		                    	$(this).find('.image').filter(':eq(0)').addClass('active');
		                    });
                        } else {
                            var relative_id = clicked_element.attr('data-relative-id') && typeof clicked_element.attr('data-relative-id') != 'undefined' ? clicked_element.attr('data-relative-id') : false;
                            window.site.lazy_load.fire($('.artworks-overlay .image_lazy_load'));
                            $('.artworks-overlay .overlay-bg').addClass('open');
                            $('.artworks-overlay').addClass('active');
                            $('body, html').addClass('overlay-open artworks-overlay-open');

                            setTimeout(function() {
                                $('.artworks-overlay').addClass('show-content');
                            }, 400);
                        
                            setTimeout(function() {
	                        	if ($('body, html').hasClass('nav-overlay-open')) {
		                            $('.nav-overlay .overlay-bg').removeClass('open');
		                            $('.nav-overlay').removeClass('active');
		                            $('body, html').removeClass('nav-overlay-open');
		                            $('.nav-contact-module.visible, .nav-wrapper li.visible').removeClass('visible');
	                        	}
                            }, 800);

                            if (relative_id) {
                                $('.artworks-overlay .artwork-nav-top-level[data-id="' + relative_id + '"]').trigger('click');
                            }
                        }
                    }, 50, clicked_element);
                    return false;
                });

                $('.artwork-navigation a').unbind().click(function() {
                	var selected_element = $(this).closest('li');
                	var this_href = $(this).attr('href');
                	//$('.artworks-overlay-close-button').trigger('click');
                	$(this).closest('li').addClass('selected');
                	//$(this).closest('ul').find('li').not('.selected').each(function() {
                	//	$(this).slideUp(800);
                	//});

                	$('.artwork-navigation').addClass('nav-selected');
                	//setTimeout(function() {
                	//	$(selected_element).addClass('selected2')
                	//}, 600, selected_element);
                	//setTimeout(function() {
                		$.pageload.load(this_href, true, false);
                	//}, 1200, this_href);
                	return false;
                });

                $('.artworks-overlay-content').each(function() {
                	$('.artwork-nav-top-level').unbind().bind('click.artist-nav-click', function() {
                		var this_instance = $(this);
                		if (!this_instance.hasClass('active') && !$('.artworks-overlay-content').hasClass('nav-transitioning')) {
	                		$(this).closest('.artworks-overlay-content').find('.artwork-nav-top-level').not(this_instance).removeClass('active').addClass('not-active');
	                		$(this).addClass('active').removeClass('not-active');
	                		$(this).closest('.artworks-overlay-content').addClass('second-level-active');

		                    $(this).closest('.artworks-overlay-content').find('.artwork-nav-top-level').not(this_instance).find('.artwork-nav-wrapper li.visible').each(function(i){
		                        var $item = $(this);
		                        setTimeout(function() {
		                            $item.removeClass('visible');
		                        }, 100*i);
		                    });

		                    $(this).closest('.artwork-nav-top-level').find('.artwork-nav-wrapper li').each(function(i){
		                        var $item = $(this);
		                        setTimeout(function() {
		                            $item.addClass('visible');
		                        }, 100*i);
		                    });

                            if (false) {
                    			$('.artworks-overlay-content').addClass('nav-transitioning');
    							$('.artworks-overlay-content').removeClass('nav-not-transitioning');
                    			setTimeout(function() {
    								$('.artworks-overlay-content').removeClass('nav-transitioning');
    								$('.artworks-overlay-content').addClass('nav-not-transitioning');
                    			}, 600);
                            }

                            var this_top_level_category_offset_top = $(this).offset().top - $('.artwork-navigation').offset().top;
                            if (this_top_level_category_offset_top > 0) {
                                $('.overlay-container-inner').animate({'scrollTop': this_top_level_category_offset_top}, 600, 'easeInOutExpo');
                            }
                		}
                	});
                	$('.artwork-nav-top-level').hover(
                		function() {
                			$('.artworks-overlay-content').addClass('top-level-hover');
                			$(this).parent().find('.artwork-nav-top-level').not(this).removeClass('last-hover');
                			//$(this).addClass('last-hover');
                		},
                		function() {
                			$('.artworks-overlay-content').removeClass('top-level-hover');
                		}
            		);

                    if (!window.site.device.handheld() && window.site.device.breakpoint() > 2) {
                    	$('.artwork-nav-top-level .artwork-nav-wrapper ul li').hover(
                    		function() {
                    			if (!$('.artwork-navigation').hasClass('nav-selected')) {
    	                			var hero_instance = $(this).closest('.artwork-nav-top-level').find('.artwork-nav-hero');
    	                			var this_index = $(this).index() + 1;
    	                			hero_instance.find('.artwork-image').removeClass('active');
    	                			hero_instance.find('.artwork-image').filter(':eq(' + this_index + ')').addClass('active');
    	                			$(this).closest('.artwork-nav-top-level').addClass('subnav-hover');
    	                		}
                    		},
                    		function() {
                    			if (!$('.artwork-navigation').hasClass('nav-selected')) {
    	                			var hero_instance = $(this).closest('.artwork-nav-top-level').find('.artwork-nav-hero');
    	                			hero_instance.find('.artwork-image').removeClass('active');
    	                			hero_instance.find('.artwork-image').filter(':eq(0)').addClass('active');
    	                			$(this).closest('.artwork-nav-top-level').removeClass('subnav-hover');
    	                		}
                    		}
                		);
                    }

            		// Reset everything in case we have loaded from a previous page and some of the settings remain from before
                    $('.artwork-nav-top-level .artwork-nav-hero').each(function() {
                    	$(this).find('.artwork-image').filter(':eq(0)').addClass('active');
                    });
                    $('.artwork-navigation').removeClass('nav-selected');
                    $('.artwork-nav-wrapper ul li').removeClass('selected').attr('style', '');
                });

                // Artwork menu permalink page
                if (window.location.pathname.indexOf('/artworks/section/') == 0) {
                    var relative_id = window.location.pathname.replace('/artworks/section/', '').replace('/', '');
                    if (relative_id) {
                        $('.artwork-nav-top-level[data-id="' + relative_id + '"]').trigger('click');
                    }
                }
                if (window.location.pathname == '/artworks/' || window.location.pathname.indexOf('/artworks/section/') == 0) {
                    window.site.lazy_load.fire($('.artwork-navigation .image_lazy_load'));
                }

                ///////////////////////////////////////////
                ///////////////////////////////////////////
                // OPEN AUTOMATICALLY FOR DEVELOPMENT
                //$('.artworks-overlay-button').trigger('click');
                ///////////////////////////////////////////
                ///////////////////////////////////////////
                /*
                $('.fire-pageload').unbind().click(function() {

                    var this_link = $(this).attr('data-link');
                    
                    $('.nav-overlay').addClass('animate-out').removeClass('active');
                    
                    $(".nav-contact-module.visible").each(function(i){
                        var $item = $(this);
                        setTimeout(function() {
                            $item.removeClass('visible');
                        }, 300*i);
                    });
                    $(".nav-wrapper li.visible").each(function(i){
                        var $item = $(this);
                        setTimeout(function() {
                            $item.removeClass('visible');
                        }, 100*i);
                    });

                    window.setTimeout(function() {
                        window.location.href = this_link;
                    }, 1500, this_link);
                });
                */



            }

        },

        artlogic_inview: {

        	default_elements: '.inview_element, .hide-off-screen, .scroll_section_top, .faux_footer, .records_slider_panel',

        	options: {
				rootMargin: '0px', //Viewport margins 10px 20px 30px 40px
				threshold: [0, 0.1, 0.3, 0.5, 0.7, 1]  //how much needs to be showing. Fires IN and Out by that amount
            },

            init: function(context) {
                
                $('#container').removeClass('hero-section-visible');
                $('#container').addClass('hero-section-not-visible');
                $('#container_outer').removeClass('page-enquiry-visible');
                $('#container_outer').addClass('page-enquiry-not-visible');

                if (window.site.device.handheld_not_ios()) {
                	// Compatability mode if intersection observer does not work
                	// $.browser.name == 'mozilla'
                	$(window.site.artlogic_inview.default_elements).each(function() {
	                    var $entry = $(this);

                    	if ($entry.hasClass('inview_element')) {
	                    	$entry.addClass('visible');
                            var video_element = $entry.find('video');
                            var lazy_load_context = $('.image_lazy_load');
                            var lazy_load_element = $entry.find('.image_lazy_load').not('.loaded, .loading');
                            var position_of_lazy_load_element = lazy_load_context.index($entry.find('.image_lazy_load'));

                            var lazy_load_element_to_fire = lazy_load_element;
                            if (position_of_lazy_load_element > 0) {
                            	var adjacent_lazy_load_elements = lazy_load_context.slice(position_of_lazy_load_element, position_of_lazy_load_element + 4);
                            	lazy_load_element_to_fire = adjacent_lazy_load_elements;
                            }

                            if (lazy_load_element_to_fire.length) {
                            	window.site.lazy_load.fire(lazy_load_element_to_fire);
                            }

                            if (video_element.length && window.site.device.video_inline()) {
                                video_element.get(0).play();
                            }
                        }
                	});
                    $(window).bind('scroll', window.site.throttle(50, function() {
                        $(window.site.artlogic_inview.default_elements).each(function() {
                            var $entry = $(this);
                            if ($entry.hasClass('faux_footer')) {
                                 if ($(window).scrollTop() + $(window).height() > $entry.offset().top) {
                                    $('#container').addClass('footer-visible');
                                 } else {
                                    $('#container').removeClass('footer-visible');
                                 }
                            }
                            if ($entry.hasClass('scroll_section_top') && $entry.hasClass('hide-off-screen')) {
                                if ($(window).scrollTop() > $(window).height()) {
                                    if (!$entry.hasClass('hidden-off-screen')) {
                                        $entry.addClass('hidden-off-screen')
                                    }
                                    if (!$('#container').hasClass('hero-section-not-visible')) {
                                        $('#container').addClass('hero-section-not-visible')
                                        $('#container').removeClass('hero-section-visible');
                                    }
                                } else {
                                    if ($entry.hasClass('hidden-off-screen')) {
                                        $entry.removeClass('hidden-off-screen ')
                                    }
                                    if (!$('#container').hasClass('hero-section-visible')) {
                                        $('#container').removeClass('hero-section-not-visible')
                                        $('#container').addClass('hero-section-visible');
                                    }
                                }
                            }
                        });
                    }));
                } else {

	                var default_context = window.site.artlogic_inview.default_elements;
	                var context = (context && typeof context != 'undefined' ? context : default_context);

	                // SETUP THE OBSERVER
	                artlogic_observer = new IntersectionObserver(window.site.artlogic_inview.callback, window.site.artlogic_inview.options);

	                /// SET TARGETS
	                var targets = document.querySelectorAll(context);
	                // Watch the targets
	                for (var i = targets.length - 1; i >= 0; i--) {
	                	// UNBIND OBSERVERS IF THEY ARE ALREADY RUNNING
	                	artlogic_observer.unobserve(targets[i]);
	                }
	                for (var i = targets.length - 1; i >= 0; i--) {
	                	// OBSERVE ELEMENTS
	                    artlogic_observer.observe(targets[i]);
	                }
	                $('.inview_element').addClass('animate-from-bottom');
                }

    
            },

            destroy: function() {
            	if (typeof artlogic_observer == 'undefined') {
            		artlogic_observer = false;
            	}
            	if (artlogic_observer && typeof artlogic_observer != 'undefined') {
	            	var elements = window.site.artlogic_inview.default_elements;
	                var targets = document.querySelectorAll(elements);
	                for (var i = targets.length - 1; i >= 0; i--) {
	                	artlogic_observer.unobserve(targets[i]);
	                }
            	}
            },
            
            callback: function(entries, observer) {

                entries.forEach(function(entry) {
                    
                    var $entry = $(entry.target);
                    var ratio_onscreen = entry.intersectionRatio;

                    /////GALLERY SECTIONS
                    if ($entry.hasClass('inview_element')) {
                        var video_element_embed = $entry.find('.video_embed_wrapper');
                        var video_element = $entry.find('video');
                        var intro_content = $entry.hasClass('inview_element_intro');
                        $entry.attr('data-ratio_onscreen', ratio_onscreen);
                        if (!entry.isIntersecting) {
                            // SETTING ABOVE AND BELOW CLASSES
                            if (entry.boundingClientRect.top >= 0){
                                //Scrolling down
                                $entry.addClass('animate-from-bottom').removeClass('animate-from-top');
                            } else {
                                //Scrolling up
                                $entry.addClass('animate-from-top').removeClass('animate-from-bottom');
                            }
                            $entry.removeClass('visible');
                            if (video_element.length) {
                                video_element.get(0).pause();
                            }
                            if (video_element_embed.length) {
                                if (video_element_embed.hasClass('video_playing')) {
                                    video_element_embed.removeClass('video_playing');
                                    video_element_embed.find('.video_embed_pause').trigger('click');
                                }
                            }
                            if (intro_content) {
                            	//$entry.removeClass('inview_element_intro_timeout');
                            }
                            if ($entry.hasClass('page_enquiry_widget')) {
                            	if (!entry.boundingClientRect.top >= 0){
	                            	$('#container_outer').removeClass('page-enquiry-visible');
                                    $('#container_outer').addClass('page-enquiry-not-visible');
	                            }
                            }
                        } else {
                            $entry.addClass('visible');
                            var lazy_load_context = $('.image_lazy_load');
                            var lazy_load_element = $entry.find('.image_lazy_load').not('.loaded, .loading');
                            var position_of_lazy_load_element = lazy_load_context.index($entry.find('.image_lazy_load'));

                            var lazy_load_element_to_fire = lazy_load_element;
                            if (position_of_lazy_load_element > 0) {
                            	var adjacent_lazy_load_elements = lazy_load_context.slice(position_of_lazy_load_element, position_of_lazy_load_element + 12);
                            	lazy_load_element_to_fire = adjacent_lazy_load_elements;
                            }

                            if (lazy_load_element_to_fire.length) {
                            	window.site.lazy_load.fire(lazy_load_element_to_fire);
                            }

                            if (video_element.length && window.site.device.video_inline()) {
                           	    video_element.get(0).play();
                            }
                            
                            if (video_element_embed.length) {
                                if (!video_element_embed.hasClass('video_playing')) {
                                    video_element_embed.addClass('video_playing');
                                    video_element_embed.find('.video_embed_play').trigger('click');
                                }
                            }

                            if (intro_content) {
                            	window.setTimeout(function() {
                            		$entry.addClass('inview_element_intro_timeout');
                            	}, 2000, $entry);
                            }
                            if ($entry.hasClass('page_enquiry_widget')) {
                            	$('#container_outer').addClass('page-enquiry-visible');
                                $('#container_outer').removeClass('page-enquiry-not-visible');
                            }
                        }
                    }

                    ///// Footer
                    if ($entry.hasClass('faux_footer')) {
                        if (entry.isIntersecting) {
                        	$('#container').addClass('footer-visible');
                        	if ( ratio_onscreen > 0.5) {
                        		$('#container').addClass('footer-visible2');
                        	}
                        	if ( ratio_onscreen > 0.75) {
                        		$('#container').addClass('footer-visible3');
                        	}
                    	} else {
                        	$('#container').removeClass('footer-visible footer-visible2 footer-visible3');
                    	}
                    }
                    
                    ///// DEACTIVATE EXPENSIVE STUFF WHEN OUT OF SITE
                    if ($entry.hasClass('hide-off-screen')) {
                        if (entry.isIntersecting) {
                            $entry.removeClass('hidden-off-screen');
                        } else {
                            $entry.addClass('hidden-off-screen');
                        }
                    }

                    if ($entry.hasClass('scroll_section_top')) {
                        if (entry.isIntersecting) {
                            $('#container').removeClass('hero-section-not-visible');
                            $('#container').addClass('hero-section-visible');
                        } else {
                            $('#container').addClass('hero-section-not-visible');
                            $('#container').removeClass('hero-section-visible');
                        }
                    }

                });
            }
        },

        lazy_load: {

        	init: function() {
        		window.site.lazy_load.setup();
        		// Fire lazy load on the first few elements
        		window.site.lazy_load.fire($('.image_lazy_load').slice(0,3));
        	},

        	setup: function() {
                $('.image_lazy_load').each(function() {
                    // Only process lazy load images if they do not already have a loading class
                    if ($(this).find('img').length && !$(this).hasClass('loading') && !$(this).hasClass('initialized')) {
                    	if (false) {
                    		// Development functionality to show an initial low resolution image before the high-res is lazy-loaded
	                    	var image_src_init = $(this).find('img').attr('data-src-init');
	                    	if (image_src_init && typeof image_src_init != 'undefined') {
	                    		$(this).append('<img class="init_img" src="' + image_src_init + '" />');
	                    	}
                    	} else {
                    		$(this).append('<span class="loader"><svg viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></span>');
                    	}
                    }
                    $(this).addClass('initialized');
                });
        	},

        	fire: function(element) {
                $(element).each(function() {
                	if ((!$(this).hasClass('loaded') || $(this).hasClass('loading')) && $(this).hasClass('initialized')) {
	                	$(this).addClass('loading');
	                    $(this).find('img[data-src]').each(function() {
	                        var image_src = $(this).attr('data-src');
	                        $(this).attr('src', image_src)
	                            .load(function() {
	                                $(this).closest('.image_lazy_load').trigger('change.lazyload');
	                                $(this).trigger('change.lazyload');
	                                if ($(this).closest('.image_lazy_load').hasClass('loading')) {
	                                    $(this)
	                                        .delay(100)
	                                        .queue(function() {
	                                            $(this).closest('.image_lazy_load').removeClass('loading').addClass('loaded');
	                                            $(this).dequeue();
	                                        })
	                                        .delay(500)
	                                        .queue(function() {
	                                            $(this).closest('.image_lazy_load').removeClass('loading-init');
	                                            $(this).closest('.image_lazy_load').find('.loader').remove();
	                                            $(this).dequeue();
	                                        })
	                                    ;
	                                }
	                            })
	                        ;
	                    });
                	}
                });
        	}

        },

        artworks: {

        	init: function() {
        		window.site.artworks.setup();
        	},

        	setup: function() {

        		window.site.artworks.resize();
                $(window).resize(function() {
                    window.site.artworks.resize();
                });

        		$('.artwork_detail').each(function() {
        			$(this).addClass('visible');
	        		window.site.lazy_load.fire($('.artwork_hero_image_container'));
	        		window.site.lazy_load.fire($('.artwork_detail .image_lazy_load'));

                    if ($('.artwork_detail_add_to_cart_wrapper .fallback_cart_wrapper', this).length) {
                        $('.tools .enquire_link', this).parent().remove();
                    }
        		});

        		$('.artwork_detail .image').unbind('click.zoom-activate').bind('click.zoom-activate', function() {
                    if (window.site.device.breakpoint() >= 3) {
                        if (!$('body').hasClass('user-distraction-free')) {
                            $('body').addClass('user-distraction-free');
                        } else if (!$('body').hasClass('zoom-active') && $(this).hasClass('super_zoom_enabled')) {
                            $(this).closest('.artwork_detail').addClass('zoom-active');
                            $('body').addClass('zoom-active');
                        } else {
                            $(this).closest('.artwork_detail').removeClass('zoom-active');
                            setTimeout(function() {
                                $('body').removeClass('zoom-active user-distraction-free');
                            }, 400);
                        }
                    }
        		});

                $('.artwork_detail .image_container, .artwork_detail .image_container .image .image_inner').each(function() {
                    if (!window.site.device.handheld()) {
                        // Disabled on handheld as this stops users from swiping through the works.
                        var zoom_image = $(this).attr('data-zoom-url');
                        var zoom_type = $('.artwork_detail_type_standard').length || window.site.device.handheld() ? 'click' : 'mouseover';
                        if (zoom_image && typeof zoom_image != 'undefined') {
                            $(this).zoom({
                                url: zoom_image,
                                duration: 400,
                                on: zoom_type,
                                onZoomIn: function(){
                                    $('body').addClass('zoom-active');
                                },
                                onZoomOut: function(){
                                    $('body').removeClass('zoom-active');
                                }}
                            );
                        }
                    }
                });


                $('.image_gallery_multiple')
                    .each(function() {
                        $(this)
                            .cycle({
                                fx:       'fade',
                                speed:    600,
                                timeout:  12000,
                                paused:    true,
                                slides: '>',
                                autoHeight: false,
                                swipe: true
                            })
                            .on('cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
                                var hero_slide = $(incomingSlideEl).hasClass('image_hero_placeholder');
                                if (hero_slide) {
                                    $('.artwork_hero_image_container').addClass('active');
                                } else {
                                    $('.artwork_hero_image_container').removeClass('active');
                                }
                            })
                        ;
                        
                        $(this).parent().find('.pagination_controls_previous').unbind().bind('click', function() {
                            $(this).closest('.image_gallery_multiple_container').find('.image_gallery_multiple').cycle('pause').cycle('prev');
                            return false;
                        });
                        $(this).parent().find('.pagination_controls_next').unbind().bind('click', function() {
                            $(this).closest('.image_gallery_multiple_container').find('.image_gallery_multiple').cycle('pause').cycle('next');
                            return false;
                        });
                    })
                ;

                if (false) {
                	// Add shipping info next to add to cart buttons
	                $('.artwork_detail .store_item').each(function() {
	                    if (!$('.delivery_info', this).length && !$('.price.sold_out', this).length) {
	                        $(this).append('<div class="delivery_info">Free UK shipping</div>')
	                    }
	                });
                }

                $('.artwork_detail').each(function() {
                    $('.artwork_detail_type_editions').append('<div class="footer">' + $('#footer').html() + '</div>');
                    window.site.mailing_list_form.init();
                });

                $('.artwork_hero_image_container').on('change.lazyload', function() {
                    var hero_image_path = $(this).find('.image_hero_full_image_duplicate').attr('src');
                    $('.artwork_hero_image_container .image').css({'background-image': "url('" + hero_image_path + "')"});
                });

                $('.image_gallery_multiple .image:eq(0)')
                    .each(function() {
                        var hero_slide = $(this).hasClass('image_hero_placeholder');
                        if (hero_slide) {
                            $('.artwork_hero_image_container').addClass('active');
                        }
                    })
                ;

                $('.image_gallery_multiple_thumbnails a')
                	.unbind()
                    .click(function() {
                    	$('.artwork_detail').removeClass('zoom-active');
                        if ($('body').hasClass('page-popup-active')) {
                            var container_scroll_top = $('#popup_content').scrollTop();
                            var scroll_context = $('#popup_content');
                        } else {
                            var container_scroll_top = $(window).scrollTop();
                            var scroll_context = $('html,body');
                        }
                        if (container_scroll_top > $('.image_gallery_multiple').offset().top - scroll_context.offset().top + 20) {
                            scroll_context.animate({'scrollTop': 0}, 600, 'easeInOutExpo');
                        }
                        $('.image_gallery_multiple').cycle(parseInt($(this).attr('data-index')));
                        return false;
                    })
                ;

                if (window.site.device.handheld()) {
                    prevous_drag_percentage = 0;
                    var x;

                    var freezeVp = function(e) {
                        e.preventDefault();
                    };
                    function stopBodyScrolling (bool) {
                        if (bool === true) {
                            document.body.addEventListener("touchmove", function(e) {
                                e.preventDefault();
                            }, {passive: false});
                        } else {
                            document.body.removeEventListener("touchmove", function(e) {
                                e.preventDefault();
                            }, {passive: false});
                        }
                    }

                    $('.artwork_detail')
                        .on('touchstart', function(e) {
                            x = e.originalEvent.targetTouches[0].pageX // anchor point
                        })
                        .on('touchmove', function(e) {
                            $('.artwork_detail').addClass('dragging');
                            var change = e.originalEvent.targetTouches[0].pageX - x;
                            var percentage = 100 * change / window.innerWidth;
                            var drag_element = $('.artwork_detail .draginner');
                            if (change < -10 || change > 10) {
                                var condition_context = $('.artwork_detail').closest('#popup_content').length ? '#popup_content' : '#container_outer';
                                var condition = !$(condition_context).hasClass('scrolling');
                                if (condition) {
                                    // not yet working ios: stopBodyScrolling(true);
                                    $('body').addClass('content-swipe');
                                    drag_element.css({'transform': 'translate3d(' + percentage + '%, 0, 0)'});
                                    $('.artwork_detail .draginner').attr('data-left', percentage);
                                    prevous_drag_percentage = percentage;
                                } else {

                                }
                            }
                        })
                        .on('touchend', function(e) {
                            // not yet working ios: stopBodyScrolling(false);
                            $('.artwork_detail').removeClass('dragging');
                            var percentage = $('.artwork_detail .draginner').attr('data-left');
                            var drag_element = $('.artwork_detail .draginner');
                            $('.artwork_detail').removeClass('dragging');
                            window.setTimeout(function() {
                                $('body').removeClass('content-swipe');
                            }, 200);
                            if (percentage > 30) {
                                // Previous
                                if ($('body').hasClass('page-popup-active')) {
                                    var link = $('#popup_box > .inner > .pagination_controls .previous').not('.disabled');
                                } else {
                                    var link = $('.artwork_detail .pagination_controls .previous a').not('.disabled');
                                }
                                if (link.length) {
                                    drag_element.css({'transform': 'translate3d(201%, 0, 0)'});
                                    link.trigger('click');
                                } else {
                                    prevous_drag_percentage = 0;
                                    drag_element.css({'transform': 'translate3d(0, 0, 0)'});
                                    $('.artwork_detail .draginner').attr('data-left', '0');
                                }
                            } else if (percentage < -30) {
                                // Next
                                if ($('body').hasClass('page-popup-active')) {
                                    var link = $('#popup_box > .inner > .pagination_controls .next').not('.disabled');
                                } else {
                                    var link = $('.artwork_detail .pagination_controls .next a').not('.disabled');
                                }
                                if (link.length) {
                                    drag_element.css({'transform': 'translate3d(-201%, 0, 0)'});
                                    link.trigger('click');
                                } else {
                                    prevous_drag_percentage = 0;
                                    drag_element.css({'transform': 'translate3d(0, 0, 0)'});
                                    $('.artwork_detail .draginner').attr('data-left', '0');
                                }
                            } else {
                                prevous_drag_percentage = 0;
                                drag_element.css({'transform': 'translate3d(0, 0, 0)'});
                                $('.artwork_detail .draginner').attr('data-left', '0');
                            }
                        })
                    ;
                }
            },

            resize: function() {
                $('.artwork_detail .artwork_detail_main').each(function() {
                    var min_height = $(window).width() * 0.62;
                    if (min_height < 850) {
                        var min_height = 850;
                    }
                    if (min_height > $(window).height()) {
                        var min_height = $(window).height();
                    }
                    if (min_height < 500) {
                        var min_height = 500;
                    }
                    $(this).css('min-height', min_height);
                    $('.artwork_hero_image_container').css('height', min_height);

                    $(this).find('.image_container').css('min-height', min_height);

                    var pagination_controls_height = $(this).height();
                    if (pagination_controls_height > $(window).height()) {
                        var pagination_controls_height = $(window).height();
                    } else if (pagination_controls_height < min_height) {
                        var pagination_controls_height = min_height;
                    }
                    $('#popup_box .pagination_controls > div, .artwork_detail .pagination_controls > div').css('height', pagination_controls_height - 170);

                });
            }

        },

        social_media: {
            
            init: function() {

                $('.share_links').each(function() {
                    $('.link a', this)
                        .unbind()
                        .blur(function() {
                            var element_context = $(this).closest('.share_links');
                            if (element_context.hasClass('active')) {
                                element_context.addClass('closing').removeClass('active');
                                element_context.delay(400).queue(function() {
                                    $(this).removeClass('closing');
                                    $(this).dequeue();
                                });
                            }
                        })
                        .click(function() {
                            if ($(this).closest('.share_links').hasClass('active') || $(this).closest('.share_links').hasClass('closing')) {
                                $(this).closest('.share_links').removeClass('active');
                            } else {
                                $(this).closest('.share_links').addClass('active');
                                $(this).focus();
                            }
                            return false;
                        })
                    ;
                    $('.social_links_item a', this).unbind().click(function() {
                        if ($(this).attr('href').indexOf('http') == 0) {
                            var new_window = window.open($(this).attr('href'), 'social_media_share', 'width=600,height=500');
                            return false;
                        }
                    });
                });

            }

        },

        enquiry: {

            init: function() {
                window.site.enquiry.setup();
            },

            setup: function() {

                $('.form_row_types', '#contact_enquiry_form').each(function() {
                    $(this).find('li').click(function() {
                        $('#qcw_field_contact_variant').val($(this).attr('data-type'));
                        $(this).parent().find('li').removeClass('active');
                        $(this).addClass('active');
                    });
                    $(this).find('li:eq(0)').addClass('active');
                });

                $('input[type="text"], textarea', '#contact_enquiry_form')
                    .each(function() {
                        $(this).attr('default-value', $(this).parent().find('> label').text());
                        if ($(this).val() != '' && $(this).val() != $(this).attr('default-value')) {
                            $(this).addClass('active');
                        } else {
                            $(this).val($(this).attr('default-value'));
                        }
                    })
                    .change(function() {
                        $(this).closest('.form_row').removeClass('error');
                    })
                    .focus(function() {
                        $(this).closest('.form_row').removeClass('error');
                        if ($(this).val() == $(this).attr('default-value')) {
                            $(this).addClass('active');
                            $(this).val('');
                        }
                    })
                    .blur(function() {
                        $(this).attr('default-value', $(this).parent().find('label').text());
                        if ($(this).val() == '' || $(this).val() == $(this).attr('default-value')) {
                            $(this).val($(this).attr('default-value'));
                            $(this).removeClass('active');
                        }
                    })
                ;

                $('select', '#contact_enquiry_form')
                    .each(function() {
                        $(this).attr('default-value', $(this).val());
                    })
                    .change(function() {
                        if ($(this).val() != '') {
                            $(this).addClass('active');
                        } else {
                            $(this).removeClass('active');
                        }
                    })
                ;

                $('#contact_enquiry_form .button a').unbind().click(function() {
                    window.site.enquiry.submit_form($(this).closest('.enquiry_form').find('form'));
                    return false;
                });


            },

            clear_form: function() {
                $('#ecw_field_item').val('');
                $('#ecw_field_message', '#contact_enquiry_form').each(function() {
                    $(this).val($(this).attr('default-value')).removeClass('active');
                });
                $('#ecw_field_subject', '#contact_enquiry_form').each(function() {
                    $(this).val('').removeClass('active');
                });
                $('#contact_enquiry_form .notify_panel_items').html('');
            },

            submit_form: function(instance) {

                if (instance) {
                    $('.button', instance).addClass('loading');
                    $('.error_row', instance).removeClass('active');
                    data = 'submit=1&';
                    $('input, select, textarea', instance).each(function() {
                        var field_value = $(this).val();
                        if ($(this).attr('type') == 'checkbox') {
                            if ($(this).attr('name') == 'terms') {
                                var field_value = $(this).is(':checked') ? '1' : '';
                            } else {
                                var field_value = $(this).is(':checked') ? 'Yes' : 'No';
                            }
                        }
                        if ($(this).attr('name') == 'message') {
                            data = data + $(this).attr('name') + '=' + field_value.replace(/\n/g, '<br />').replace('%', 'percent') + '&';
                        } else {
                            data = data + $(this).attr('name') + '=' + field_value.replace(/\n/g, '<br />') + '&';
                        }
                    });

                    data = data + 'originating_page=' + encodeURIComponent(window.location.pathname + window.location.search) + '&';

                    $.ajax({
                        url: "/enquiry/",
                        data: data,
                        cache: false,
                        method: 'POST',
                        dataType: 'json',
                        success: function(data) {
                            $('#contact_enquiry_form .button').removeClass('loading');
                            $('#contact_enquiry_form')
                                .delay(400)
                                .queue(function() {
                                    if (data['success'] == 1) {
                                        window.site.hubspot.log($('#contact_enquiry_form form'));
                                        window.archimedes.archimedes_core.analytics.track_campaigns.save_form_data($('#contact_enquiry_form'));

                                        $('#contact_enquiry_form').addClass('success');
                                        h.alert('<h2>Thank you</h2><div>Your enquiry has been sent.</div>');
                                        if (window.ga) {
                                            // Track in Analytics
                                            analytics_params = {
                                              'hitType': 'event',
                                              'eventCategory': 'Enquiry form submit success',
                                              'eventAction': window.location.pathname,
                                              'eventLabel': $(document).attr('title')
                                            };
                                            ga('send', analytics_params);
                                            ga('tracker2.send', analytics_params);
                                        }
                                        
                                        if (typeof gtag != 'undefined') {
                                            // Track in FB Pixel
                                            var callback = function () {
                                                if (typeof(url) != 'undefined') {
                                                    window.location = url;
                                                }
                                            };
                                            gtag('event', 'conversion', {
                                                'send_to': 'AW-774211492/64JrCMTs2ZYBEKSPlvEC',
                                                'event_callback': callback
                                            });
                                        }

                                        $('#contact_enquiry_form')
                                            .delay(2000)
                                            .queue(function() {
                                                $(this).dequeue();
                                            })
                                        ;
                                        
                                        
                                        if (typeof fbq != 'undefined') {
                                            fbq('track', 'Contact');
                                        }

                                    } else {
                                        var error_message = '';
                                        if (data['error_message'] && typeof data['error_message'] != 'undefined') {
                                            var error_message = data['error_message'];
                                        }
                                        var field_errors = [];
                                        if (data['field_errors'] && typeof data['field_errors'] != 'undefined') {
                                            var field_errors = data['field_errors'];
                                        }
                                        $.each(field_errors, function(i, v) {
                                            $('#contact_enquiry_form').find('[name="' + v + '"]').closest('.form_row').addClass('error');
                                        });
                                        if (error_message) {
                                            h.alert(error_message);
                                        }

                                        if (window.ga) {
                                            // Track in Analytics
                                            analytics_params = {
                                              'hitType': 'event',
                                              'eventCategory': 'Enquiry form submit error',
                                              'eventAction': window.location.pathname,
                                              'eventLabel': $(document).attr('title')
                                            };
                                            ga('send', analytics_params);
                                            ga('tracker2.send', analytics_params);
                                        }

                                    }
                                    $(this).dequeue();
                                })
                           ;
                        }
                    });
                }

            },

            after_submit: function() {

            }

        },

        tracking: {

            init: function() {


            }

        },
        
        forms: {
          
            init: function() {
                $('form .form_checkboxes input').change(function() {
                    if ($(this).is(':checked') && typeof $(this).attr('data-show') != 'undefined') {
                        var element_to_show = $(this).closest('form').find($(this).attr('data-show'));
                        if (element_to_show.length) {
                            $(element_to_show).addClass('active');
                        }
                    }
                });
                $('form .form_checkboxes_unique input').change(function() {
                    if ($(this).is(':checked')) {
                        $(this).closest('.form_checkboxes_unique').find('input').not(this).prop('checked', false);
                    }
                });
            }  
            
        },

        quick_enquiry: {

            // Quick mailing list signup form

            init: function() {
                window.site.quick_enquiry.setup();
            },

            setup: function() {

                $('input, textarea', '.page_enquiry_widget')
                    .each(function() {
                        $(this).attr('default-value', $(this).parent().find('> label').text());
                        if ($(this).val() != '' && $(this).val() != $(this).attr('default-value')) {
                            $(this).addClass('active');
                        } else {
                        //    $(this).val($(this).attr('default-value'));
                        }
                    })
                    .change(function() {
                        $(this).closest('.form_row').removeClass('error');
                    })
                    .focus(function() {
                        $(this).closest('.form_row').removeClass('error');
                        if ($(this).val() == $(this).attr('default-value')) {
                            $(this).addClass('active');
                        //    $(this).val('');
                        }
                    })
                    .blur(function() {
                        $(this).attr('default-value', $(this).parent().find('label').text());
                        if ($(this).val() == '' || $(this).val() == $(this).attr('default-value')) {
                        //    $(this).val($(this).attr('default-value'));
                            $(this).removeClass('active');
                        }
                    })
	                .keypress(function(event) {
	                    if (event.which == 13) {
	                        window.site.quick_enquiry.submit_form($(this).closest('.page_enquiry_widget').find('form'));
	                        return false;
	                    }
	                })
                ;

                $('.page_enquiry_widget .page_enquiry_widget_submit a').unbind().click(function() {
                    window.site.quick_enquiry.submit_form($(this).closest('.page_enquiry_widget').find('form'));
                    return false;
                });

                $('.page_enquiry_widget').each(function() {
                    if (!$(this).hasClass('initialized')) {
                        if (false) {

                            $.ajax({
                                url: "/custom/get_user_data/",
                                cache: false,
                                method: 'POST',
                                success: function(data) {
                                    if (data) {
                                        var parsed_data = JSON.parse(data);
                                        $.each(parsed_data, function(k, v) {
                                        	if (v && v != '') {
                                            	$('.page_enquiry_widget').find('input[name="' + k + '"]').val(v).addClass('active');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                    $(this).addClass('initialized');
                });

            },

            clear_form: function() {
                $('#pew_field_item').val('');
                $('#pew_field_email', '.page_enquiry_widget').each(function() {
                    $(this).val($(this).attr('default-value')).removeClass('active');
                });
            },

            email_is_valid: function(email) {
                flag = false;
                if (email.indexOf('@') > -1 && email.split('@')[1].indexOf('.') > -1 && email.indexOf(' ') == -1) {
                    flag = true;
                }
                if (!flag) {
                     return false
                }
                return flag;
            },
            
            checkboxes_valid: function(instance) {
                if ($('.form_checkboxes.form_checkboxes_one_plus_required', instance).length) {
                    var these_checkboxes = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).find('input:checked');
                    var these_checkboxes2 = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(1).find('input:checked');
                    var these_checkboxes3 = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(2).find('input:checked');
                    console.log(these_checkboxes3);
                    if (these_checkboxes.length > 0) {
                        if ($('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(1).length == 0 && $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(2).length == 0) {
                            console.log('return tru');
                            return true;
                        }
                    } else {
                        return false;
                    }
                    if (these_checkboxes2.length > 0 && these_checkboxes3.length > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            },

            submit_form: function(instance) {
            
                if (instance) {
                    $('.error_row', instance).removeClass('active');
                    data = 'submit=1&';
                    email_string = instance.find('input[name="email"]').val();
                    verify_email = window.site.quick_enquiry.email_is_valid(email_string);
                    checkboxes_valid = window.site.quick_enquiry.checkboxes_valid(instance);
                    
                    if (!verify_email) {
                        $('.page_enquiry_widget .page_enquiry_widget_submit').removeClass('loading');
                        h.alert('Please enter a valid email address.');
                        return false;
                    } else if (!checkboxes_valid) {
                        $('.page_enquiry_widget .page_enquiry_widget_submit').removeClass('loading');
                        h.alert('Please select at least one interest option.');
                        return false;
                    }
                    
                    if ($('.page_enquiry_widget_field', instance).hasClass('step_1')) {
                        
                        // Step 1 - proceed to next step
                        $('.page_enquiry_widget_field', instance).removeClass('step_1');
                        $('.page_enquiry_widget_field', instance).addClass('step_2');
                        setTimeout(function() {
                            $('.page_enquiry_field_wrapper_step_2 input', instance).focus();
                        }, 800);
                        
                    } else {
                        
                        // Step 2 - submit form 
                        
                        name_string = instance.find('input[name="name"]').val();
                        if (name_string == '') {
                            $('.page_enquiry_widget .page_enquiry_widget_submit').removeClass('loading');
                            h.alert('Please enter your name.');
                            return false;
                        }
                        
                        $('.page_enquiry_widget_submit', instance).addClass('loading');
                        
                        data = {}
                        $('input, select, textarea', instance).each(function() {
                            var field_value = $(this).val();
                            if (field_value != $(this).attr('default-value')) {
                                if ($(this).attr('type') == 'checkbox') {
                                    if ($(this).attr('name') == 'mailchimp_list_id') {
                                        if ($(this).is(':checked')) {
                                            if (data[$(this).attr('name')] && typeof data[$(this).attr('name')] != 'undefined') {
                                                // If the checkbox data already exists, add to it
                                                data[$(this).attr('name')] = data[$(this).attr('name')] + ',' + $(this).val();
                                            } else {
                                                data[$(this).attr('name')] = $(this).val();
                                            }
                                        }
                                    } else if ($(this).attr('name') == 'terms') {
                                        data[$(this).attr('name')] = $(this).is(':checked') ? '1' : '';
                                    } else {
                                        data[$(this).attr('name')] = $(this).is(':checked') ? 'Yes' : 'No';
                                    }
                                } else {
                                    data[$(this).attr('name')] = $(this).val();
                                }
                            }
                        })
                        .promise()
                        .done(function() {
                            var data_string = '';
                            
                            var data_string = Object.keys(data).map(function(key) {
                                return key + '=' + data[key]
                            }).join('&');
                            
                            var data_string = data_string + '&type=send&originating_page=' + encodeURIComponent(window.location.pathname + window.location.search) + '&contact_type=quick';
                            
                            $.ajax({
                                url: "/mailing-list/signup/", // /enquiry/
                                data: data_string,
                                cache: false,
                                method: 'POST',
                                dataType: 'json',
                                success: function(data) {
                                    $('.page_enquiry_widget')
                                        .delay(400)
                                        .queue(function() {
                                    		$('.page_enquiry_widget .page_enquiry_widget_submit').removeClass('loading');
                                            if (data['success'] == 1) {
                                                window.site.hubspot.log($(instance));
                                                window.archimedes.archimedes_core.analytics.track_campaigns.save_form_data($('.page_enquiry_widget'));
        
                                                $('.page_enquiry_widget').addClass('success');
                                                h.alert('<h2>Thank U. Welcome to our family.</h2><div>You have now been added to our mailing list. </div>');
                                                if (window.ga) {
                                                    // Track in Analytics
                                                    analytics_params = {
                                                      'hitType': 'event',
                                                      'eventCategory': 'Enquiry form submit success',
                                                      'eventAction': window.location.pathname,
                                                      'eventLabel': $(document).attr('title')
                                                    };
                                                    ga('send', analytics_params);
                                                    ga('tracker2.send', analytics_params);
                                                }
                                                
                                                if (typeof fbq != 'undefined') {
                                                    fbq('track', 'CompleteRegistration', {'content_name': 'Mailing signup'});
                                                }
                                                
                                            } else {
                                                var error_message = '';
                                                if (data['error_message'] && typeof data['error_message'] != 'undefined') {
                                                    var error_message = data['error_message'];
                                                }
                                                var field_errors = [];
                                                if (data['field_errors'] && typeof data['field_errors'] != 'undefined') {
                                                    var field_errors = data['field_errors'];
                                                }
                                                $.each(field_errors, function(i, v) {
                                                    $('.page_enquiry_widget').find('[name="' + v + '"]').closest('.form_row').addClass('error');
                                                });
                                                if (error_message) {
                                                    h.alert(error_message);
                                                } else {
                                                    h.alert('Sorry, please check your details and try again.');
                                                }
        
                                                if (window.ga) {
                                                    // Track in Analytics
                                                    analytics_params = {
                                                      'hitType': 'event',
                                                      'eventCategory': 'Enquiry form submit error',
                                                      'eventAction': window.location.pathname,
                                                      'eventLabel': $(document).attr('title')
                                                    };
                                                    ga('send', analytics_params);
                                                    ga('tracker2.send', analytics_params);
                                                }
        
                                            }
                                            $(this).dequeue();
                                        })
                                   ;
                                }
                            });
                        });
                    }
                    
                }

            },

            after_submit: function() {

            }

        },

        mailing_list_form: {

            _send_url: '/mailing-list/signup/',
            _error_messages: '',

            init: function() {
                var self = this;
                $('.mailing_list_form')
                    .unbind()
                    .each(function() {
                        $('.field', this)
                            .unbind()
                            .each(function() {
                                $(this).val($(this).attr('data-default-value'));
                            })
                            .focus(function() {
                                if ($(this).val() == $(this).attr('data-default-value')) {
                                    $(this).addClass('active').val('');
                                }
                            })
                            .blur(function() {
                                if ($(this).val() == '') {
                                    $(this).removeClass('active').val($(this).attr('data-default-value'));
                                }
                            })
                        ;
                        $('.submit_button', this).unbind().click(function() {
                            $(this).closest('form').submit();
                            return false;
                        });
                        $('input, textarea', this).keypress(function(event) {
                            if (event.which == 13) {
                                $(this).closest('form').submit();
                                return false;
                            }
                        });
                    })
                    .submit(function(e){
                        e.preventDefault();
                        self._send_form($(this).closest('form'));
                    })
                ;
            },

            _form_data: function(instance) {

                var data = {}
                $('input, textarea', instance).each(function() {
                    if ($(this).is(':checkbox')) {
                        if ($(this).is(':checked')) {
                            if (data[$(this).attr('name')] && typeof data[$(this).attr('name')] != 'undefined') {
                                // If the checkbox data already exists, add to it
                                data[$(this).attr('name')] = data[$(this).attr('name')] + ',' + $(this).val();
                            } else {
                                data[$(this).attr('name')] = $(this).val();
                            }
                        }
                    } else {
                        if ($(this).val() != $(this).attr('data-default-value')) {
                            data[$(this).attr('name')] = $(this).val();
                        } else {
                            data[$(this).attr('name')] = '';
                        }
                    }
                });
                return data;
            },

            _clear_form_data: function(instance) {
                $('input, textarea', instance).each(function() {
                    if ($(this).is(':checkbox')) {
                        $(this).prop('checked', false);
                    } else {
                        $(this).val($(this).attr('data-default-value'));
                    }
                });
                $('.error', instance).text('').hide();
            },

            _mandatory_fields: function() {

            },

            _email_is_valid: function(instance) {
                var self = this,
                    flag = false,
                    email = self._form_data(instance)['email'];

                if (!self._form_data(instance)['email']) {
                    flag = false;
                } else if (email.indexOf('@') > -1 && email.split('@')[1].indexOf('.') > -1 && email.indexOf(' ') == -1) {
                    flag = true;
                }

                /* Set error message */
                if (!flag) {
                     self._set_error('Please enter a valid email address.');
                     return false
                }
                return flag;


            },

            _emails_match: function(instance) {

                // We are NOT matching the emails on this form
                return true;

                var self = window.site.mailing_list_form,
                    flag = false;

                self._form_data(instance)['email2'] == self._form_data(instance)['email'] ? flag = true : flag = false;

                /* Set error message */
                if (!flag) {
                    self._set_error('Your email addresses do not match.');
                }
                return flag;
            },

            _email_not_exists: function(instance) {

                var self = window.site.mailing_list_form,
                    flag = false;

                $.ajax({
                    url: '/mailing-list/artlogicmailings/email_exists/',
                    type: "POST",
                    dataType: 'json',
                    data: {'email': self._form_data(instance)['email']},
                    success: function(data){
                        flag = data['exists'] ? flag = false : flag = true;
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        console.log(errorThrown);
                    },
                    async: false
                });

                /* Set error message */
                if (!flag) {
                    self._set_error('Your email address already exists on our mailing list.');
                }
                return flag;
            },

            _set_error: function(error) {
                this._error_messages = error;
            },

            _display_error: function(instance) {
                var self = this;
                error_messages_str = '' + self._error_messages + ''
                error_element = $('.error', instance);
                if (!error_element.length) {
                    // Fall back to error container outside the mailing list form
                    error_element = $('.error');
                }
                h.alert('<h2>Sorry</h2>' + error_messages_str);
                //$(error_element).text(error_messages_str);
                //$(error_element).fadeOut(1);
                //$(error_element).fadeIn(200);
            },
            
            _checkboxes_set: function(instance) {
                var self = window.site.mailing_list_form;
                if ($('.form_checkboxes.form_checkboxes_one_plus_required', instance).length) {
                    var these_checkboxes = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).find('input:checked');
                    var these_checkboxes2 = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(1).find('input:checked');
                    var these_checkboxes3 = $('.form_checkboxes.form_checkboxes_one_plus_required', instance).eq(1).find('input:checked');
                    if (these_checkboxes.length > 0 && these_checkboxes2.length > 0 && these_checkboxes3.length > 0) {
                        return true;
                    } else {
                        self._set_error('Please select at least one interest option.');
                        return false;
                    }
                } else {
                    return true;
                }
            },

            _send_form: function(instance) {

                var self = this;
                
                var name_check = ($('input[name="name"]', instance).length ? $('input[name="name"]', instance).val() != '' && $('input[name="name"]', instance).val() != $('input[name="name"]', instance).attr('data-default-value') : true);
                var email_check = ($('input[name="email"]', instance).length ? $('input[name="email"]', instance).val() != '' && $('input[name="email"]', instance).val() != $('input[name="email"]', instance).attr('data-default-value') : true);
                
                if (name_check && email_check && self._email_is_valid(instance) && self._email_not_exists(instance) && self._emails_match(instance) && self._checkboxes_set(instance)) {
                    $.ajax({
                        url: self._send_url,
                        type: "POST",
                        dataType: 'json',
                        data: self._form_data(instance),
                        success: function(data) {
                            if (data.success) {
                                window.site.hubspot.log($(instance));
                                h.alert('<h2>Thank U. Welcome to our family.</h2><div>You have now been added to our mailing list. </div>');
                                self._clear_form_data(instance);
                                if ($('.mailing-overlay').hasClass('active')) {
                                    window.site.overlays.mailings.close();
                                }
                                if (typeof fbq != 'undefined') {
                                    fbq('track', 'CompleteRegistration', {'content_name': 'Mailing signup'});
                                }
                            } else {
                                self._set_error('There was a problem adding you to the mailing list, please check the form and try again.');
                                self._display_error(instance);
                            }
                        }
                    });
                } else {
                    if (!name_check) {
                        self._set_error('Please enter your name.');
                    } else if (!email_check) {
                        self._set_error('Please enter your email address.');
                    } else if (!self._email_is_valid(instance)) {
                        self._set_error('Please enter a valid email address.');
                    }
                    self._display_error(instance);
                }
            }
        },

        artists: {
        	
        	init: function() {
                window.site.horizontal_scroller.setup('#artists_nav_track');
        	}

        },

        exhibitions: {

            init: function() {
                // Handle the whats-on slide-in preview pages
                $('#container a[href^="/whats-on/"]').not('a[href="/whats-on/"]').each(function() {
                    if ($(this).attr('href').split('/').length == 4) {
                        //$(this).addClass('pageload-link-type-ajax-enabled-content');
                        $(this).unbind('click').bind('click', function() {
                            // Make sure the link is to an exhibition landing page only, do not handle other pages within the exhibition as slide-in menus
                            var element_href = $(this).attr('href') + '';
                            var clicked_element = $(this);
                            $.pageload.load(element_href, true, function() {
                                if (new_page_inner_content) {
                                    window.site.overlays.content.open(clicked_element, new_page_inner_content);
                                    $.pageload.refresh('#content-overlay-content');
                                    window.site.social_media.init();
                                    window.site.overlays.enquire.init();
                                }
                            }, null, clicked_element);
                            return false;
                        });
                    }
                });
            }

        },

        store: {

            init: function() {

                if ($('#wishlist_enquiry_submitted_confirmation').length) {
                    h.alert($('#wishlist_enquiry_submitted_confirmation').html());
                }

                $('#shipping_container_loader').addClass('loader');
                $('#stripe_loader').addClass('loader');
                
                $('body:not(.checkout_second_step) input, textarea', '#sc_additional_fields, #wishlistEnquiryForm')
                    .each(function() {
                        $(this).attr('default-value', $(this).parent().find('> label').text());
                        if ($(this).val() != '' && $(this).val() != $(this).attr('default-value')) {
                            $(this).addClass('active');
                        } else {
                            $(this).val($(this).attr('default-value'));
                        }
                    })
                    .focus(function() {
                        if ($(this).val() == $(this).attr('default-value')) {
                            $(this).addClass('active');
                            $(this).val('');
                        }
                    })
                    .blur(function() {
                        $(this).attr('default-value', $(this).parent().find('label').text());
                        if ($(this).val() == '' || $(this).val() == $(this).attr('default-value')) {
                            $(this).val($(this).attr('default-value'));
                            $(this).removeClass('active');
                        }
                    })
                ;
            }

        },

        misc: {

        	init: function(call_type) {

                $('#logo').hover(function() {
                    if (typeof logo_hover_timeout != 'undefined') {
                        clearTimeout(logo_hover_timeout);
                    }
                    $('#logo').addClass('hover');
                    logo_hover_timeout = setTimeout(function () {
                        $('#logo').removeClass('hover');
                    }, 400);
                }, function() {

                });

                var call_type = (call_type && typeof call_type != 'undefined' ? call_type : 'standard');

                $('.button').each(function() {
                    if (!$(this).find('.loader').length) {
                        $(this).append('<span class="loader"></span>');
                    }
                });
                
                $('.loader').each(function() {
                    if (!$(this).find('svg').length) {
                        $(this).append('<svg viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg>');
                    }
                });

        		$('a').each(function() {
                    var el = $(this);
                    var href = el.attr('href');
                    if (href && href.indexOf('http') == 0 && !el.hasClass('noPopup')
                        && !el.hasClass('nopopup')
                        && !$('body').hasClass('no_pop_ups')
                        && !$('body').hasClass('nopopups')
                        && href.indexOf(window.location.hostname) == -1) {
                            el.attr('target', '_blank').addClass('external');
                    }
                });

                if (call_type != 'popup') {
                    $('body').removeClass('content-type-reversed');
                    if ($('#container .content-reversed').length) {
                        $('body').addClass('content-type-reversed');
                    }
                }

            	window.site.misc.map();
        	},

        	map: function() {
        		if ($('#map_area').length){
                    var latlng = $('#map_area').attr('data-latlng').split(',');

                    if (latlng.length == 2) {
                        var lat = $('#map_area').attr('data-latlng').split(',')[0];
                        var lng = $('#map_area').attr('data-latlng').split(',')[1];
                        var centerlat = $('#map_area').attr('data-centerlatlng').split(',')[0];
                        var centerlng = $('#map_area').attr('data-centerlatlng').split(',')[1];
                        var map_title = $('#map_area').attr('data-title');
                        var map_link = $('#map_area').attr('data-url');
                        var new_styles = [{"featureType": "all","elementType": "all","stylers": [{"visibility": "on"}]},{"featureType": "all","elementType": "geometry","stylers": [{"visibility": "off"},{"weight": "1.34"}]},{"featureType": "all","elementType": "labels","stylers": [{"visibility": "off"}]},{"featureType": "all","elementType": "labels.text.fill","stylers": [{"saturation": 36},{"color": "#ffffff"},{"lightness": 40}]},{"featureType": "all","elementType": "labels.text.stroke","stylers": [{"visibility": "off"},{"color": "#000000"},{"lightness": 16}]},{"featureType": "all","elementType": "labels.icon","stylers": [{"visibility": "off"}]},{"featureType": "administrative","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "administrative","elementType": "geometry.fill","stylers": [{"color": "#ffffff"},{"lightness": 20}]},{"featureType": "administrative","elementType": "geometry.stroke","stylers": [{"color": "#000000"},{"lightness": 17},{"weight": 1.2}]},{"featureType": "landscape","elementType": "all","stylers": [{"visibility": "off"},{"color": "#34302d"}]},{"featureType": "landscape","elementType": "geometry","stylers": [{"color": "#222223"},{"lightness": "0"},{"visibility": "simplified"},{"gamma": "1"}]},{"featureType": "landscape.man_made","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "landscape.man_made","elementType": "geometry","stylers": [{"visibility": "off"}]},{"featureType": "landscape.man_made","elementType": "geometry.fill","stylers": [{"visibility": "off"},{"saturation": "-100"},{"lightness": "-100"},{"gamma": "0.00"},{"weight": "2.20"}]},{"featureType": "landscape.man_made","elementType": "geometry.stroke","stylers": [{"visibility": "off"}]},{"featureType": "poi","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "poi","elementType": "geometry","stylers": [{"color": "#000000"},{"lightness": 21}]},{"featureType": "poi.attraction","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "road","elementType": "all","stylers": [{"visibility": "simplified"},{"weight": "1.00"},{"color": "#ffffff"}]},{"featureType": "road","elementType": "geometry","stylers": [{"visibility": "simplified"},{"color": "#434343"}]},{"featureType": "road","elementType": "labels","stylers": [{"visibility": "simplified"}]},{"featureType": "road","elementType": "labels.text.fill","stylers": [{"visibility": "on"},{"color": "#8a8a8a"}]},{"featureType": "road","elementType": "labels.text.stroke","stylers": [{"visibility": "off"},{"color": "#333333"},{"weight": "3"}]},{"featureType": "road.highway","elementType": "labels","stylers": [{"visibility": "off"}]},{"featureType": "transit","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "transit","elementType": "geometry","stylers": [{"color": "#000000"},{"lightness": 19}]},{"featureType": "water","elementType": "geometry","stylers": [{"color": "#525358"},{"lightness": "0"},{"visibility": "on"}]}];
                        var new_styles = [ { "featureType": "all", "elementType": "labels.text.fill", "stylers": [ { "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 } ] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [ { "visibility": "off" }, { "color": "#ffffff" }, { "lightness": 16 } ] }, { "featureType": "all", "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] }, { "featureType": "administrative", "elementType": "all", "stylers": [ { "visibility": "off" } ] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "lightness": "74" }, { "visibility": "on" }, { "color": "#F4F2F1" } ] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [ { "color": "#F4F2F1" }, { "lightness": 20 } ] }, { "featureType": "landscape.man_made", "elementType": "all", "stylers": [ { "visibility": "off" } ] }, { "featureType": "poi", "elementType": "all", "stylers": [ { "visibility": "off" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#f5f5f5" }, { "lightness": 21 } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#dedede" }, { "lightness": 21 } ] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#ffffff" }, { "lightness": 17 } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }, { "visibility": "off" } ] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [ { "color": "#ffffff" }, { "lightness": 18 }, { "visibility": "on" } ] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [ { "visibility": "simplified" }, { "weight": "2.13" } ] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#ffffff" }, { "lightness": 16 } ] }, { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [ { "visibility": "on" }, { "weight": "2.33" } ] }, { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [ { "weight": "0.33" }, { "visibility": "off" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#f2f2f2" }, { "lightness": 19 } ] }, { "featureType": "transit.station.rail", "elementType": "labels", "stylers": [ { "visibility": "on" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#e9e9e9" }, { "lightness": 17 } ] }];
                        var position = new google.maps.LatLng(lat, lng);
                        if (window.site.device.breakpoint() <= 2) {
                            var center = new google.maps.LatLng(lat, lng);
                            var zoomLevel = 15;
                        } else {
                            var center = new google.maps.LatLng(centerlat, centerlng);
                            var zoomLevel = 16;
                        }
                        var markerImage = {
                            url: '/images/marker_2x_reverse.png',
                            size: new google.maps.Size(29, 45),
                            scaledSize: new google.maps.Size(29, 45),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(15, 45)
                        };
                        var myOptions = {
                          zoom: zoomLevel,
                          center: center,
                          mapTypeId: google.maps.MapTypeId.ROADMAP,
                          panControl: false,
                          //panControl: true,
                          //panControlOptions: {
                          //    position: google.maps.ControlPosition.TOP_RIGHT
                          //},
                          zoomControl: false,
                          zoomControlOptions: {
                            style: google.maps.ZoomControlStyle.SMALL,
                            position: google.maps.ControlPosition.LEFT_TOP
                          },
                          scaleControl: false,
                          streetViewControl: false,
                          overviewMapControl: false,
                          scrollwheel: false,
                          draggable: true,
                          styles: new_styles,
                          mapTypeControl: false,
                          fullscreenControl: false,
    					  backgroundColor: '#eee'
                        }

                        //insert the map into the id on page using map options etc
                        var map = new google.maps.Map(document.getElementById("map_area"), myOptions);

                        //each marker config
                        var marker = new google.maps.Marker({
                            position: position,
                            map: map,
                            url: map_link,
                            title: map_title,
                            icon: markerImage
                        });

                        if (map_link != '') {
                            google.maps.event.addListener(marker, 'click', function() {
                                window.open(
                                  marker.url,
                                  '_blank'
                                );
                            });
                        }
                        google.maps.event.trigger(map, 'resize');
                    }




                    $( window ).load(function() {
                        setTimeout(function() {
                                $("img[src$='google_white2.png']").css({ opacity: 0.4 });
                                $(".gm-style-cc").css({ opacity: 0.4 });
                                //$("img[src$='google_white2.png']").css({ background: 'none'});
                                $(".gm-style-cc div, .gm-style-cc a").css({background: 'none', color: '#333'});
                        }, 400);
                    });
                }
        	}

        },


        device: {

            init: function() {

                // Find out the current browser
                if ($.browser.name) {
                    var browserVersion = parseInt($.browser.version);
                    var browserName = $.browser.name;
                    if (browserVersion) {
                        $('body').addClass('browser-' + browserName);
                        $('body').addClass('browser-' + browserName + '-' + browserVersion);
                    }
                    if ($.browser.platform) {
                        $('body').addClass('platform-' + $.browser.platform);
                    }
                }

                // Find out if this is the Android default browser and add a class to the body
                // This is NOT a very good way of testing for this browser, but there does not seem to be a conclusive way to do it
                var nua = navigator.userAgent;
                var is_android_default_browser = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
                if (is_android_default_browser) {
                    $('body').addClass('browser-android-internet');
                }

                // Find outo if this is a high res device and add a class to the body
                // This allows us to change graphics to high-res versions on compatible devices
                if (window.devicePixelRatio > 1) {
                    $('body').addClass('device-highres');
                }

                if (window.site.device.handheld()) {
                    $('body').addClass('device-handheld');
                } else {
                    $('body').addClass('device-desktop');
                }

            },

            breakpoint: function() {
                if ($(window).width() <= 459) {
                    return 1;
                } else if ($(window).width() <= 767) {
                    return 2;
                } else if ($(window).width() <= 900) {
                    return 2.5;
                } else if ($(window).width() <= 1023) {
                    return 3;
                } else {
                    return 4;
                }
            },

            canvas_enabled: function() {
                // Check if canvas should be enabled
                if (window.location.search.indexOf("canvasdisabled=1") != -1 || !window.site.home.canvas_effect_enabled) {
                    return false;
                }
                return window.site.device.video_mode() && window.site.device.video_inline() && window.site.device.breakpoint() > 2;
            },

            video_fallback: function() {
                // Does this device run in video fallback mode, e.g. usually non desktop devices
                return window.site.device.handheld() || !window.site.device.video_inline();
            },

            video_mode: function() {
                // Do we want to show video on this device
                return !window.site.device.handheld() && window.site.device.video_inline();
            },

            video_inline: function() {
                // Check if video content can be displayed inline (e.g. as a background physically on the page)
                if (window.location.search.indexOf("disablevideoinline=1") != -1) {
                	return false;
                }
                return navigator.userAgent.match(/(iPhone|iPod)/g) ? ('playsInline' in document.createElement('video')) : true;
            },

            handheld: function() {

                /* Detect mobile device */
                return (
                    //Uncomment to force for testing
                    //true ||

                    //Dev mode
                    (window.location.search.indexOf("handheld=1") != -1) ||
                    //Detect iPhone
                    (navigator.platform.indexOf("iPhone") != -1) ||
                    //Detect iPod
                    (navigator.platform.indexOf("iPod") != -1) ||
                    //Detect iPad
                    (navigator.platform.indexOf("iPad") != -1) ||
                    //Detect Android
                    (navigator.userAgent.toLowerCase().indexOf("android") != -1) ||
                    //Detect Surface (ARM chip version e.g. low powered tablets) will also detect other windows tablets with the same chip
                    (navigator.userAgent.toLowerCase().indexOf("arm;") != -1 && navigator.userAgent.toLowerCase().indexOf("windows nt") != -1) ||
                    //Detect Opera Mini
                    (navigator.userAgent.toLowerCase().indexOf("opera mini") != -1) ||
                    //Detect Blackberry
                    (navigator.userAgent.toLowerCase().indexOf("blackberry") != -1) ||
                    //Detect webos
                    (navigator.userAgent.toLowerCase().indexOf("webos") != -1) ||
                    //Detect iemobile (old version of windows phone)
                    (navigator.userAgent.toLowerCase().indexOf("iemobile") != -1)
                );

            },

            handheld_not_ios: function() {

                /* Detect mobile device */
                ios_devices = (
                    (navigator.platform.indexOf("iPhone") != -1) ||
                    //Detect iPod
                    (navigator.platform.indexOf("iPod") != -1) ||
                    //Detect iPad
                    (navigator.platform.indexOf("iPad") != -1)
                );

                if (window.site.device.handheld() && !ios_devices) {
                	return true;
                } else {
                	return false;
                }

            }

        },

        throttle: function(delay, callback) {
            var previousCall = new Date().getTime();
            return function() {
                var time = new Date().getTime();
                if ((time - previousCall) >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        },

        debounce: function(wait, func, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },
        
        objectfit_polyfill: {
            /*
                Simple polyfill for image grids that use object-fit css for 'soft' cropping.
                Mostly required for all versions of Internet Explorer and older versions of Edge.
            */
            init: function() {
                
                var polyfill_images = '.hero_inner .media_wrapper .image img, .artwork-nav-hero img';
                
                if ($(polyfill_images).length){
                    
                    var supportsObjectfit;
                    
                    // Detect whether '@supports' CSS is supported, preventing errors in IE
                    var supports_supportsCSS = !!((window.CSS && window.CSS.supports) || window.supportsCSS || false);

                    if (supports_supportsCSS){
                        // Older Edge supports '@supports' but not object-fit
                        supportsObjectfit = CSS.supports('object-fit','cover');
                    } else {
                        //IE doesn't support '@supports' or 'object-fit', so we can consider them the same
                        supportsObjectfit = false;
                    }

                    if (!supportsObjectfit || typeof supportsObjectfit == 'undefined') {
    
                        $(polyfill_images).each(function() {
                            var $img = $(this);
                            var imageURL = false;
                            if ($img.attr('src') && typeof $img.attr('src') != 'undefined') {
                                var imageURL = $img.attr('src');
                            } else if ($img.attr('data-src') && typeof $img.attr('data-src') != 'undefined') {
                                var imageURL = $img.attr('data-src');
                            }
                            if (imageURL) {
                                var bg_positioning = '50% 50%';
                                if ($img.css('object-position')) {
                                    var positioning = $img.css('object-position');
                                }
                                $img.parent().addClass('objectfit-fallback-bg').css({'background-image':'url('+imageURL+')','background-position':bg_positioning});
                                $img.css('visibility','hidden');
                                
                                if (!$('body').hasClass('objectfit-polyfill-active')){
                                    $('body').addClass('objectfit-polyfill-active')
                                }
                            }
                        });
                    }
                }
            },
        },

        
        horizontal_scroller: {

            enabled: function() {
                var scroller_disabled = window.site.device.handheld() || $(window).width() < 900 || (typeof $.browser.msie != 'undefined' && $.browser.version < 10);
                return !scroller_disabled;
            },

            detect: function() {
                if (window.site.horizontal_scroller.enabled()) {
                    // Scroller enabled
                    $('body').addClass('track-scroller-enabled');
                    $('body').removeClass('track-scroller-disabled');
                } else {
                    $('body').removeClass('track-scroller-enabled blockscroll');
                    $('body').addClass('track-scroller-disabled');
                }
            },

            init: function() {
                window.site.horizontal_scroller.detect()
                $(window).resize(window.site.debounce(200, function() {
                    window.site.horizontal_scroller.detect()
                }));

                if ($('#homepage_overall_container.page-track-wrapper').length ) {
                    window.site.horizontal_scroller.setup('#homepage_overall_container.page-track-wrapper');
                }

                $('.records_slider_panel').each(function() {
                    window.site.horizontal_scroller.setup('#' + $(this).attr('id'));
                });


                $(window).scroll(function(e) {

                    if (!window.site.device.handheld()) {

                        $('#hero').each(function() {
                            var alias = $('.scroll_section_top');
                            var scrolltop = $(window).scrollTop();
                            var scrolltop_from_viewport_bottom = $(window).scrollTop() + $(window).height();
                            var element_offset_top = $(alias).offset().top;
                            var element_offset_bottom = $(alias).offset().top + $(alias).height();
                            if (element_offset_bottom > scrolltop) {
                                var opacity = (scrolltop / $(window).height()) / 1.2;
                                var scale = 1 + ((scrolltop / $(window).height()) / 1.6);
                                $(this).find('.mask').css('opacity', opacity);

                                if (false) {
                                    if ($(this).find('.media_has_video').length) {
                                        $(this).find('.image video').css('transform', 'scale(' + scale + ')');
                                    } else {
                                        $(this).find('.image_media img').css('transform', 'scale(' + scale + ')');
                                    }
                                }
                            }
                        });
                    }

                    if ($('body').hasClass('track-scroller-enabled')) {
                        if ($('body').hasClass('blockscroll')) {
                            $(window).scrollTop($(window).scrollTop());
                            e.preventDefault();
                            return
                        }
                        $('.records_slider_panel').not('.track-scroller-disabled').each(function() {
                            var scrolltop = $(window).scrollTop();
                            var scrolltop_from_viewport_bottom = $(window).scrollTop() + $(window).height();
                            var element_offset_top = $(this).offset().top;
                            var element_offset_bottom = $(this).offset().top + $(this).height();

                            // Records slider panel functions
                            if ($(this).hasClass('records_slider_panel')) {
                                if ($('#container_outer').hasClass('scrolling-down') && scrolltop > element_offset_top && scrolltop < element_offset_top + $(this).height() && $(this).hasClass('start')) {
                                    $(window).scrollTop($(this).offset().top);
                                    $('body').addClass('blockscroll');
                                    $(this).addClass('active');
                                } else if ($('#container_outer').hasClass('scrolling-up') && (scrolltop < element_offset_top) && $(this).hasClass('end')) {
                                    $(window).scrollTop($(this).offset().top);
                                    $('body').addClass('blockscroll');
                                    $(this).addClass('active');
                                } else {
                                    $(this).removeClass('active');
                                }
                            }
                        });

                        $('.list-preview-scroll-container').each(function() {
                            var scrolltop = $(window).scrollTop();
                            var scrolltop_from_viewport_bottom = $(window).scrollTop() + $(window).height();
                            var element_offset_top = $(this).offset().top;
                            var element_offset_bottom = $(this).offset().top + $(this).height();

                            // List preview panel functions
                            if ($(this).hasClass('list-preview-scroll-container')) {
                                if (scrolltop >= element_offset_top && scrolltop_from_viewport_bottom <= element_offset_bottom) {
                                    $(this).removeClass('below_viewport above_viewport');
                                    $(this).addClass('within_viewport');
                                } else {
                                    $(this).removeClass('within_viewport');
                                    if (scrolltop_from_viewport_bottom > element_offset_bottom) {
                                        $(this).removeClass('below_viewport');
                                        $(this).addClass('above_viewport');
                                    } else {
                                        $(this).removeClass('above_viewport');
                                        $(this).addClass('below_viewport');
                                    }
                                }
                            }
                        });
                    }
                });

            },

            setup: function(instance) {

                ///----------------------------------------------------
                /// SETUP
                ///----------------------------------------------------

                    if (!instance || typeof instance == 'undefined') {
                        return;
                    }
                    
                    if (!$('.page-track-scroll-container', instance).length) {
                        return;
                    }

                    // setup play video on hover function
                    window.site.horizontal_scroller.play_video_on_hover();

                    //force text to the to the opposite end
                    native_scroll = false;

                    $(instance).addClass('start');

                    $(instance).find('.page-track-right').bind('scroll', window.site.debounce(400, function(e) {
                        if ($(instance).find('.page-track').scrollLeft() > 0) {
                            $(instance).removeClass('start');
                            $(instance).addClass('scrolled');
                        } else {
                            $(instance).addClass('start');
                            $(instance).removeClass('scrolled');
                            $(instance).removeClass('click-scrolled');
                        }
                    }));

                    // Get all the dimensions
                    //var max_text_scroll = $('.page-track-left table').outerWidth() - $(window).width();
                    var max_image_scroll = 0 - $('.page-track-right table', instance).outerWidth() + $(window).width();
                    
                    var max_slides = $('.page-track-frame-images .page-track-item', instance).length;

                    $('.page-track-frame-text .page-track-item', instance).each(function(){
                        var $this = $(this);
                        var title_index = $this.attr('data-title-index');
                        var $imagewrapper = $('.page-track-frame-images .page-track-item[data-slide-index="'+title_index+'"] .image-wrapper', instance);
                        $imagewrapper.imagesLoaded( function() {
                            var image_width = $imagewrapper.width() + 'px';
                            $imagewrapper.addClass('visible');
                            $this.find('.title-wrapper').css('max-width',image_width).addClass('visible');
                        });
                    });
                    
                    $('[data-title-index]').each(function(){
                        var $this = $(this);
                        var slide_index = $this.attr('data-title-index') - 1;
                        var progress_point = slide_index / (max_slides - 1);
                        $this.attr('data-progress-scale', progress_point);
                    });
                    

                    // Resize handler
                    var resizeTimer;
                    $(window).on('resize', function(e) {
                        clearTimeout(resizeTimer);
                        resizeTimer = setTimeout(function() {
                            //window.site.horizontal_scroller.setup_offsets();
                            max_text_scroll = $('.page-track-left table', instance).outerWidth() - $(window).width();
                            max_image_scroll = 0 - $('.page-track-right table', instance).outerWidth() + $(window).width();
                            $(instance).trigger('wheel');
                        }, 250, instance);
                    });
        

                    ///----------------------------------------------------
                    /// CREATE SECTIONS
                    ///----------------------------------------------------
                    //window.site.horizontal_scroller.setup_offsets(); //the resize is above!
                    // $('.page-track-frame-images .page-track-item').first().addClass('active');
                    // $('.page-track-frame-text .page-track-item').last().addClass('active');
                    var last_active_index = 1;
                    
                    
                    ///----------------------------------------------------
                    /// GO BACK TO PREVIOUS ACTIVE ITEM
                    ///----------------------------------------------------
                    var slide_index_local_storage = window.localStorage.getItem('current_page-track_index_' + instance.replace('#', ''));
                    window.site.horizontal_scroller.setup_goto_slide(slide_index_local_storage, false,instance);



                ///----------------------------------------------------
                /// ONSCROLL
                ///----------------------------------------------------
                var right_elem = document.querySelector('.page-track-right');


                // Mousewheel handlers
                timer = false;
                flag = false;

                // NOTE - changed from 'instance' to 'window' to make the inner page scrollers smoother
                $(window).on('wheel', function(event) {
                    if ($('body').hasClass('track-scroller-enabled') && !$('body').hasClass('sc_wishlist_quick_cart_widget_active') && !$('body').hasClass('sc_quick_cart_widget_active')) {
                        var instance = $('.page-track-wrapper');
                        if (!instance.hasClass('track-scroller-disabled')) {
                            var instance = '#' + $(instance).attr('id');

                            var instance_offset_top = $(instance).offset().top - ($('body').hasClass('cms-frontend-toolbar-active') ? 28 : 0);
                            var instance_offset_scroll_top = $(instance).offset().top - $(window).scrollTop() - ($('body').hasClass('cms-frontend-toolbar-active') ? 28 : 0);

                            if (instance_offset_scroll_top == 0 || ($(instance).hasClass('records_slider_panel') && $(instance).hasClass('active'))) { //if (instance_offset_scroll_top == 0) {

                                var delta = (!event.deltaY || typeof event.deltaY == 'undefined' ? 0 : event.deltaY) || (!event.deltaX || typeof event.deltaX == 'undefined' ? 0 : event.deltaX);
                                var direction = (delta < -0.01 ? 'left' : (delta > 0.01 ? 'right': ''));
                                window.site.horizontal_scroller.setup_pan(instance, delta,true,right_elem,max_image_scroll);
                                if (direction == 'left' && $(instance).hasClass('start')) {
                                    // If we are at the start of the slider, allow scrolling up
                                    if (instance_offset_top == 0) {
                                        event.preventDefault();
                                    }
                                    $('body').removeClass('blockscroll');
                                } else if ((direction == 'right' && $(instance).hasClass('end'))) {
                                    // If we are at the start of the slider, allow scrolling down
                                    $('body').removeClass('blockscroll');
                                } else {
                                    // Slider is active, do not allow vertical scrolling
                                    event.preventDefault();
                                }
                            }
                        }
                    }
                });


                // Touch handlers
                if (false) {
                    // Not yet ready - needs to be context sensitive
                    var mc = new Hammer(document.querySelector('.page-track-right'));
                    // NOTE: need to make this sensitive to the context
                    // NOTE: need to make this sensitive to the context
                    mc.get('swipe').set({
                        direction: Hammer.DIRECTION_HORIZONTAL,
                        threshold: 100,
                        velocity: 1,
                    });
                    mc.on("swiperight", function(ev) {
                        //console.log("swiperight");
                        setTimeout(function () {
                            // NOTE: need to make this sensitive to the context
                            $('.page-track-scroll.page-track-scroll-prev').trigger('click');
                        }, 100);
                        
                    });
                    mc.on("swipeleft", function(ev) {
                        //console.log("swipeleft");
                        setTimeout(function () {
                            // NOTE: need to make this sensitive to the context
                            $('.page-track-scroll.page-track-scroll-next').trigger('click');
                        }, 100);
                    });
                    mc.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
                    mc.on("panstart", function(ev) {
                        // NOTE: need to make this sensitive to the context
                        pan_amount_left = right_elem.getBoundingClientRect().left;
                        $('body').addClass('dragging');
                    });
                    mc.on("panend", function(ev) {
                        // NOTE: need to make this sensitive to the context
                        pan_amount_left = right_elem.getBoundingClientRect().left;
                        $('body').removeClass('dragging');
                    });
                    mc.on("panleft panright", function(ev) {
                        var delta = ev.deltaX
                        var image_transform = pan_amount_left + delta;

                        // Prevent scroll past the end --------------------------------------- /
                        if (image_transform > 0 ){
                            image_transform = 0;
                        } else if (image_transform < max_image_scroll) {
                            image_transform = max_image_scroll;
                        }
                        window.site.horizontal_scroller.setup_scroll_indicator(instance, image_transform,max_image_scroll);
                        var text_transform = max_image_scroll - image_transform;

                         right_elem.style.transform = "translate3d("+image_transform+"px,0,0)";
                         //left_elem.style.transform = "translate3d("+text_transform+"px,0,0)";
                    });
                }
                            

                var max_slides = $('.page-track-frame-images .page-track-item', instance).length;
                
                window.site.horizontal_scroller.setup_deactivate_skip(1, instance);

                /// User forces to next slide -------------------------------- /
                $('.page-track-scroll', instance).click(function() {

                    var instance = $(this).closest('.page-track-wrapper');
                    $this = $(this);

                    $(instance).addClass('click-scrolled');

                    // Slides to scroll
                    var slides_to_scroll = Math.floor($(window).width() / $(instance).find('td').width());
                    
                    /// Get current position -------------------------------- /
                    var current_index = $('.page-track-frame-images .page-track-item.active', instance).attr('data-slide-index');
                    var current_index = (current_index && typeof current_index != 'undefined' ? current_index : 1);
                    
                    // Skip left or right -------------------------------- /
                    if ($this.hasClass('page-track-scroll-next')){
                        var skip_index = parseInt(current_index) + slides_to_scroll;
                    } else {
                        var skip_index = parseInt(current_index) - slides_to_scroll;
                    }
                    
                    // Check if we've hit the extremities -------------------------------- /
                    if (skip_index == 0){
                        skip_index = 1;
                    } else if (skip_index > max_slides ) {
                        skip_index = max_slides;
                    }

                    // Set the correct slide in the local storage -------------------------------- /
                    //localStorage.setItem('current_page-track_index' + instance.replace('#', ''), skip_index);
                    
                    // Run the goto slide function with animate as true -------------------------------- /
                    window.site.horizontal_scroller.setup_goto_slide(skip_index, true, instance);
                    window.site.horizontal_scroller.setup_deactivate_skip(skip_index, instance);
                });
            },

            setup_pan: function(instance, delta, invert, right_elem, max_image_scroll) {
                
                requestAnimationFrame(function(ev) {
            
                    if (!flag) {
                        flag = true;
                        $('body').addClass('scrolling');
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        $('body').removeClass('scrolling');
                        flag = false;
                    }, 100);
                
                
                    // Remove the animating class for the click function --------------------------------------- /
                    if ($('.page-track-list', instance).hasClass('animating')) {
                        $('.page-track-list', instance).removeClass('animating');
                    }

                    // newer 'wheel' event is inverted
                    var mouse_scroll = 1 - delta;
                    
                    // THIS MULTIPLICATION ONLY NEEDED FOR 'MOUSEWHEEL' EVENT (depricated)
                    //'wheel' is more modern, and doesn't require this
                    // var mouse_scroll = delta * 30;

                    var left = right_elem.getBoundingClientRect().left;
                    var image_transform = left + mouse_scroll;
                    
                    // Slideshow fade out effect --------------------------------------- /
                    $('.slideshow-placeholder', instance).each(function() {
                        var right_offset = $(this).offset().left + $(this).width();
                        if (left < -40) {
                            // Slider has moved beyond the usable limit of the associated slideshow, remove certain features of the slideshow at this point
                            if (!$(instance).hasClass('page-track-beyond-placeholder-threshold')) {
                                $(instance).addClass('page-track-beyond-placeholder-threshold');

                                // Pause the video to retain performance
                                if (window.window.canvasSlideshowInitialized) {
                                    window.canvasPauseVideo(parseInt($('#main_slideshow .slide.cycle-slide-active').attr('data-index'))-1);
                                }
                                if (!$('#main_slideshow').hasClass('cycle-paused') && !$('#main_slideshow').hasClass('slideshow-paused-by-default')) {
                                    // Pause the slideshow as this no longer needs to run
                                    $('#main_slideshow_progress .pause').trigger('click');
                                }
                            }
                        } else {
                            if ($(instance).hasClass('page-track-beyond-placeholder-threshold')) {
                                $(instance).removeClass('page-track-beyond-placeholder-threshold');

                                // Resume the video
                                if (window.window.canvasSlideshowInitialized) {
                                    window.canvasPlayVideo(parseInt($('#main_slideshow .slide.cycle-slide-active').attr('data-index'))-1);
                                }

                                if ($('#main_slideshow').hasClass('cycle-paused') && !$('#main_slideshow').hasClass('slideshow-paused-by-default')) {
                                    // Resume the slideshow
                                    $('#main_slideshow_progress .pause').trigger('click');
                                }
                            }
                        }

                        // Run parallax effects 
                        if (right_offset > 0) {
                            if ($('#canvas_wrapper_background').is(':hidden')) {
                                $('#canvas_wrapper_background').css('display', 'block');
                            }
                            var parallax_left = $(this).parent().offset().left / 6;
                            $('#main_slideshow_wrapper', instance).css('transform', 'translate3d(' + parallax_left + 'px, 0, 0)');
                            var opacity = (1 - (Math.abs($(this).parent().offset().left) / 12) / 100).toFixed(2);
                            $('#main_slideshow_wrapper', instance).css('opacity', opacity);

                            var canvas_scale = 1 - (Math.abs($(this).parent().offset().left) / 12) / 100;
                            var opacity = (1 - (Math.abs($(this).parent().offset().left) / 6) / 100).toFixed(2);
                            $('#canvas_wrapper_background').css('transform', 'scale(' + canvas_scale + ')');
                            $('#canvas_wrapper_background').css('opacity', opacity);
                            
                            $('#main_slideshow .slide .image .image_inner', instance).css({'transform': 'scale(' + canvas_scale + ')', 'opacity': opacity});
                        } else {
                            $('#canvas_wrapper_background').css('display', 'none');
                        }
                    })
                    

                    // Prevent scroll past the end --------------------------------------- /
                    if (image_transform > 0){
                        image_transform = 0;
                        $(instance).addClass('start');
                    } else if (image_transform < max_image_scroll) {
                        image_transform = max_image_scroll;
                        $(instance).addClass('end');
                    } else {
                        $(instance).removeClass('start end');
                    }
            
                    window.site.horizontal_scroller.setup_scroll_indicator(instance, image_transform,max_image_scroll);
                    
                    right_elem.style.transform = "translate3d("+image_transform+"px,0,0)";


                });
                
            },

            setup_goto_slide: function(skip_index, animate, instance) {
                /// On click we want animation, on page load we dont -------------------------------- /
                
                var animated_scroll_active = !$(instance).hasClass('track-scroller-disabled');

                if (animate) {
                    $('#page-track-list').addClass('animating');
                } else {
                    $('#page-track-list').removeClass('animating');
                }

                if (skip_index > 1) {
                    $(instance).removeClass('start');
                } else {
                    $(instance).addClass('start');
                }
            
                /// Get the element based on supplied index  -------------------------------- /
                var $skip_index_element = $('.page-track-frame-images .page-track-item[data-slide-index="'+skip_index+'"]');

                /// Skip to designated item  -------------------------------- /
                if ($skip_index_element.length){
                    
                    var elem_images = $('.page-track-right', instance);
                    
                    if (animated_scroll_active) {
                        var to_left = elem_images.getBoundingClientRect().left - $skip_index_element.offset().left;

                        if (!native_scroll){
                            elem_images.style.transform = "translate3d("+(to_left)+"px,0,0)";
                        }
                    } else {
                        var left_scroll_align = parseInt($(instance).find('td:eq(0) .page-track-item').css('padding-left'));
                        var to_left = ($skip_index_element.offset().left + elem_images.scrollLeft()) - left_scroll_align;
                        var to_left = to_left < 0 ? 0 : to_left; 
                        if (!native_scroll){
                            $(elem_images).animate({ scrollLeft: Math.abs(to_left) }, 600, 'easeInOutQuart', function() {
                                window.site.horizontal_scroller.setup_deactivate_skip(skip_index, instance);
                            });
                        }
                    }
                    
                    /// switch active class after animation -------------------------------- /
                    $('.page-track-frame-images .page-track-item').removeClass('active');
                    $skip_index_element.addClass('active');
                    window.site.horizontal_scroller.setup_deactivate_skip(skip_index, instance);

                }
            },


            setup_scroll_indicator: function(instance, image_transform,max_image_scroll) {
                if ($('.scroll-indicator', instance).length) {
                    var percentage = Math.abs(image_transform/max_image_scroll * 100).toString();
                    if (percentage){
                        $('.scroll-indicator-active-bar', instance).css({'width': percentage+'%'});
                    }
                }
            },
            
            setup_deactivate_skip: function(index, instance) {
                
                var animated_scroll_active = !$(instance).hasClass('track-scroller-disabled');
                var max_slides = $('.page-track-frame-images .page-track-item').length;
                var $next = $('.page-track-scroll-next');
                var $prev = $('.page-track-scroll-prev');

                /// Show/hide skip arrows -------------------------------- /
                if (index == max_slides) {
                    $next.fadeOut();
                } else {
                    $next.show();
                }
                if (index == 1) {
                    $prev.fadeOut();
                } else {
                    $prev.show();
                }

                /* Hide if there is no remaining scroll (usually occurs with the last few items) */
                if (!animated_scroll_active) {
                    var total_scrollable_width = $(instance).find('.page-track table').width();
                    var current_scroll_right_offset = $(instance).find('.page-track').scrollLeft() + $(window).width();
                    if (current_scroll_right_offset >= total_scrollable_width) {
                        $next.fadeOut();
                    } else {
                        $next.fadeIn();
                    }
                }
            },
         
            play_video_on_hover: function(index) {
                
                if (!window.site.device.handheld()) {
                    $(".page-track-item .image").hover(function () {
                        if ($(this).find("video").length) {
                            $(this).addClass('video-reveal');
                            $(this).find("video")[0].play();
                        }
                    }, function () {
                        $(this).removeClass('video-reveal');
                        if ($(this).find("video").length) {
                            var el = $(this).find("video")[0];
                            el.pause();
                            setTimeout(function () {
                                el.currentTime = 0;
                            }, 700);

                        }
                    });
                }
            }

        },
        

        list_preview: {

            init: function() {

                window.site.list_preview.setup('.list-preview-scroll-container');

            },

            setup: function(instance) {

                ///----------------------------------------------------
                /// SETUP
                ///----------------------------------------------------

                    if (!instance || typeof instance == 'undefined') {
                        return;
                    }

                    list_preview_hover = '';
                    list_preview_hover_animate = '';

                    $('.list-preview-track-list .item', instance).hover(
                        function(event) {
                            // Hover
                            clearTimeout(list_preview_hover);

                            if (true || !$('#container_outer').hasClass('scrolling')) {

                                var instance = $(this).closest('.list-preview-scroll-container');
                                var this_index = $(this).attr('data-index');
                                var related_item = $('.list-preview-image .item', instance).filter('[data-index="' + this_index + '"]');

                                if (!related_item.hasClass('active')) {
                                    list_preview_hover = setTimeout(function() {
                                        $('.list-preview-image .item.active', instance).addClass('animate_out');

                                        clearTimeout(list_preview_hover_animate);
                                        list_preview_hover_animate = setTimeout(function() {
                                            related_item.addClass('active');
                                            $('.list-preview-image .item', instance).not(related_item).removeClass('active animate_out animate');
                                            list_preview_hover_animate = setTimeout(function() {
                                                related_item.addClass('animate');
                                            }, 30, related_item, instance);
                                        }, 200, related_item, instance);
                                    }, 20, instance, this_index, related_item);
                                }
                            }
                        },
                        function(event) {
                            // Mouseout
                            var this_index = $(this).attr('data-index');
                            clearTimeout(list_preview_hover);
                        }
                    );

                    $('.list-preview-track-list .item:eq(0)', instance).trigger('mouseenter');

                    // setup play video on hover function
                    window.site.list_preview.play_video_on_hover(instance);

            },
         
            play_video_on_hover: function(instance) {
                
                if (!window.site.device.handheld()) {
                    $(".image", instance).hover(function () {
                        if ($(this).find("video").length) {
                            $(this).addClass('video-reveal');
                            $(this).find("video")[0].play();
                        }
                    }, function () {
                        $(this).removeClass('video-reveal');
                        if ($(this).find("video").length) {
                            var el = $(this).find("video")[0];
                            el.pause();
                            setTimeout(function () {
                                el.currentTime = 0;
                            }, 700);

                        }
                    });
                }
            }
        
        },

        filters: {

            init: function() {

                $('.filter_toolbar')
                    .each(function() {
                        var filter_panel_id = $(this).attr('data-filter-panel-id');
                        var filter_panel_context = $(this).attr('data-filter-results-context');
                        var filters_results_url = $(this).attr('data-filter-results-url');
                        if (filter_panel_id && typeof filter_panel_id != 'undefined') {
                            var filter_panel = $('#' + filter_panel_id);
                            if (filter_panel.length) {
                                filter_panel.attr('data-filter-results-context', filter_panel_context);
                                filter_panel.attr('data-filter-results-url', filters_results_url);
                            }
                        }
                        // Button to show the filters popup
                        $(this).find('.filters_button')
                            .click(function() {
                                var filter_panel_id = $(this).closest('.filter_toolbar').attr('data-filter-panel-id');
                                if (filter_panel_id && typeof filter_panel_id != 'undefined') {
                                    if ($('#' + filter_panel_id).hasClass('active')) {
                                        window.site.filters.close(filter_panel_id);
                                    } else {
                                        window.site.filters.filters_panel_init(filter_panel_id);
                                    }
                                }
                            })
                        ;
                        // Free text search
                        $(this).find('.filters_search input')
                            .each(function() {
                                $(this).attr('data-default-value', $(this).val());
                                $(this).keypress(function(event) {
                                    var filter_panel_id = $(this).closest('.filter_toolbar').attr('data-filter-panel-id');
                                    var this_value = $(this).val();
                                    if (event.which == 13 && this_value != $(this).attr('data-default-value')) {
                                        // Clear filters panel, text and filters should be exclusive
                                        var filter_panel = $('#' + filter_panel_id);
                                        filter_panel.find('li').removeClass('active');
                                        // Submit search
                                        window.site.filters.filters_panel_init(filter_panel_id, false, true, true, true);
                                        return false;
                                    }
                                    $(this).addClass('typed');
                                });
                                $(this).closest('.filters_search').find('.filters_search_submit').unbind('click').bind('click', function() {
                                    var filter_panel_id = $(this).closest('.filter_toolbar').attr('data-filter-panel-id');
                                    var this_value = $(this).val();
                                    if (this_value != $(this).attr('data-default-value')) {
                                        // Clear filters panel, text and filters should be exclusive
                                        var filter_panel = $('#' + filter_panel_id);
                                        filter_panel.find('li').removeClass('active');
                                        // Submit search
                                        window.site.filters.filters_panel_init(filter_panel_id, false, true, true, true);
                                    }
                                    return false;
                                });
                            })
                            .focus(function() {
                                if ($(this).val() == $(this).attr('data-default-value')) {
                                    $(this).addClass('active').val('');
                                }
                            })
                            .blur(function() {
                                if ($(this).val() == '') {
                                    $(this).removeClass('active').val($(this).attr('data-default-value'));
                                }
                            })
                        ;
                    })
                ;
                window.site.filters.setup();
            },

            close: function(filter_panel_id) {
                $('#' + filter_panel_id).removeClass('active');
            },

            setup: function()  {

                $('.filter_toolbar')
                    .each(function() {
                        var filter_panel_id = $(this).attr('data-filter-panel-id');
                        if (filter_panel_id && typeof filter_panel_id != 'undefined') {
                            var filter_panel = $('#' + filter_panel_id);
                            var filter_panel_context = $(this).attr('data-filter-results-context');
                            var filter_type = filter_panel.attr('data-filter-type');

                            var load_filters = $('input[name="filter_data"]').length > 0 || window.location.search.indexOf('?filter=1') > '-1';
                            user_selected = false;

                            if (filter_panel) {
                                // Get current user filters data for this panel if it exists in localstorage
                                var filter_data = {'filters_count': 0, 'record_ids': [], 'filters_active': false, 'filters': {}};
                                var filter_data_defaults = filter_data;
                                if (localStorage) {
                                    // If filter data exists on the page, set it in storage
                                    var filter_data_new = $('.filter_results').find('[name="filter_data"]').val();
                                    if ($('.filter_results').find('[name="filter_data"]').length) {
                                        localStorage.setItem('filters', filter_data_new);
                                    }
                                    // If there is no filter data, clear out any old data so it is not 'remembered'
                                    if (!filter_data_new || typeof filter_data_new == 'undefined') {
                                        localStorage.setItem('filters', JSON.stringify(filter_data_defaults));
                                    }
                                    // Get filter data from storage if it exists
                                    var filters_user_data_storage = localStorage.getItem('filters');
                                    if (filters_user_data_storage && typeof filters_user_data_storage != 'undefined') {
                                        var data = JSON.parse(filters_user_data_storage);
                                        if (data[filter_type]) {
                                            var filter_data = data[filter_type];

                                            // Load filters only if the filter data is user selected - e.g. if the user intentionally filtered the data originally
                                            var user_selected = filter_data.user_selected;
                                            if (user_selected) {
                                                var load_filters = true;
                                            }
                                        }
                                    }
                                }

                                // Setup filters panel
                                if (load_filters) {
                                    var filter_panel_filters_enabled = filter_data.filters_active;
                                    if (filter_panel_filters_enabled) {
                                        var filter_panel_filters_count = filter_data.filters_count && typeof filter_data.filters_count != 'undefined' ? filter_data.filters_count : 0;

                                        // Mark active filters
                                        $.each(filter_data.filters, function(k, v) {
                                            var filter_items_container = filter_panel.find('ul[data-value="' + k + '"]');
                                            if (filter_items_container.length) {
                                                filter_items_container.find('li').removeClass('active');
                                                $.each(v, function(index, selected_item_value) {
                                                    filter_items_container.find('li[data-value="' + selected_item_value + '"]').addClass('active');
                                                });
                                            }
                                            if (k == 's' && v != '') {
                                                $(filter_panel_context).find('.filters_search input').each(function() {
                                                    $(this).val(v).addClass('active');
                                                });
                                            }
                                        });
                                        if (!filter_panel.hasClass('initialized') && window.location.search == '') {
                                            window.site.filters.filters_panel_init(filter_panel_id, false, true, user_selected);
                                        }
                                    }
                                }

                                // Clear filters button setup

                                $(this).find('.filters_clear_button').unbind('click').bind('click', function() {
                                    var filter_panel_id = $(this).parent().attr('data-filter-panel-id');
                                    var filter_panel = $('#' + filter_panel_id);
                                    filter_panel.find('li').removeClass('active');
                                    $(filter_panel_context).find('.filters_search input').each(function() {
                                        $(this).val($(this).attr('data-default-value')).removeClass('active');
                                    });
                                    window.site.filters.filters_panel_init(filter_panel_id, true);
                                });

                                if (!$(this).attr('data-default-label') || typeof $(this).attr('data-default-label') == 'undefined') {
                                    $(this).attr('data-default-label', $('span', this).html().trim());
                                }
                                $('.filter_heading', filter_panel_context).each(function() {
                                    var heading_context = ($('a', this).length ? $('a', this) : $(this));
                                    if (!$(this).attr('data-default-heading') || typeof $(this).attr('data-default-heading') == 'undefined') {
                                        $(this).attr('data-default-heading', heading_context.html().trim());
                                    }
                                });

                                if (filter_panel_filters_enabled == '1') {
                                    $(filter_panel_context).addClass('filters_active');
                                    // Change heading label
                                    if (window.location.search == '') {
                                        $('.filter_heading', filter_panel_context).each(function() {
                                            var heading_context = ($('a', this).length ? $('a', this) : $(this));
                                            $(this).text('Results');
                                        });
                                    }

                                    // Change button label
                                    if (filter_panel_filters_count > 0) {
                                        $('span', this).html('Filters selected <em class="qty">' + filter_panel_filters_count + '</em>');
                                    }
                                } else {
                                    $(filter_panel_context).removeClass('filters_active');
                                    $('.filter_heading', filter_panel_context).each(function() {
                                        var heading_context = ($('a', this).length ? $('a', this) : $(this));
                                        $(this).html($(this).attr('data-default-heading'));
                                    });
                                    $('span', this).html($(this).attr('data-default-label'));
                                }

                                filter_panel.addClass('initialized');
                            }
                        }
                        $(this).addClass('initialized');
                    })
                ;

            },

            filters_panel_init: function(filter_panel_id, clear_filters, instant_load_results, user_selected, text_field_submitted) {

                clear_filters = (clear_filters && typeof clear_filters != 'undefined' ? true : false);
                instant_load_results = (instant_load_results && typeof instant_load_results != 'undefined' ? true : false);

                filter_panel_original = $('#' + filter_panel_id);

                filter_panel_original.removeClass('filters-user-select');

                filter_panel_original.each(function() {
                    $(this).addClass('active');
                    $('.filters_list', this)
                        .each(function() {
                            $('li a', this).each(function() {
                                $(this).addClass('link-no-ajax');
                                $(this).unbind('click').bind('click', function() {
                                    var fieldtype = $(this).closest('ul').attr('data-fieldtype') == 'unique' ? 'unique' : 'multi';
                                    if ($(this).closest('li').hasClass('active')) {
                                        $(this).closest('li').removeClass('active');
                                        filter_panel_original.find('ul[data-value="' + $(this).closest('ul').attr('data-value') + '"]').find('li[data-value="' + $(this).attr('data-value') + '"]').removeClass('active');
                                    } else {
                                        if (fieldtype == 'unique') {
                                            $(this).closest('ul').find('li').removeClass('active');
                                        }
                                        $(this).closest('li').addClass('active');
                                        filter_panel_original.find('ul[data-value="' + $(this).closest('ul').attr('data-value') + '"]').find('li[data-value="' + $(this).attr('data-value') + '"]').addClass('active');
                                    }

                                    // Instantly submit the search
                                    $(this).closest('.filters_panel').find('.filters_submit').trigger('click');

                                    return false;
                                });
                            });
                        });
                        $(this).closest('.filters_panel').find('.filters_submit').unbind('click').bind('click', function() {
                            window.site.filters.submit_filters(filter_panel_id);
                        });
                    })
                    .promise()
                    .done(function() {
                        if (clear_filters || instant_load_results) {
                            if (instant_load_results && !text_field_submitted) {
                                var filter_panel_context = $(this).attr('data-results-context');
                                $('.filter_results', filter_panel_context).html('');
                            }
                            if (user_selected) {
                                filter_panel_original.addClass('filters-user-select');
                            }
                            $('.filters_submit', filter_panel_original).trigger('click');
                        } else {
                            // Clear the text search - text and filter searches should be exclusive
                            $('.filter_toolbar .filters_search input').each(function() {
                                $(this).val($(this).attr('data-default-value')).removeClass('active');
                            });
                            $('body').addClass('navigation-filters-open');
                            filter_panel_original.addClass('filters-user-select');
                        }
                    })
                ;
            },

            submit_filters: function(filter_panel_id) {

                filter_panel_original = $('#' + filter_panel_id);
                filters_user_selected = filter_panel_original.hasClass('filters-user-select');
                filter_type = filter_panel_original.attr('data-filter-type');
                filter_text_active = $('.filter_toolbar .filters_search input').hasClass('typed');
                $('#' + filter_panel_id)
                    .each(function() {
                        filter_panel_context = $(this).attr('data-results-context');
                        filters_results_url = $(this).attr('data-filter-results-url');
                        filter_text_search_field = $(filter_panel_context).find('.filters_search input');
                        url_params = '';
                        href = '';
                        params_dict = {};
                        filter_count = 0;
                        filters_active = false;
                        $('.filters_list', this)
                            .each(function() {
                                var this_context = $(this).attr('data-value');
                                params_dict[this_context] = Array();
                                $('li.active', this).each(function() {
                                    params_dict[this_context].push($(this).attr('data-value'));
                                    filter_count = filter_count + 1;
                                    filters_active = true;
                                });
                            })
                        ;
                        $.each(params_dict, function(k, v) {
                            if (v.length) {
                                url_params = url_params + '&f_' + k + '=' + v.join();
                            }
                        });

                        var text_search_value = (filter_text_search_field && typeof filter_text_search_field != 'undefined' && filter_text_search_field.val() != filter_text_search_field.attr('data-default-value') ? '&s=' + filter_text_search_field.val() : '');
                        var user_select_param = (filters_user_selected ? '&user_selected=1' : '');
                        var clear_filters_param = (url_params == '' && text_search_value == '' ? '&clear_filters=1' : '');

                        href = filters_results_url + '?filter=1' + user_select_param + clear_filters_param + text_search_value + url_params;
                        filter_panel_original.attr('data-filters-count', filter_count);
                        filter_panel_original.attr('data-filters-enabled', (filters_active ? '1' : '0'));
                        

                        // Scroll to results
                        var offset_top = $('.filter_results', filter_panel_context).offset().top - 150;
                        $('html,body').animate(
                            {scrollTop: offset_top},
                            1200,
                            'easeInOutExpo'
                        );
                    })
                    .promise()
                    .done(function() {
                        var incoming_content_type = 'inner';
                        $.pageload.load(href, false, function(new_page_inner_content, element_href, new_page_main_content) {
                            var new_page_inner_content = $(new_page_inner_content).find('.filter_results').html();
                            if (new_page_inner_content) {
                                $('.filter_results', filter_panel_context)
                                    .addClass('filter_transition')
                                    .delay(400)
                                    .queue(function() {
                                        var updated_url = element_href.replace('&user_selected=1', '');
                                        var clear_filters = false;
                                        if (element_href.split('?')[1] == 'filter=1&clear_filters=1') {
                                            var updated_url = element_href.split('?')[0];
                                            var clear_filters = true;
                                        }
                                        if ($('body').hasClass('navigation-filters-open') || clear_filters || filter_text_active) {
                                            history.replaceState({'ajaxPageLoad': true}, null, updated_url);
                                        }

                                        $('.filter_results', filter_panel_context).html(new_page_inner_content);
                                        $('.filter_results', filter_panel_context).removeClass('filter_transition');

                                        window.cart.init();
                                        window.site.enquiry.init();
                                        window.site.overlays.enquire.init();
                                        window.site.layout.grids.init();
                                        $.pageload.refresh();
                                        $(window).trigger('resize');

                                        window.site.filters.setup();

                                        var full_html = $(new_page_main_content);
                                        var filter_heading_text = full_html.find('.filter_heading').html();
                                        if (filter_heading_text && typeof filter_heading_text != 'undefined') {
                                            if (filter_heading_text != $('.filter_heading', filter_panel_context).attr('data-default-heading')) {
                                                $('.filter_heading', filter_panel_context).html(filter_heading_text);
                                            }
                                        }

                                        window.site.artlogic_inview.init();
                                        window.site.lazy_load.setup();
                                        window.site.lazy_load.fire($('.image_lazy_load', filter_panel_context));

                                        $(this).dequeue();
                                    })
                                ;
                            }
                        }, null, null, null, incoming_content_type);
                    })
                ;
            },

            get_filter_data: function() {
                // This ajax option is not currently used, but mnight be useful in future.
                $.ajax({
                    url: "/custom/filters_get_data/",
                    cache: false,
                    method: 'POST',
                    success: function(data) {
                        if (data) {
                            return data;
                        }
                    }
                });
            }

        },
        
        hubspot: {
        
            log: function(form_context) {
                if (form_context && form_context.length) {
                    var hubspot_account_id = '5818574';
                    var hubspot_form_id = 'c5ef55f1-8bd3-4eb2-9404-39c4cbe1433f';
                    var fields_data_hubspot = [];
                    var what_interests_u_list = [];
                    var mailing_list_signup = false;
                    var lifecyclestage = 'lead';
                    
                    if ($('input[name="subscription_form"]', form_context).length && $('input[name="subscription_form"]', form_context).val() == '1') {
                        // Form is just a 'subscription signup' form so we should tell hubspot to set lifecycle stage as 'subscriber'
                        // Is this possible - working this out.
                        // lifecyclestage = subscriber
                        var lifecyclestage = 'subscriber';
                    }
                    
                    if ($('input[name="hubspot_form_id"]', form_context).length && $('input[name="hubspot_form_id"]', form_context).val()) {
                        var hubspot_form_id = $('input[name="hubspot_form_id"]', form_context).val();
                    }
                    
                    if ($('[name="mailchimp_list_id"]:checked', form_context).length) {
                    	var mailing_list_signup = $('[name="mailchimp_list_id"]:checked', form_context).val() == '1' ? true : false;
                    	var mailing_list_checked_items = $('[name="mailchimp_list_id"]:checked', form_context)
                    	for (var i = 0; i < mailing_list_checked_items.length; i++) {
                    	    what_interests_u_list.push($(mailing_list_checked_items[i]).attr('data-hs-value'));
                    	}
                    	if (what_interests_u_list.length) {
                        	fields_data_hubspot.push({
                              "name": "what_interests_u_",
                              "value": what_interests_u_list.join(';') + ';' //JSON.stringify(what_interests_u_list)
                            });
                    	}
                    }
                    
                    if ($('[name="mailchimp_category_id"]:checked', form_context).length) {
                    	var mailing_list_signup = $('[name="mailchimp_category_id"]:checked', form_context).val() == '1' ? true : false;
                    	var mailing_list_checked_item = $('[name="mailchimp_category_id"]:checked', form_context);
                    	if (mailing_list_checked_item.length) {
                        	fields_data_hubspot.push({
                              "name": "what_best_describes_u_",
                              "value": mailing_list_checked_item.attr('data-hs-value')
                            });
                    	}
                    }
                    
                    if ($('[name="mailchimp_category2_id"]:checked', form_context).length) {
                    	var mailing_list_signup = $('[name="mailchimp_category2_id"]:checked', form_context).val() == '1' ? true : false;
                    	var mailing_list_checked_item = $('[name="mailchimp_category2_id"]:checked', form_context);
                    	if (mailing_list_checked_item.length) {
                        	fields_data_hubspot.push({
                              "name": "do_you_work_in_the_arts_",
                              "value": mailing_list_checked_item.attr('data-hs-value')
                            });
                    	}
                    }
                    
                    if ($('.form_row_types', form_context).length) {
                        var selected_type_option = $('.form_row_types li.active', form_context);
                        if (selected_type_option.length) {
                            var hubspot_label = selected_type_option.attr('data-hs-value');
                            if (hubspot_label && typeof hubspot_label != 'undefined') {
                            	fields_data_hubspot.push({
                                  "name": "we_want_to_hear_from_u",
                                  "value": hubspot_label
                                });
                            }
                        }
                    }
                    
                    if (lifecyclestage) {
                        fields_data_hubspot.push({
                          "name": "lifecyclestage",
                          "value": lifecyclestage
                        });
                    }
                        
                    if ($('input[name="email"]', form_context).length && $('input[name="email"]', form_context).val() && $('input[name="email"]', form_context).val() != $('input[name="email"]', form_context).attr('default-value')) {
                        fields_data_hubspot.push({
                          "name": "email",
                          "value": $('input[name="email"]', form_context).val().replace(/ /g,'')
                        });
                    }
                    if ($('input[name="name"]', form_context).length && $('input[name="name"]', form_context).val() && $('input[name="name"]', form_context).val() != $('input[name="name"]', form_context).attr('default-value')) {
                        var fullName = $('input[name="name"]', form_context).val();
                        if (fullName.split(' ').length > 1) {
                            var firstName = fullName.split(' ').slice(0, -1).join(' ');
                            var lastName = fullName.split(' ').slice(-1).join(' ');
                        } else {
                            var firstName = fullName;
                            var lastName = '';
                        }
                        fields_data_hubspot.push({
                          "name": "firstname",
                          "value": firstName
                        });
                        if (lastName && lastName != '') {
                            fields_data_hubspot.push({
                              "name": "lastname",
                              "value": lastName
                            });
                        }
                    }
                    if ($('input[name="phone"]', form_context).length && $('input[name="phone"]', form_context).val() && $('input[name="phone"]', form_context).val() != $('input[name="phone"]', form_context).attr('default-value')) {
                        var include_plus = $('input[name="phone"]', form_context).val().indexOf('+') == 0 ? true : false;
                        var phone_cleaned = (include_plus ? '+' : '') + parseInt($.trim($('input[name="phone"]', form_context).val()));
                        if (phone_cleaned) {
                            if (phone_cleaned.length >= 5) {
                                fields_data_hubspot.push({
                                  "name": "phone",
                                  "value": phone_cleaned
                                });
                            }
                        }
                    }
                    if ($('textarea[name="message"]', form_context).length && $('textarea[name="message"]', form_context).val() && $('textarea[name="message"]', form_context).val() != $('textarea[name="message"]', form_context).attr('default-value')) {
                        fields_data_hubspot.push({
                          "name": "website_enquiry_message",
                          "value": $('textarea[name="message"]', form_context).val()
                        });
                    }
                    if ($('input[name="website_enquiry_stock_number"]', form_context).length && $('input[name="website_enquiry_stock_number"]', form_context).val()) {
                        fields_data_hubspot.push({
                          "name": "website_enquiry_stock_number",
                          "value": $('input[name="website_enquiry_stock_number"]', form_context).val()
                        });
                    }
                    if ($('input[name="artist_interest"]', form_context).length && $('input[name="artist_interest"]', form_context).val()) {
                        fields_data_hubspot.push({
                          "name": "artist_interest",
                          "value": ';' + $('input[name="artist_interest"]', form_context).val()
                        });
                    }
                    if ($('input[name="artwork_interest"]', form_context).length && $('input[name="artwork_interest"]', form_context).val()) {
                        fields_data_hubspot.push({
                          "name": "artwork_interest",
                          "value": $('input[name="artwork_interest"]', form_context).val()
                        });
                    }
                    if ($('input[name="contact_type"]', form_context).length && $('input[name="contact_type"]', form_context).val() == 'exhibition-catalogue-request') {
                        fields_data_hubspot.push({
                          "name": "website_catalogue_requested",
                          "value": 'Yes'
                        });
                    }
                    
                    var hubspot_context = {
                        "pageUri": window.location.href.replace('%&', '%25&'),
                        "pageName": document.title
                    }
                    
                    var hubspot_cookie = h.getCookie('hubspotutk');
                    if (hubspot_cookie && hubspot_cookie != '' && typeof hubspot_cookie != 'undefined') {
                        hubspot_context["hutk"] = hubspot_cookie
                    }
                    
                    if ($('#global_client_ip').length) {
                        if ($('#global_client_ip').val() && typeof $('#global_client_ip').val() != 'undefined') {
                            if ($('#global_client_ip').val() != '') {
                                hubspot_context["ipAddress"] = $('#global_client_ip').val();
                            }
                        }
                    }
                    
                    var data_hubspot = {
                      //"submittedAt": ts, 
                      "fields": fields_data_hubspot,
                      "context": hubspot_context,
                      "legalConsentOptions": {
                        "consent": {
                          "consentToProcess": true,
                          "text": "I agree to allow Unit London to store and process my personal data.",
                          "communications": [
                            {
                              "value": mailing_list_signup,
                              "subscriptionTypeId": 624,
                              "text": "I agree to receive marketing communications from Unit London."
                            }
                          ]
                        }
                      }
                    };
                    
                    var hubspot_url = "https://api.hsforms.com/submissions/v3/integration/submit/" + hubspot_account_id + "/" + hubspot_form_id + "/?lifecyclestage=subscriber";
                    
                    $.ajax({
                        url: hubspot_url,
                        data: JSON.stringify(data_hubspot),
                        method: 'POST',
                        type: 'POST',
                        cache: false,
                        contentType: 'application/json',
                        dataType: 'json',
                        processData: false,
                        success: function(hs_data) {
                            console.log('## Hubspot submission success');
                        },
                        error: function(hs_data) {
                            console.log('## Hubspot submission error');
                            console.log(hs_data);
                            try {
                                var hubspot_data = JSON.stringify(hs_data);
                            } catch (error){
                                try {
                                    var hubspot_data = String(hs_data);
                                } catch (error){
                                    var hubspot_data = 'Could not parse hubspot response';
                                }
                            }
                            $.ajax({
                                url: "/hubspot/log/",
                                data: {status: 'error', hubspot_data: hubspot_data, hubspot_params: JSON.stringify(data_hubspot), hubspot_url: hubspot_url},
                                type: 'POST',
                                dataType: "json",
                                cache: false,
                                success: function() {
                                    console.log('## Hubspot submission error log success');
                                },
                                error: function() {
                                    console.log('## Hubspot submission error log ERROR');
                                }
                            });
                        }
                    });
                }
            }
        
        }

    };

    $(document).ready(function() {

        window.site.init();

    });


})(jQuery);







(function( $ ){

  'use strict';

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'iframe[src*="player.youku.com"]',
        'iframe[src*="mpembed.com"]',
        
        'object',
        'embed'
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );


(function($){$.prompt=function(message,options){options=$.extend({},$.prompt.defaults,options);$.prompt.currentPrefix=options.prefix;var ie6=($.browser.msie&&$.browser.version<7);var $body=$(document.body);var $window=$(window);var msgbox='<div class="'+options.prefix+'box" id="'+options.prefix+'box">';if(options.useiframe&&(($('object, applet').length>0)||ie6)){msgbox+='<iframe src="javascript:false;" style="display:block;position:absolute;z-index:-1;" class="'+options.prefix+'fade" id="'+options.prefix+'fade"></iframe>';}else{if(ie6){$('select').css('visibility','hidden');}msgbox+='<div class="'+options.prefix+'fade" id="'+options.prefix+'fade"></div>';}msgbox+='<div class="'+options.prefix+'" id="'+options.prefix+'"><div class="'+options.prefix+'container"><div class="';msgbox+=options.prefix+'close">X</div><div id="'+options.prefix+'states"></div>';msgbox+='</div></div></div>';var $jqib=$(msgbox).appendTo($body);var $jqi=$jqib.children('#'+options.prefix);var $jqif=$jqib.children('#'+options.prefix+'fade');if(message.constructor==String){message={state0:{html:message,buttons:options.buttons,focus:options.focus,submit:options.submit}};}var states="";$.each(message,function(statename,stateobj){stateobj=$.extend({},$.prompt.defaults.state,stateobj);message[statename]=stateobj;states+='<div id="'+options.prefix+'_state_'+statename+'" class="'+options.prefix+'_state" style="display:none;"><div class="'+options.prefix+'message">'+stateobj.html+'</div><div class="'+options.prefix+'buttons">';$.each(stateobj.buttons,function(k,v){states+='<button name="'+options.prefix+'_'+statename+'_button'+k+'" id="'+options.prefix+'_'+statename+'_button'+k+'" value="'+v+'">'+k+'</button>';});states+='</div></div>';});$jqi.find('#'+options.prefix+'states').html(states).children('.'+options.prefix+'_state:first').css('display','block');$jqi.find('.'+options.prefix+'buttons:empty').css('display','none');$.each(message,function(statename,stateobj){var $state=$jqi.find('#'+options.prefix+'_state_'+statename);$state.children('.'+options.prefix+'buttons').children('button').click(function(){var msg=$state.children('.'+options.prefix+'message');var clicked=stateobj.buttons[$(this).text()];var forminputs={};$.each($jqi.find('#'+options.prefix+'states :input').serializeArray(),function(i,obj){if(forminputs[obj.name]===undefined){forminputs[obj.name]=obj.value;}else if(typeof forminputs[obj.name]==Array){forminputs[obj.name].push(obj.value);}else{forminputs[obj.name]=[forminputs[obj.name],obj.value];}});var close=stateobj.submit(clicked,msg,forminputs);if(close===undefined||close){removePrompt(true,clicked,msg,forminputs);}});$state.find('.'+options.prefix+'buttons button:eq('+stateobj.focus+')').addClass(options.prefix+'defaultbutton');});var ie6scroll=function(){$jqib.css({top:$window.scrollTop()});};var fadeClicked=function(){if(options.persistent){var i=0;$jqib.addClass(options.prefix+'warning');var intervalid=setInterval(function(){$jqib.toggleClass(options.prefix+'warning');if(i++>1){clearInterval(intervalid);$jqib.removeClass(options.prefix+'warning');}},100);}else{removePrompt();}};var keyPressEventHandler=function(e){var key=(window.event)?event.keyCode:e.keyCode;if(key==27){removePrompt();}if(key==9){var $inputels=$(':input:enabled:visible',$jqib);var fwd=!e.shiftKey&&e.target==$inputels[$inputels.length-1];var back=e.shiftKey&&e.target==$inputels[0];if(fwd||back){setTimeout(function(){if(!$inputels)return;var el=$inputels[back===true?$inputels.length-1:0];if(el)el.focus();},10);return false;}}};var positionPrompt=function(){$jqib.css({position:(ie6)?"absolute":"fixed",height:$window.height(),width:"100%",top:(ie6)?$window.scrollTop():0,left:0,right:0,bottom:0});$jqif.css({position:"absolute",height:$window.height(),width:"100%",top:0,left:0,right:0,bottom:0});$jqi.css({position:"absolute",top:options.top,left:"50%",marginLeft:(($jqi.outerWidth()/2)*-1)});};var stylePrompt=function(){$jqif.css({zIndex:options.zIndex,display:"none",opacity:options.opacity});$jqi.css({zIndex:options.zIndex+1,display:"none"});$jqib.css({zIndex:options.zIndex});};var removePrompt=function(callCallback,clicked,msg,formvals){$jqi.remove();if(ie6){$body.unbind('scroll',ie6scroll);}$window.unbind('resize',positionPrompt);$jqif.fadeOut(options.overlayspeed,function(){$jqif.unbind('click',fadeClicked);$jqif.remove();if(callCallback){options.callback(clicked,msg,formvals);}$jqib.unbind('keypress',keyPressEventHandler);$jqib.remove();if(ie6&&!options.useiframe){$('select').css('visibility','visible');}});};positionPrompt();stylePrompt();if(ie6){$window.scroll(ie6scroll);}$jqif.click(fadeClicked);$window.resize(positionPrompt);$jqib.bind("keydown keypress",keyPressEventHandler);$jqi.find('.'+options.prefix+'close').click(removePrompt);$jqif.fadeIn(options.overlayspeed);$jqi[options.show](options.promptspeed,options.loaded);$jqi.find('#'+options.prefix+'states .'+options.prefix+'_state:first .'+options.prefix+'defaultbutton').focus();if(options.timeout>0)setTimeout($.prompt.close,options.timeout);return $jqib;};$.prompt.defaults={prefix:'jqi',buttons:{Ok:true},loaded:function(){},submit:function(){return true;},callback:function(){},opacity:0.6,zIndex:999,overlayspeed:'slow',promptspeed:'fast',show:'fadeIn',focus:0,useiframe:false,top:"15%",persistent:true,timeout:0,state:{html:'',buttons:{Ok:true},focus:0,submit:function(){return true;}}};$.prompt.currentPrefix=$.prompt.defaults.prefix;$.prompt.setDefaults=function(o){$.prompt.defaults=$.extend({},$.prompt.defaults,o);};$.prompt.setStateDefaults=function(o){$.prompt.defaults.state=$.extend({},$.prompt.defaults.state,o);};$.prompt.getStateContent=function(state){return $('#'+$.prompt.currentPrefix+'_state_'+state);};$.prompt.getCurrentState=function(){return $('.'+$.prompt.currentPrefix+'_state:visible');};$.prompt.getCurrentStateName=function(){var stateid=$.prompt.getCurrentState().attr('id');return stateid.replace($.prompt.currentPrefix+'_state_','');};$.prompt.goToState=function(state){$('.'+$.prompt.currentPrefix+'_state').slideUp('slow');$('#'+$.prompt.currentPrefix+'_state_'+state).slideDown('slow',function(){$(this).find('.'+$.prompt.currentPrefix+'defaultbutton').focus();});};$.prompt.nextState=function(){var $next=$('.'+$.prompt.currentPrefix+'_state:visible').next();$('.'+$.prompt.currentPrefix+'_state').slideUp('slow');$next.slideDown('slow',function(){$next.find('.'+$.prompt.currentPrefix+'defaultbutton').focus();});};$.prompt.prevState=function(){var $next=$('.'+$.prompt.currentPrefix+'_state:visible').prev();$('.'+$.prompt.currentPrefix+'_state').slideUp('slow');$next.slideDown('slow',function(){$next.find('.'+$.prompt.currentPrefix+'defaultbutton').focus();});};$.prompt.close=function(){$('#'+$.prompt.currentPrefix+'box').fadeOut('fast',function(){$(this).remove();});};})(jQuery);
// set up defaults for artlogic
jQuery.prompt.setDefaults({
      prefix: 'arprompt',
      useiframe: true
});

