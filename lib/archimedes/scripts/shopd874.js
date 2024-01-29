(function ($) {

    window.cart = {

        init: function () {
            if (!window.cart.ticketing_enabled() || $('body').hasClass('cart-dynamic-item-status')) {
                window.cart.check_quantities($('.store_item.store_item_dynamic_status, .store_item_list_price.store_item_dynamic_status'));
            }

            window.cart.edit_price($('.store_item .edit_price'));
            window.cart.add_to_cart($('.store_item .store_item_add_to_cart'));
            window.cart.remove_from_cart($('.store_item .store_item_remove_from_cart'));
            window.cart.remove_from_cart_summary_page();
            window.cart.change_qty();
            window.cart.set_coupon();
            window.cart.set_shipping_zone_in_session();
            window.cart.set_shipping_option_in_session();
            window.cart.proceed_to_payment();
            window.cart.cart_summary.init();
            window.cart.cart_page_init();
            window.cart.revert_quantities();
            window.cart.dev_mode_checkbox();
            window.cart.cart_validate_qty();
            window.cart.cart_terms_checkbox();
            window.cart.cart_fields.init();
            window.cart.cart_shipping_form_options();
            window.cart.errors();
            window.cart.set_currency();

            window.cart.stripe_checkout_payment_intent();
            window.cart.checkout_first_step_form();
            window.cart.checkout_second_step_form();

            // Wishlist specififc inits
            window.cart.wishlist_forms.init();
            window.cart.update_wishlist_rows();

            window.cart.add_to_wishlist($('.add_to_wishlist'));

            window.cart.wishlist_summary.init();
            window.cart.remove_from_wishlist($('.wishlist_button .store_item_remove_from_wishlist'));
            window.cart.remove_from_wishlist_summary_page();
            window.cart.after_page_load();
            window.cart.enable_framing_option();
        },

        after_page_load: function () {

            var local_storage = window.cart.get_cart_session_from_localstorage()
            var user_selected_currency = local_storage.currency_code;

            if (user_selected_currency) {

                var currency_store_select = $('.currency_store_select');
                var currency_store_default_currency = currency_store_select.attr('data-cart_currency') && typeof currency_store_select.attr('data-cart_currency') != 'undefined' ? currency_store_select.attr('data-cart_currency') : 'GBP';

                if (currency_store_select.length) {

                    currency_store_select.each(function () {
                        $(this).val(user_selected_currency);
                    });

                    var selected_currency_option = currency_store_select.find(":selected");
                    var selected_conversion_rate = parseFloat(selected_currency_option.attr('data-conversion_rate'));
                    var selected_currency_name = selected_currency_option.attr('data-currency_name');
                    var selected_currency_code = selected_currency_option.attr('value');

                    if (selected_currency_code != currency_store_default_currency) {

                        $(".store_item").each(function (index) {
                            var include_vat_in_price = $(this).find('input[name=include_vat_in_price]').val();
                            if (include_vat_in_price == 'True') {
                                var price_in_base_currency = $(this).find('input[name=price]').val();
                            } else {
                                var price_in_base_currency = $(this).find('input[name=price_without_vat]').val();
                            }
                            price_in_base_currency = parseFloat(price_in_base_currency);
                            if (typeof selected_conversion_rate == 'number' && !isNaN(selected_conversion_rate) && typeof price_in_base_currency == 'number' && !isNaN(price_in_base_currency)) {
                                var price_in_session_currency = (price_in_base_currency * selected_conversion_rate).toFixed(2);
                                if (selected_currency_name && price_in_session_currency) {
                                    $(this).find('.price').text(selected_currency_name + ' ' + price_in_session_currency);
                                }
                            }
                        });

                        $(".widget_total_price").each(function (index) {
                            var include_vat_in_price = $(this).attr('data-cart_include_vat_in_price');
                            if ($(this).attr('data-conversion_rate')) {
                                try {
                                    var conversion_rate_object = JSON.parse(JSON.stringify($(this).attr('data-conversion_rate')));
                                } catch (e) {
                                    console.error(e)
                                }
                            }
                            if (conversion_rate_object) {
                                // var conversion_rate_object = JSON.parse(JSON.stringify($(this).attr('data-conversion_rate')));
                                if (typeof conversion_rate_object[user_selected_currency] != 'undefined') {
                                    var conversion_rate = conversion_rate_object[user_selected_currency].conversion_rate; // BUG IT SHOULD BE A DICTIONARY AND CHOSE THE RIGHT AMOUNT

                                    var count = $(this).attr('data-count');

                                    if (include_vat_in_price == 'True') {
                                        var total_in_base_currency = $(this).attr('data-total_price_with_vat_in_base_currency')
                                    } else {
                                        var total_in_base_currency = $(this).attr('data-total_price_without_vat_in_base_currency')
                                    }
                                    total_in_base_currency = parseFloat(total_in_base_currency);

                                    var total_in_session_currency = (total_in_base_currency * conversion_rate).toFixed(2);
                                    if (total_in_session_currency && total_in_session_currency != 'NaN') {
                                        $(this).text(total_in_session_currency);
                                    }
                                    if (selected_currency_name) {
                                        $('.widget_currency').text(selected_currency_name);
                                    }

                                    $('.scw_total_count').text(count);
                                }
                                ;
                            }

                        });
                    }

                }

            }
        },

        ticketing_enabled: function () {
            return (window.ticketing && typeof window.ticketing != 'undefined');
        },

        cart_active: function () {
            var cart_active = false;
            if (typeof (Storage) !== "undefined") {
                if (localStorage.cart_active && typeof localStorage.cart_active != 'undefined') {
                    var cart_active = true;
                }
            }
            return cart_active;
        },

        cart_page_init: function () {
            window.onbeforeunload = function () {
            }
            if ($('#sc_checkout_container').length) {
                $('#sc_checkout_button').unbind('click.alert').bind('click.alert', function () {
                    if ($(this).hasClass('sc_quantities_failed')) {
                        h.alert($('#sc_total_quantity_warning_message').html());
                    } else if ($(this).hasClass('sc_fields_unconfirmed')) {
                        window.cart.cart_fields.field_change(null, null, true);
                        h.alert('<h2>Sorry</h2>Please fill out all the required fields and ensure you have entered a valid phone number and email address.<br><br>The phone number must only include numbers and dashes.');
                    } else if ($(this).hasClass('sc_shipping_unconfirmed')) {
                        if ($('#shipping_state:visible').length || $('#shipping_zip:visible').length) {
                            h.alert('<h2>Sorry</h2>Please enter your country, state, a valid ZIP code and shipping method.');
                        } else {
                            h.alert('<h2>Sorry</h2>Please choose a shipping country and method.');
                        }
                    } else if ($(this).hasClass('sc_terms_unconfirmed')) {
                        h.alert('<h2>Sorry</h2>Please agree to the terms and conditions.');
                    }
                });
                if ($('#sc_checkout_content .proceed_to_payment').hasClass('active') || $('#sc_checkout_button').hasClass('active')) {
                    window.cart.enable_checkout_button();
                }
                if (!$('#shipping_container #shipping_container_loader').length) {
                    $('#shipping_container').append('<div id="shipping_container_loader" class="loader_simple hidden"></div>');
                }
                if ($('iframe.stripe_checkout_app').is(':visible')) {
                    // Block user from clicking back in the checkout process...
                    window.history.forward();
                }
                window.onbeforeunload = function () {
                    $('body').addClass('sc-payment-processing');
                }
            }

        },

        check_quantities: function (elements, success_callback, failure_callback) {
            added_item_details = {};
            // This option only works if .promise() is available in the current version of jQuery
            if ($.isFunction($.fn.promise)) {
                $(elements)
                    .each(function () {
                        if ($(this).hasClass('store_item_list_price')) {
                            // List format object
                            var item_uid = $(this).attr('data-cart-uid');
                            if (item_uid) {
                                added_item_details[item_uid] = {};
                                added_item_details[item_uid]['key'] = $(this).attr('data-cart-uid');
                                added_item_details[item_uid]['recid'] = $(this).attr('data-cart-recid');
                                added_item_details[item_uid]['table_name'] = $(this).attr('data-cart-table_name');
                            }
                        } else {
                            // Detail page format
                            var item_uid = $(this).attr('data-uid');
                            if (item_uid) {
                                added_item_details[item_uid] = {};
                                $('.store_item[data-uid="' + item_uid + '"]').find('input').each(function (data) {
                                    added_item_details[item_uid][$(this).attr('name')] = $(this).val();
                                });
                            }
                        }
                    })
                    .promise()
                    .done(function () {
                        var availablity_params = {
                            'items': JSON.stringify(added_item_details)
                        };
                        if (window.location.search && typeof window.location.search != 'undefined') {
                            if (window.location.search.indexOf('_cmspreview=1') > -1) {
                                availablity_params['_cmspreview'] = '1'
                            }
                        }
                        $.post('/cart/check_availability/', availablity_params, function (data) {
                            if (!$.isEmptyObject(data.items)) {
                                for (item in data.items) {
                                    var item_key = item;
                                    var item = data.items[item];
                                    if (item.item_unavailable) {
                                        // Detail page type
                                        $('.store_item[data-uid="' + item_key + '"]').find('> div').not('.sold_out_dynamic').remove();
                                        $('.store_item[data-uid="' + item_key + '"]').find('.sold_out_dynamic').show();
                                        $('.store_item[data-uid="' + item_key + '"]').addClass('store_item_sold_out');
                                        // List page type
                                        $('.store_item_list_price[data-cart-uid="' + item_key + '"]').find('> div, > span').not('.sold_out_dynamic').remove();
                                        $('.store_item_list_price[data-cart-uid="' + item_key + '"]').find('.sold_out_dynamic').show();
                                        $('.store_item_list_price[data-cart-uid="' + item_key + '"]').closest('li').removeClass('available');
                                        $('.store_item_list_price[data-cart-uid="' + item_key + '"]').closest('li').addClass('unavailable');
                                        $('.store_item_list_price[data-cart-uid="' + item_key + '"]').addClass('store_item_sold_out');
                                        if (failure_callback && typeof failure_callback != 'undefined') {
                                            failure_callback();
                                        }
                                    } else {
                                        if (success_callback && typeof success_callback != 'undefined') {
                                            success_callback();
                                        }
                                    }
                                }
                            } else {
                                if (failure_callback && typeof failure_callback != 'undefined') {
                                    failure_callback();
                                }

                            }
                            window.cart.check_quantities_after();
                        }, 'json');
                    });
                ;
            }

        },

        check_quantities_after: function () {
            // Function which is run after the dyanmic quantities are checked
        },

        revert_quantities: function () {
            if ($('#sc_revert_changes').length) {
                $('#sc_revert_changes a')
                    .click(function () {
                        // For accessibility - tracks which element to refocus on
                        try {
                            h.accessibility.global_variables.element_to_refocus_to = $(this);
                        } catch (error) {
                            console.error(error);
                        }
                        $.post('/cart/revert_quantities/', {
                            'transaction_id': $(this).attr('data-transaction-id')
                        }, function (data) {
                            if (data.success) {
                                h.alert('<h2>Success</h2><div>' + data.reverted_count + ' artwork(s) were reverted succesfully.</div>');
                                $('#sc_revert_changes_container').hide();
                            } else {
                                if (data.error) {
                                    h.alert('<h2>Sorry</h2><div>An error occurred. Please try again or manually check the artwork status in your inventory.</div>');
                                } else {
                                    h.alert('<h2>Sorry</h2><div>No artworks seem to have reverted. They may have already been reverted OR certain fields may have reverted only - please manually check the artwork status in your inventory ASAP.</div>');
                                }
                            }
                        }, 'json');
                        return false;
                    })
                ;
            }

        },

        dev_mode_checkbox: function () {
            if ($('#sc_dev_mode_box').length) {
                if ($('#checkout_first_step').length) {
                    // Checkout 2.0

                    if (window.location.href.indexOf('_cmspreview=1') > -1) {
                        if ($('#sc_dev_mode_box #sc_dev_mode').length && !$('#sc_dev_mode_box #sc_dev_mode').is(':checked')) {
                            $('#sc_dev_mode_box #sc_dev_mode').attr('checked', true);
                        }
                    }
                } else {
                    // Checkout 1.0
                    $('#sc_dev_mode_box #sc_dev_mode')
                        .change(function () {
                            if (window.location.href.indexOf('_cmspreview=1')) {
                                history.replaceState(null, null, window.location.pathname);
                            }
                            var this_value = 0;
                            if ($(this).is(':checked')) {
                                var this_value = 1;
                            }
                            $.post('/cart/set_dev_mode/', {
                                'dev_mode': this_value
                            }, function () {
                                console.log('reload page after change on #sc_dev_mode_box #sc_dev_mode');
                                window.location.reload();
                            });
                        })
                    ;
                    $('#sc_dev_mode_box #sc_dev_mode_return')
                        .change(function () {
                            var this_value = 0;
                            if ($(this).is(':checked')) {
                                var this_value = 1;
                            }
                            $.post('/cart/set_dev_mode/', {
                                'dev_mode': 1,
                                'checkout_dev_return': this_value
                            }, function () {

                            });
                        })
                    ;

                    if (window.location.href.indexOf('_cmspreview=1') > -1) {
                        console.log('In cmspreview mode!');
                        if ($('#sc_dev_mode_box #sc_dev_mode').length && !$('#sc_dev_mode_box #sc_dev_mode').is(':checked')) {

                            $.post('/cart/set_dev_mode/', {
                                'dev_mode': 1
                            }, function () {
                                console.log('reload page after change when #sc_dev_mode_box #sc_dev_mode exists and #sc_dev_mode_box #sc_dev_mode is not checked');
                                window.location.reload();
                            });
                        }
                    }
                }
            }

        },

        cart_validate_qty: function () {
            if ($('#sc_total_quantity_limit_box').length) {
                var min_qty = $('#sc_minimum_quantity').val() && typeof $('#sc_minimum_quantity').val() != 'undefined' ? $('#sc_minimum_quantity').val() : '';
                var min_spend = $('#sc_minimum_spend').val() && typeof $('#sc_minimum_spend').val() != 'undefined' ? $('#sc_minimum_spend').val() : '';
                $.post('/cart/validate_qty/', {'min_qty': min_qty, 'min_spend': min_spend}, function (obj) {
                    obj = JSON.parse(obj);
                    if (obj.validated) {
                        $('#sc_checkout_button').removeClass('sc_quantities_failed');
                        $('#sc_total_quantity_limit_box').removeClass('active');
                        window.cart.stripe_init_button();
                    } else {
                        $('#sc_checkout_button').addClass('sc_quantities_failed');
                        $('#sc_total_quantity_limit_box').addClass('active');
                        if (!$('#sc_total_quantity_limit_box').hasClass('initialised')) {
                            $('#sc_total_quantity_limit_box').addClass('initialised');
                            h.alert($('#sc_total_quantity_warning_message').html());
                        }
                    }
                });
            }
        },

        cart_shipping_form_options: function () {
            if ($('#sc_shipping_address_matches_billing').length) {
                $('#sc_shipping_address_matches_billing').change(function () {
                    if ($(this).is(':checked')) {
                        $('#sc_shipping_address_field_wrapper input[type="text"]').not(':disabled').each(function () {
                            $(this).val('');
                        });
                        if (false) {
                            $('#sc_billing_address_field_wrapper input[type="text"], #sc_contact_info_field_wrapper input[type="text"]').not(':disabled').each(function () {
                                var autocomplete_value = typeof $(this).attr('autocomplete') != 'undefined' ? $(this).attr('autocomplete') : false;
                                if (autocomplete_value) {
                                    $('#sc_shipping_address_field_wrapper input[autocomplete="' + autocomplete_value + '"]').val($(this).val());
                                }
                            });
                        }
                        $('#sc_shipping_address_field_wrapper').hide();

                        $('#_customer_country_billing_fixed').show();
                        $('#sc_field_country_shipping').hide();
                        $('#sc_field_country_shipping').val($('#_customer_country_billing_fixed').val());
                        
                        if ($('#_customer_postcode_billing_fixed').length) {
                            $('#_customer_postcode_billing_fixed').show();
                            $('#sc_field_postcode_shipping').hide();
                            $('#sc_field_postcode_shipping').val($('#_customer_postcode_billing_fixed').val());
                        }

                        $('#_customer_state_billing_fixed').show();
                        $('#sc_field_state_shipping').hide();
                        $('#sc_field_state_shipping').val($('#_customer_state_billing_fixed').val());

                    } else {
                        if (false) {
                            $('#sc_shipping_address_field_wrapper input[type="text"]').not(':disabled').each(function () {
                                $(this).val('');
                            });
                        }
                        $('#sc_shipping_address_field_wrapper').show();

                        $('#_customer_country_billing_fixed').hide();
                        $('#sc_field_country_shipping').show();

                        if ($('#_customer_postcode_billing_fixed').length) {
                            $('#_customer_postcode_billing_fixed').hide();
                            $('#sc_field_postcode_shipping').show();
                        }

                        $('#_customer_state_billing_fixed').hide();
                        $('#sc_field_state_shipping').show();

                    }
                    window.cart.cart_fields.init();
                }).trigger('change');
            }
        },

        cart_terms_checkbox: function () {
            if ($('#sc_terms_box').length) {
                $('#sc_terms_box #sc_terms_agree')
                    .each(function () {
                        if ($(this).is(':checked')) {
                            $('#sc_checkout_button').removeClass('sc_terms_unconfirmed');
                        } else {
                            $('#sc_checkout_button').addClass('sc_terms_unconfirmed');
                            if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                                $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                            }
                        }
                    })
                    .change(function () {
                        if ($(this).is(':checked')) {
                            $('#sc_checkout_button').removeClass('sc_terms_unconfirmed');
                            window.cart.enable_checkout_button();
                        } else {
                            $('#sc_checkout_button').addClass('sc_terms_unconfirmed');
                            if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                                $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                            }
                        }
                    })
                ;
                $('#sc_terms_box label a[href="#sc_terms_content"]').unbind().click(function () {
                    // For accessibility - tracks which element to refocus on
                    try {
                        h.accessibility.global_variables.element_to_refocus_to = $(this);
                    } catch (error) {
                        console.error(error);
                    }
                    var terms_and_conditions_content = $('#sc_terms_box #sc_terms_content').html();
                    h.alert(terms_and_conditions_content);
                    return false;
                });
            }

        },

        cart_fields: {

            init: function () {
                if ($('#sc_additional_fields').length) {
                    $('#sc_additional_fields .sc_field_row input').unbind()
                        .each(function () {
                            if ($(this).val() == '' && $(this).val() == $(this).attr('default-value')) {
                                $(this).addClass('sc_field_edited')
                            }
                        })
                        .focus(function () {
                            $(this).closest('.sc_field_row').removeClass('sc_field_error error');
                        })
                        .bind('change', function (e) {
                            $(this).addClass('sc_field_edited');
                            window.cart.cart_fields.field_change(false, $(this));
                        })
                    ;
                    window.cart.cart_fields.field_change(true);
                }
            },

            field_change: function (first_load, changed_field, all_fields) {
                var all_fields = (all_fields && typeof all_fields != 'undefined' ? true : false);
                var first_load = (first_load && typeof first_load != 'undefined' ? true : false);
                var changed_field = (changed_field && typeof changed_field != 'undefined' ? changed_field : false);
                additional_fields_verified = true;
                additional_fields_errors = [];
                $('#sc_additional_fields').each(function () {
                    var field_selector = '#sc_additional_fields .sc_field_row input:required';
                    $(field_selector).each(function () {
                        if ($(this).val() == '' || $(this).val() == $(this).attr('default-value')) {
                            additional_fields_verified = false;
                            if ($(this).hasClass('sc_field_edited') || all_fields) {
                                additional_fields_errors.push($(this).attr('name'));
                            }
                        } else {
                            if ($(this).attr('name') == 'cart_user_email' || $(this).attr('name') == 'customer_email') {
                                if (!window.cart.validate_fields.email($(this).val())) {
                                    additional_fields_verified = false;
                                    if ($(this).hasClass('sc_field_edited') || all_fields) {
                                        additional_fields_errors.push($(this).attr('name'));
                                    }
                                }
                            }
                            if ($(this).attr('name') == 'cart_user_phone' || $(this).attr('name') == 'customer_phone') {
                                if (!window.cart.validate_fields.phone($(this).val())) {
                                    additional_fields_verified = false;
                                    if ($(this).hasClass('sc_field_edited') || all_fields) {
                                        additional_fields_errors.push($(this).attr('name'));
                                    }
                                }
                            }
                        }
                    });
                })
                    .promise()
                    .done(function () {
                        if (additional_fields_verified && additional_fields_errors.length == 0) {
                            cart_user_email_has_changed = false;
                            $('#sc_checkout_button').removeClass('sc_fields_unconfirmed');
                            $('#sc_additional_fields .sc_field_row').removeClass('sc_field_error error');
                            if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                                $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", false);
                            }

                            $('#stripe_form .sc_additional_field_mirror').remove();
                            $('#sc_additional_fields .sc_field_row input').each(function () {
                                $('#stripe_form').prepend('<input name="' + $(this).attr('name') + '" type="hidden" class="sc_additional_field_mirror" value="' + $(this).val() + '" />');
                                if ($(this).attr('name') == 'cart_user_email') {
                                    if ($('#stripe_form').attr('data-email') != $(this).val()) {
                                        cart_user_email_has_changed = true;
                                        $('#stripe_form').attr('data-email', $(this).val());
                                    }
                                }
                            }).promise().done(function () {
                                if (cart_user_email_has_changed) {
                                    // Re-initialise the checkout button if the email address has changed, this is so the correct email is fed into the stripe form
                                    window.cart.enable_checkout_button();
                                }
                            });

                        } else {
                            $('#sc_checkout_button').addClass('sc_fields_unconfirmed');
                            if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                                $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                            }

                            $('#sc_additional_fields .sc_field_row').removeClass('sc_field_error  error');
                            if (!first_load) {
                                $.each(additional_fields_errors, function (index, field_name) {
                                    var associated_field = $('#sc_additional_fields input[name="' + field_name + '"]');
                                    associated_field.closest('.sc_field_row').addClass('sc_field_error error');
                                });
                            }

                        }
                    });
            }

        },

        validate_fields: {

            phone: function (number) {
                if (number == '' || typeof number == 'undefined') {
                    return false;
                }
                var filter = /^[- +()]*[0-9][- +()0-9]*$/;
                var numbers_only = number.replace(/\D/g, '');
                var number = number.replace(/\s/g, '');
                if (numbers_only.length >= 5) {
                    if (filter.test(number.replace(/ /g, ''))) {
                        return true;
                    } else {
                        return false;
                    }
                    return true;
                }
                return false;
            },

            email: function (which) {
                if (which != "" && typeof which != "undefined") {
                    var str = which;
                    var at = "@";
                    var dot = ".";
                    var lat = str.indexOf(at);
                    var lstr = str.length;
                    var ldot = str.indexOf(dot);

                    if (str.indexOf(at) == -1) {
                        return false;
                    }

                    if (str.indexOf(at) == -1 || str.indexOf(at) == 0 || str.indexOf(at) == lstr) {
                        return false;
                    }

                    if (str.indexOf(dot) == -1 || str.indexOf(dot) == 0 || str.indexOf(dot) == lstr || str.indexOf(dot) == lstr - 1) {
                        return false;
                    }

                    if (str.indexOf(at, (lat + 1)) != -1) {
                        return false;
                    }

                    if (str.substring(lat - 1, lat) == dot || str.substring(lat + 1, lat + 2) == dot) {
                        return false;
                    }

                    if (str.indexOf(dot, (lat + 2)) == -1) {
                        return false;
                    }

                    if (str.indexOf(" ") != -1) {
                        return false;
                    }

                    return true;
                } else {
                    return false;
                }
            }

        },

        errors: function () {
            $('#sc_checkout_error').each(function () {
                h.alert($('#sc_checkout_error').html());
            });
        },

        test_localstorage: function () {

            if (has_localstorage) {
                return has_localstorage;
            }
            try {
                localStorage.setItem('_', '_');
                localStorage.removeItem('_');
                has_localstorage = true;
            } catch (e) {
                has_localstorage = false;
            }
            return has_localstorage;
        },

        edit_price: function (price_field) {
            price_field.each(function () {
                var price_field_item = $(this);
                $(this)
                    .each(function () {
                        $(this).attr('data-last-value', $(this).val());
                    })
                    .bind('input paste', function () {
                        // allow only numbers
                        var validChars = /^[0-9]*$|^[0-9][0-9]*\.[0-9]?[0-9]?$/;
                        var strIn = $(this).val();
                        var i = strIn.length;
                        var strOut = (validChars.test(strIn)) ? strIn : strIn.substring(0, i - 1);
                        $(this).val(strOut);
                    })
                    .bind('focus', function () {
                        $(this).val('');
                    })
                    .bind('blur change', function () {
                        if (!$(this).val() || typeof $(this).val() == 'undefined') {
                            var strOut = $(this).attr('data-last-value');
                        } else {
                            var strOut = $(this).val();
                            var strOut = parseFloat(strOut).toFixed(2);
                            if (strOut) {
                                $(this).attr('data-last-value', strOut);
                            }
                        }

                        editable_price = strOut;
                        $(this).val(editable_price);

                        var added_item_details = {};
                        item_uid = $(this).closest('.store_item').attr('data-uid');

                        $('.store_item[data-uid="' + item_uid + '"]').find('input').each(function (data) {
                            added_item_details[$(this).attr('name')] = $(this).val();
                            // console.log( added_item_details[$(this).attr('name')] ) ;
                        });
                        // console.log(added_item_details);

                        $.post('/cart/set_price/', {'item': JSON.stringify(added_item_details)}, function (obj) {
                            if (obj.error) {
                                h.alert(obj.error, {'persistent': false});
                            } else {
                                if (obj.new_key) {
                                    $('.store_item[data-uid="' + item_uid + '"]').find("input[name='key']").val(obj.new_key);
                                    $('.store_item[data-uid="' + item_uid + '"]').find("input[name='price']").val(editable_price);
                                    $('.store_item[data-uid="' + item_uid + '"]').find("input[name='price_without_vat']").val(editable_price);
                                    $('.store_item[data-uid="' + item_uid + '"]').attr('data-uid', obj.new_key);
                                }
                            }
                        }, 'json');
                    })
                ;
            });

        },

        get_wishlist_uids: function () {
            return JSON.parse(localStorage.getItem('wishlist_uids') || '[]');
        },

        update_wishlist_rows: function () {
            var uids = this.get_wishlist_uids();
            $.each(uids, function (index, uid) {
                console.log(uid)
                $('.wishlist_button[data-uid="' + uid + '"]').addClass('active');
            });
        },

        add_to_wishlist: function (add_button) {

            add_button.unbind().click(function () {
                // $('body').delegate(add_button.selector, 'click', function() {
                // $('body').off('click.add_to_wl_'+add_button.selector).on('click.add_to_wl_'+add_button.selector, add_button.selector, function(event) {
                var element = $(this);//event.target;

                // For accessibility - tracks which element to refocus on
                try {
                    h.accessibility.global_variables.element_to_refocus_to = element;
                } catch (error) {
                    console.error(error);
                }

                add_to_cart_clicked_element = element;

                if (window.cart.ticketing_enabled()) {
                    window.ticketing.add_to_pool(window.cart.add_to_wishlist_allowed, window.cart.add_to_wishlist_disallowed);
                } else {
                    window.cart.add_to_wishlist_function();
                }

                return false;
            });

            // Check if this item is already active

            if (window.cart.ticketing_enabled() && window.cart.test_localstorage()) {
                if (typeof (Storage) !== "undefined" && localStorage.wishlist_active_timestamp && typeof localStorage.wishlist_active_timestamp != 'undefined') {
                    //Get the cart summary info from localStorage
                    if (localStorage.cart_summary && typeof localStorage.cart_summary != 'undefined') {
                        if (localStorage.getItem('wishlist_summary') && typeof localStorage.getItem('wishlist_summary') != 'undefined') {
                            var wishlist_uids = localStorage.getItem('wishlist_uids') ? JSON.parse(localStorage.getItem('wishlist_uids')) : false;

                            if (wishlist_uids && typeof wishlist_uids != 'undefined') {
                                add_button.each(function () {
                                    if (wishlist_uids.indexOf($(this).closest('.wishlist_button').attr('data-uid')) > -1) {

                                        window.cart.update_wishlist_row($(this).closest('.wishlist_button').attr('data-uid'), 1);
                                        //$(this).closest('.wishlist_button').addClass('active');
                                    }
                                });
                            }
                        }
                    }
                }
            }

        },

        add_to_wishlist_allowed: function (uid) {
            clicked_element = add_to_cart_clicked_element;
            console.log('Add to pool - Success ');
            window.cart.add_to_wishlist_function();
        },

        add_to_wishlist_disallowed: function () {
            console.log('Add to pool - Failed');
            clicked_element = add_to_cart_clicked_element;
            h.alert('<h2>Sorry</h2><div>This option is currently unavailable. Please try again later.</div>');
        },

        add_to_wishlist_function: function () {
            clicked_element = add_to_cart_clicked_element;

            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("wishlist_active", true);
                localStorage.setItem("wishlist_active_timestamp", new Date().getTime());
            }


            var added_item_details = {},
                $this = $(clicked_element),
                item_uid = $this.closest('.wishlist_button').attr('data-uid');

            $('.wishlist_button[data-uid="' + item_uid + '"]').find('input').each(function (data) {
                added_item_details[$(this).attr('name')] = $(this).val();
            });

            $.post('/cart/add_to_wishlist/', {'item': JSON.stringify(added_item_details)}, function (obj) {
                if (obj.error) {
                    h.alert(obj.error, {'persistent': false});
                } else {

                    window.cart.wishlist_summary.get_summary();
                    window.cart.wishlist_summary.update(obj.total_count, 'add', obj.uid);
                    window.cart.update_wishlist_row(obj.uid, obj.total_count);
                    if (window.ga) {

                        var event_label = 'Unknown';

                        var item_name = $('.wishlist_button[data-uid="' + obj.uid + '"]:eq(0) [name="title"]').val();
                        var item_url = $('.wishlist_button[data-uid="' + obj.uid + '"]:eq(0) [name="item_url"]').val();

                        var event_label = (item_name && typeof item_name != 'undefined' ? item_name + ' ' : '') + (item_url && typeof item_url != 'undefined' ? '(' + item_url + ')' : '');

                        analytics_params = {
                            'hitType': 'event',
                            'eventCategory': 'Add to wishlist',
                            'eventAction': window.location.pathname,
                            'eventLabel': event_label
                        };
                        ga('send', analytics_params);
                        ga('tracker2.send', analytics_params);
                        ga('artlogic_tracker.send', analytics_params);
                    }
                    if (typeof window.fbq != 'undefined') {
                        if (window.fbq) {
                            fbq('track', 'AddToWishlist');
                        }
                    }
                    if (obj.total_count == 1 && $('#wcw_popup').length && !$('#wishlist_quick_cart_widget').length) {
                        // debugger;
                        h.alert($('#wcw_popup').html(), {buttons: false});
                        $('.arpromptmessage #wcw_popup_close a').click(function () {
                            $.prompt.close();
                            return false;
                        });
                    }
                }
            }, 'json');


        },

        add_to_cart: function (add_button) {

            add_button.unbind('click.add_to_cart').bind('click.add_to_cart', function () {

                add_to_cart_clicked_element = $(this);
                // For accessibility - tracks which element to refocus on
                try {
                    h.accessibility.global_variables.element_to_refocus_to = add_to_cart_clicked_element;
                } catch (error) {
                    console.error(error);
                }

                if (window.cart.ticketing_enabled()) {
                    $(this).closest('.store_item').addClass('store_item_adding');
                    $(this).addClass('loading');
                    window.ticketing.add_to_pool(window.cart.add_to_cart_allowed, window.cart.add_to_cart_disallowed);
                } else {
                    window.cart.add_to_cart_function();
                }

                return false;
            });
        },

        add_to_cart_allowed: function (uid) {
            clicked_element = add_to_cart_clicked_element;
            var clicked_element_context = clicked_element.closest('.store_item.store_item_dynamic_status');
            quantities_are_available_callback = function () {
                window.cart.add_to_cart_function();
            }
            quantities_are_unavailable_callback = function () {
                h.alert('<h2>Sorry</h2><div>This item is no longer available.</div>');
            }
            window.cart.check_quantities(clicked_element_context, quantities_are_available_callback, quantities_are_unavailable_callback);
            setTimeout(function () {
                $(clicked_element).closest('.store_item').removeClass('store_item_adding');
                $(clicked_element).removeClass('loading');
            }, 700);
        },

        add_to_cart_disallowed: function () {
            clicked_element = add_to_cart_clicked_element;
            h.alert('<h2>You are in a queue</h2><div><strong>We are experiencing high levels of demand for this item. Please keep trying to add the item to your cart, you may need to wait a minute between attempts.</strong><br><br>Please note items are not reserved until you have completed the full checkout process.</div>');
            setTimeout(function () {
                $(clicked_element).closest('.store_item').removeClass('store_item_adding');
                $(clicked_element).removeClass('loading');
            }, 700);
        },

        add_to_cart_function: function () {
            clicked_element = add_to_cart_clicked_element;
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("cart_active", true);
                localStorage.setItem("cart_active_timestamp", new Date().getTime());
            }

            if ($(clicked_element).closest('.store_item').hasClass('edit_price_row')) {

                var edited_price = $(clicked_element).closest('.store_item').find('.price input').val();

                if (edited_price == '' || parseInt(edited_price) == 0) {
                    h.alert('Please enter the correct amount');
                } else {
                    var added_item_details = {},
                        $this = $(clicked_element),
                        item_uid = $this.closest('.store_item').attr('data-uid');

                    $('.store_item[data-uid="' + item_uid + '"]').find('input').each(function (data) {
                        added_item_details[$(this).attr('name')] = $(this).val();
                    });

                    $.post('/cart/add/', {'item': JSON.stringify(added_item_details)}, function (obj) {
                        if (obj.error) {
                            if ($('#scw_popup').length) {
                                window.cart.add_to_cart_popup(obj, obj.error);
                                window.cart.add_to_cart_after(obj.item_count, obj.total_count, obj.sub_total, obj.uid);
                            } else {
                                h.alert(obj.error, {'persistent': false});
                            }
                        } else {
                            //window.cart.cart_summary.update(obj.total_count, obj.sub_total);
                            window.cart.cart_summary.get_summary();
                            window.cart.update_store_row(obj.uid, obj.item_count);
                            if (window.ga) {
                                var item_name = $('.store_item[data-uid="' + obj.uid + '"]:eq(0) .title').text();
                                analytics_params = {
                                    'hitType': 'event',
                                    'eventCategory': 'Store Add To Cart',
                                    'eventAction': window.location.pathname,
                                    'eventLabel': (item_name && typeof item_name != 'undefined' ? item_name : 'unknown')
                                };
                                ga('send', analytics_params);
                                ga('tracker2.send', analytics_params);
                                ga('artlogic_tracker.send', analytics_params);
                            }
                            if (typeof window.fbq != 'undefined') {
                                if (window.fbq) {
                                    fbq('track', 'AddToCart');
                                }
                            }
                            window.cart.add_to_cart_popup(obj);
                            window.cart.add_to_cart_after(obj.item_count, obj.total_count, obj.sub_total);
                        }
                    }, 'json');
                }
            } else {
                var added_item_details = {},
                    $this = $(clicked_element),
                    item_uid = $this.closest('.store_item').attr('data-uid');

                $('.store_item[data-uid="' + item_uid + '"]').find('input').each(function (data) {
                    added_item_details[$(this).attr('name')] = $(this).val();
                });
                $.post('/cart/add/', {'item': JSON.stringify(added_item_details)}, function (obj) {
                    if (obj.error) {
                        if (window.cart.ticketing_enabled()) {
                            if (obj.errortype == 'max_qty' && $('#store_quick_cart_widget').length && !($('#sc_contents_container').length || $('#sc_checkout_container').length)) {
                                window.cart.cart_summary.get_summary(true, {
                                    'item_uid': obj.uid,
                                    'errortype': obj.errortype,
                                    'errormsg': obj.error_short
                                });
                            } else {
                                window.cart.cart_summary.get_summary
                                if ($('#scw_popup').length) {
                                    window.cart.add_to_cart_popup(obj, obj.error);
                                    window.cart.add_to_cart_after(obj.item_count, obj.total_count, obj.sub_total, obj.uid);
                                } else {
                                    h.alert(obj.error, {'persistent': false});
                                }
                            }
                        } else {
                            if (obj.errortype == 'max_qty' && $('#store_quick_cart_widget').length && !($('#sc_contents_container').length || $('#sc_checkout_container').length)) {
                                window.cart.cart_summary.quick_cart_widget_open(obj.uid, obj.errortype, obj.error_short);
                            } else {
                                //h.alert(obj.error);
                                window.cart.add_to_cart_popup(obj);
                                window.cart.add_to_cart_after(obj.item_count, obj.total_count, obj.sub_total, obj.uid);
                            }
                        }
                    } else {
                        //$.post('/cart/get_widget_total/', function(sub_total){
                        //    window.cart.cart_summary.update(obj.total_count, sub_total.toFixed(2));
                        //}, 'json');
                        window.cart.cart_summary.get_summary();
                        // window.cart.cart_summary.update(obj.total_count, obj.sub_total);
                        window.cart.update_store_row(obj.uid, obj.item_count);
                        if (window.ga) {
                            var item_name = $('.store_item[data-uid="' + obj.uid + '"]:eq(0) .title').text();
                            analytics_params = {
                                'hitType': 'event',
                                'eventCategory': 'Store Add To Cart',
                                'eventAction': window.location.pathname,
                                'eventLabel': (item_name && typeof item_name != 'undefined' ? item_name : 'unknown')
                            };
                            ga('send', analytics_params);
                            ga('tracker2.send', analytics_params);
                            ga('artlogic_tracker.send', analytics_params);
                        }
                        if (typeof window.fbq != 'undefined') {
                            if (window.fbq) {
                                fbq('track', 'AddToCart');
                            }
                        }
                        window.cart.add_to_cart_popup(obj);
                        window.cart.add_to_cart_after(obj.item_count, obj.total_count, obj.sub_total, obj.uid);
                    }
                }, 'json');
            }
        },

        add_to_cart_popup: function (obj, error_message) {
            if ($('#scw_popup').length) {
                var checkout_link = $('#scw_checkout a.scw_checkout_link').attr('href');

                if ($('#scw_popup').hasClass('scw_popup_skip_to_checkout') && typeof checkout_link != 'undefined') {
                    // Redirect straight to the cart when an item is added
                    $('.store_item[data-uid="' + obj.uid + '"]').addClass('store_item_redirecting_to_cart');
                    setTimeout(function () {
                        window.location.href = checkout_link;
                    }, 200, checkout_link);
                } else {
                    if (obj.total_count == 1 || $('#scw_popup').hasClass('scw_popup_always_show')) {
                        h.alert($('#scw_popup').html());
                        $('.arpromptmessage #scw_popup_close a').click(function () {
                            $.prompt.close();
                            return false;
                        });

                        $('.arpromptmessage #scw_popup_inner h3').show();
                        $('.arpromptmessage #scw_popup_inner #scw_popup_error_message').hide();
                        if (error_message && typeof error_message != 'undefined') {
                            $('.arpromptmessage #scw_popup_inner h3').hide();
                            if ($('.arpromptmessage #scw_popup_inner #scw_popup_error_message').length == 0) {
                                $('.arpromptmessage #scw_popup_inner h3').after('<div id="scw_popup_error_message"></div>');
                            }
                            $('.arpromptmessage #scw_popup_inner #scw_popup_error_message').html(error_message.replace('h2>', 'h3>'));
                        }
                        $('.arpromptbuttons').remove();
                    }
                }
            }
        },

        add_to_cart_after: function (item_count, total_item_count, sub_total, uid) {

        },

        remove_from_cart: function (remove_button, reload) {
            var item_uid;
            remove_button.unbind().click(function () {
                if ($(this).closest('.store_item').size() > 0) {
                    item_uid = $(this).closest('.store_item').attr('data-uid');
                    parent_row = $(this).closest('.store_item');
                } else if ($(this).closest('.product_detail').size() > 0) {
                    item_uid = $(this).closest('.product_detail').attr('data-uid');
                    parent_row = $(this).closest('.product_detail');
                } else {
                    item_uid = $(this).attr('data-uid');
                    parent_row = false;
                }
                parent_row_delay = $(this).closest('#store_quick_cart_widget').attr('data-remove-delay') ? $(this).closest('#store_quick_cart_widget').attr('data-remove-delay') : false;

                $.post('/cart/remove_item/', {'unique_id': item_uid}, function (obj) {
                    if (reload == 'reload') {
                        window.location.pathname = window.location.pathname;
                        window.cart.cart_summary.get_summary();
                    } else {
                        remove_from_cart_after = function () {
                            window.cart.cart_summary.get_summary();
                            window.cart.update_store_row(obj.uid, obj.item_count);
                        }
                        if (parent_row && parent_row_delay) {
                            $(parent_row)
                                .addClass('hide')
                                .delay(parent_row_delay)
                                .queue(function () {
                                    remove_from_cart_after();
                                    $(this).dequeue();
                                })
                            ;
                        } else {
                            remove_from_cart_after();
                        }
                    }
                }, 'json');

                return false;
            });
        },

        remove_from_cart_summary_page: function () {
            window.cart.remove_from_cart($('#shopping_cart_information .remove'), 'reload');
        },

        update_store_row: function (uid, total_count) {
            $('.store_item[data-uid="' + uid + '"]').each(function () {
                if (total_count > 0) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
                $('.store_item_remove_container', this).each(function () {
                    if (total_count > 0) {
                        $(this).fadeIn();
                    } else {
                        $(this).fadeOut();
                    }
                });
                $('.store_item_total', this).each(function () {
                    $('.store_item_total_number', this).html(total_count);
                });
            });
        },

        set_cart_session_in_localstorage: function (cart_session) {
            var cart_session = cart_session && typeof cart_session != 'undefined' ? cart_session : false;
            if (window.cart.test_localstorage() && cart_session) {
                localStorage.setItem('cart_session', JSON.stringify(cart_session));
            }
        },

        get_cart_session_from_localstorage: function () {
            if (window.cart.test_localstorage()) {
                var cart_session = localStorage.getItem('cart_session');
                if (cart_session && typeof cart_session != 'undefined') {
                    return JSON.parse(cart_session);
                } else {
                    return {};
                }
            } else {
                return {};
            }
        },

        cart_summary: {

            init: function () {

                // If the checkout process has finished, run cleanup

                if ($('#sc_confirmation_body').length || $('.sc_confirmation_body').length || $('input[name="sc_confirmation"]').length) {
                    // Confirmation page functions
                    if (window.cart.ticketing_enabled()) {
                        if (window.ticketing.remove_from_pool && typeof window.ticketing.remove_from_pool != 'undefined') {
                            window.ticketing.remove_from_pool();
                        }
                    }
                    if (window.cart.test_localstorage()) {
                        window.cart.cart_summary.clear_cart_from_localstorage();
                    }
                    if (window.ga) {
                        var cart_items = JSON.parse(localStorage.getItem('cart_session')).items;
                        var label_list = [];
                        $.each(cart_items, function (index, value) {
                            label_list.push(value.title);
                        });
                        analytics_params = {
                            'hitType': 'event',
                            'eventCategory': 'Store Purchase',
                            'eventAction': window.location.pathname,
                            'eventLabel': label_list.join(', ')
                        };
                        ga('send', analytics_params);
                        ga('tracker2.send', analytics_params);
                        ga('artlogic_tracker.send', analytics_params);
                    }
                }

                // If the widget exists, run the setup

                if ($('#store_cart_widget').length > 0 || $('#store_quick_cart_widget').length > 0) {
                    window.cart.cart_summary.widget_setup();
                    window.cart.cart_summary.quick_cart_widget_setup();


                    if (window.cart.ticketing_enabled() && window.cart.test_localstorage()) {

                        $('#store_quick_cart_widget').addClass('sqcw_initialised');

                        var total_count = '', sub_total = '', order_total = '';

                        //Check for the localStorage 'session' timestamp
                        if (typeof (Storage) !== "undefined" && localStorage.cart_active_timestamp && typeof localStorage.cart_active_timestamp != 'undefined') {

                            var cart_days_active = (parseInt(Date.now() - localStorage.getItem('cart_active_timestamp')) / (1000 * 60 * 60 * 24)); //milliseconds to days

                            if (cart_days_active > 3) {
                                //LocalStorage 'session' expires after 3 days
                                localStorage.setItem("cart_active", false);
                                localStorage.setItem("cart_active_timestamp", null);

                            } else {
                                //Get the cart summary info from localStorage
                                if (localStorage.cart_summary && typeof localStorage.cart_summary != 'undefined') {
                                    var cart_summary = JSON.parse(localStorage.getItem('cart_summary'));
                                    var total_count = cart_summary.total_count && typeof cart_summary.total_count != 'undefined' ? cart_summary.total_count : '',
                                        sub_total = cart_summary.sub_total && typeof cart_summary.sub_total != 'undefined' ? cart_summary.sub_total : '',
                                        order_total = cart_summary.order_total && typeof cart_summary.order_total != 'undefined' ? cart_summary.order_total : '';
                                }
                            }
                        }

                        //Send values to visual update of cart.
                        window.cart.cart_summary.update(total_count, sub_total, order_total);


                    } else {
                        //Standard cart summary check, using ajax calls
                        window.cart.cart_summary.get_summary($('#store_quick_cart_widget').hasClass('sqcw_initialised') ? false : true);
                    }

                }

                // If new session data has been supplied, add it to localstorage

                if ($('input[name="sc_session_data_for_localstorage"]').length) {
                    var parsed_value = JSON.parse($('input[name="sc_session_data_for_localstorage"]').val());
                    if (parsed_value.cart && typeof parsed_value.cart != 'undefined') {
                        window.cart.set_cart_session_in_localstorage(parsed_value.cart);
                    }
                }

                // Empty cart if all items have been removed via the checkout page.
                if (window.cart.ticketing_enabled() && window.cart.test_localstorage()) {
                    /*
                        The primary purpose of this function is to detect(a hidden field) when there are no items left in the cart 
                        and clear the cart_summary from localstorage so that the cart widget does not display on artwork detail pages.
                        This should only be necessary if ticketing is enabled.
                    */
                    if ($('#clear_cart_items_from_localstorage').length) {
                        window.cart.cart_summary.clear_cart_from_localstorage();
                    }
                }
            },

            clear_cart_from_localstorage: function () {
                if (window.cart.test_localstorage()) {
                    localStorage.removeItem("cart_active", true);
                    localStorage.removeItem('cart_summary');
                }
            },

            widget_setup: function () {
                if ($('#store_cart_widget').hasClass('hide_when_empty')) {
                    $('#store_cart_widget').hide();
                }
                if ($('#store_quick_cart_widget').length > 0) {
                    $('#store_cart_widget .scw_checkout_link').unbind('click.scw_basket_link').bind('click.scw_basket_link', function () {
                        // For accessibility - tracks which element to refocus on
                        try {
                            h.accessibility.global_variables.element_to_refocus_to = $(this);
                        } catch (error) {
                            console.error(error);
                        }
                        if (window.cart.ticketing_enabled()) {
                            window.cart.cart_summary.get_summary();
                        }
                        window.cart.cart_summary.quick_cart_widget_open();
                        return false;
                    });
                }
            },

            quick_cart_widget_setup: function () {
                if ($('#store_quick_cart_widget').length) {
                    $('#store_quick_cart_widget #sqcw_close').unbind().click(function () {
                        window.cart.cart_summary.quick_cart_widget_close();
                    });
                }
            },

            quick_cart_widget_open: function (item_uid, errortype, errormsg) {
                if (!($('#sc_contents_container').length || $('#sc_checkout_container').length)) {
                    var item_uid = item_uid && typeof item_uid != 'undefined' ? item_uid : false;
                    var errortype = errortype && typeof errortype != 'undefined' ? errortype : false;
                    var errormsg = errormsg && typeof errormsg != 'undefined' ? errormsg : '';

                    $('#store_quick_cart_widget').addClass('active');
                    $('body').addClass('sc_quick_cart_widget_active');
                    $('#store_quick_cart_widget').clearQueue().delay(10).queue(function () {
                        $(this).addClass('animate').dequeue();
                        $('body').addClass('sc_quick_cart_widget_animate');
                    });
                    if (errortype) {
                        if (errortype == 'max_qty' && item_uid) {
                            $('#sqcw_items_list li[data-uid="' + item_uid + '"]').addClass('sqcw_max_qty_error');
                            $('#sqcw_items_list li[data-uid="' + item_uid + '"] .sqcw_item_error').text(errormsg);
                        }
                    }
                    if ($('#sqcw_empty').length > 0) {
                        $('#store_quick_cart_widget').addClass('sqcw_no_items');
                    } else {
                        $('#store_quick_cart_widget').removeClass('sqcw_no_items');
                    }
                    window.cart.cart_summary.quick_cart_widget_open_callback();
                }
            },

            quick_cart_widget_close: function () {
                $('#store_quick_cart_widget').removeClass('animate');
                $('body').removeClass('sc_quick_cart_widget_animate');
                $('#store_quick_cart_widget').clearQueue().delay(600).queue(function () {
                    $(this).removeClass('active').dequeue();
                    $('body').removeClass('sc_quick_cart_widget_active');
                });
                window.cart.cart_summary.quick_cart_widget_close_callback();
            },

            quick_cart_widget_open_callback: function () {

            },

            quick_cart_widget_close_callback: function () {

            },

            get_summary: function (quick_cart_auto_open, error_info) {
                quick_cart_auto_open = (typeof quick_cart_auto_open != 'undefined' ? quick_cart_auto_open : true);
                error_info = (typeof error_info != 'undefined' ? error_info : {});

                if ($('#store_cart_widget').length > 0 || $('#store_quick_cart_widget').length > 0) {
                    $.ajax({
                        type: "POST",
                        url: '/cart/get_cart_info/',
                        success: function (data) {
                            var sub_total = data.sub_total.toFixed(2);
                            var order_total = data.order_total.toFixed(2);
                            if ($('#store_cart_widget').length) {
                                window.cart.cart_summary.update(data.count, sub_total, order_total);
                            }
                            if ($('#store_quick_cart_widget').length) {
                                $('#store_quick_cart_widget #sqcw_items').html(data.quick_cart_widget_html);
                                $('#store_quick_cart_widget .sqcw_total_price .sqcw_total_price_amount').html(sub_total);
                                $('#store_quick_cart_widget .sqcw_total_price .sqcw_total_price_amount_with_vat').html(order_total);
                                // Initialise cart functions
                                window.cart.remove_from_cart($('#sqcw_items .remove'), false);
                                window.cart.change_qty();
                                window.archimedes.archimedes_core.cms_preview.update_links('#store_quick_cart_widget');
                                // Open the panel if the auto open setting is enabled
                                if (quick_cart_auto_open && $('#store_quick_cart_widget').hasClass('sqcw_auto_open') && $('#store_quick_cart_widget').hasClass('sqcw_initialised')) {
                                    if (error_info.errortype) {
                                        window.cart.cart_summary.quick_cart_widget_open(error_info.item_uid, error_info.errortype, error_info.errormsg);
                                    } else {
                                        window.cart.cart_summary.quick_cart_widget_open();
                                    }
                                }
                                // Add the initialised class to show this has finished loading for the first time
                                $('#store_quick_cart_widget').addClass('sqcw_initialised');
                            }
                            if ($('.store_item .store_item_total').length) {
                                $('.store_item .store_item_total').closest('.store_item').each(function () {
                                    var store_item_row_uid = $(this).attr('data-uid');
                                    var item_in_cart_contents = data.cart_contents[store_item_row_uid];
                                    if (item_in_cart_contents && typeof item_in_cart_contents != 'undefined') {
                                        var item_qty = item_in_cart_contents.qty;
                                        if (item_qty && parseInt(item_qty) > 0) {
                                            window.cart.update_store_row(store_item_row_uid, item_qty);
                                        }
                                    }
                                });
                            }

                            window.cart.set_cart_session_in_localstorage(data.cart_session);

                        },
                        dataType: 'json'
                    });
                }

            },

            update: function (total_count, sub_total, order_total) {
                if ($('#store_cart_widget').size() > 0) {

                    if (total_count < 1) {
                        $('#store_cart_widget').addClass('empty');
                    } else {
                        $('#store_cart_widget').removeClass('empty');
                        var currencyData = $('#store_cart_widget #scw_items a').attr("data-currency");
                        if (currencyData && typeof currencyData != 'undefined') {
                            var currencyForAriaLabel = currencyData
                        } else {
                            var currencyForAriaLabel = ''
                        }
                        var itemString = ((total_count == 1) ? " item " : " items ")
                        var updatedAriaLabel = total_count + itemString + "in your basket with a total value of " + currencyForAriaLabel + order_total
                        $('#store_cart_widget #scw_items a').attr("aria-label", updatedAriaLabel);
                    }

                    if ($('#store_cart_widget').hasClass('hide_when_empty') && total_count == 0) {
                        $('#store_cart_widget').hide();
                        $('#store_cart_widget').removeClass('active');
                        $('#store_cart_widget').attr('data-item-count', total_count);
                    } else {

                        $('#store_cart_widget').removeClass('active');
                        $('#store_cart_widget').fadeOut('fast', function () {
                            $('.scw_total_count').html(total_count);
                            $('.scw_total_price_amount').html(Number(sub_total).toLocaleString('en', {minimumFractionDigits: 2}));
                            $('.scw_total_price_amount_with_vat').html(Number(order_total).toLocaleString('en', {minimumFractionDigits: 2}));
                            $('#store_cart_widget').fadeIn('fast');
                            $('#store_cart_widget').addClass('active');
                            $('#store_cart_widget').attr('data-item-count', total_count);
                            window.cart.cart_summary.update_callback();
                        });
                    }

                    if ($('#store_cart_widget').hasClass('hide_when_empty')) {
                        if (total_count < 1) {
                            $('#scw_checkout').hide();
                            $('#store_cart_widget').fadeOut('fast');
                            $('#store_cart_widget').removeClass('active');
                        } else {
                            $('#scw_checkout').show();
                            $('#store_cart_widget').fadeIn('fast');
                            $('#store_cart_widget').addClass('active');
                        }
                    }

                    if (window.cart.ticketing_enabled()) {
                        //Store cart summary info in local storage - ready for check on page init
                        if (window.cart.test_localstorage()) {
                            //Store cart summary info in local storage - ready for check on page init
                            var total_count = total_count && typeof total_count != 'undefined' ? total_count : '',
                                sub_total = sub_total && typeof sub_total != 'undefined' ? sub_total : '',
                                order_total = order_total && typeof order_total != 'undefined' ? order_total : '';

                            var cart_summary = {
                                total_count: total_count,
                                sub_total: sub_total,
                                order_total: order_total
                            };
                            localStorage.setItem('cart_summary', JSON.stringify(cart_summary));

                        }
                    }
                    window.cart.cart_summary.update_callback();
                }
            },

            update_callback: function () {

            }

        },

        set_coupon: function () {
            $('#cart_set_coupon_button a').unbind().click(function () {

                // For accessibility - tracks which element to refocus on
                try {
                    h.accessibility.global_variables.element_to_refocus_to = $(this);
                } catch (error) {
                    console.error(error);
                }

                var coupon_field = $('#cart_coupon_id').val();
                $.post('/cart/set_coupon/', {
                    'coupon_id': coupon_field
                }, function (response) {
                    var response = $.parseJSON(response);
                    window.cart.update_order_total($('.order_total'));
                    if (response.discount > 0) {
                        $('#sc_discount').show();
                        $('#sc_discount_inc_tax').show();
                        $('#sc_coupon_container').addClass('active');
                    } else {
                        $('#sc_discount').hide();
                        $('#sc_discount_inc_tax').hide();
                        $('#sc_coupon_container').removeClass('active');
                    }
                    $('.discount_amount').html(response.discount.toFixed(2));
                    $('.discount_amount_inc_tax').html(response.discount_inc_vat.toFixed(2));
                    if (response.success) {
                        h.alert('<h2>Thanks</h2> Your coupon has been added.');
                    } else {
                        h.alert('<h2>Sorry</h2> That coupon is not valid.');
                    }
                    $('#arpromptbox').addClass('couponprompt');
                    window.cart.update_total_vat_amount();
                });
                return false;
            });
        },

        update_discount: function () {

            var coupon_field = $('#cart_coupon_id').val();
            $.post('/cart/get_total_discount/', {
                'coupon_id': coupon_field
            }, function (response) {
                var response = $.parseJSON(response);
                if (response.discount > 0) {
                    $('#sc_discount').show();
                    $('#sc_discount_inc_tax').show();
                    $('#sc_coupon_container').addClass('active');
                } else {
                    $('#sc_discount').hide();
                    $('#sc_discount_inc_tax').hide();
                    $('#sc_coupon_container').removeClass('active');
                }
                $('.discount_amount').html(response.discount.toFixed(2));
                $('.discount_amount_inc_tax').html(response.discount_inc_vat.toFixed(2));
                window.cart.update_total_vat_amount();
            });

        },

        set_shipping_zone_in_session: function () {
            $('select#shipping_zones').change(function () {

                if ($(this).val() == '') {
                    $(this).removeClass('active');
                } else {
                    $(this).addClass('active');
                }
                zone_prefilled = $(this).hasClass('prefilled');

                $('#sc_total_price_container').removeClass('active');
                $('.proceed_to_payment').removeClass('active');
                $('#sc_checkout_button').addClass('sc_shipping_unconfirmed');
                $('#shipping_container').addClass('shipping_options_loading');
                if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                    $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                }

                var shipping_country_id = $(this).val();

                var shipping_state_id = 0;
                if(shipping_country_id == 227 || shipping_country_id == 36){
                    $("#shipping_state_container").show();
                }else{
                    $("#shipping_state_container").hide();
                }
                if($("#shipping_state").val() != ''){
                    shipping_state_id = $("#shipping_state").val();
                }

                if ($('#sc_checkout_container').data('sales-tax-api-enabled')) {
                    window.cart.update_shipping(shipping_country_id);
                } else {
                    $.post('/cart/set_shipping_zone/', {
                        'shipping_zone_id': $(this).val(),
                        'shipping_country_id': $(this).val(),
                        'use_countries': $('#use_countries').val(),
                        'no_reset': (zone_prefilled ? '1' : ''),
                        'shipping_state_id': shipping_state_id
                    }, function (data) {
                        $('#shipping_container').removeClass('shipping_options_loading');
                        window.cart.update_shipping_cost($('.shipping_cost'));
                        window.cart.update_shipping_cost_inc_vat($('.shipping_cost_inc_vat'));
                        window.cart.get_shipping_methods();
                        window.cart.update_total_vat_amount();
                        window.cart.update_order_total($('.order_total'));

                        data = jQuery.parseJSON(data);

                        if (!data.error) {
                            window.cart.show_shipping_states(data);
                        }
                    });
                }
                setTimeout(function () {
                    $(this).removeClass('prefilled');
                }, 400);
            });
            $('select#shipping_state').change(function () {
                $('select#shipping_zones').trigger('change');
            });
            $('select#shipping_zones.prefilled').trigger('change');

            $('input#shipping_zip').change(function () {
                $('select#shipping_zones').trigger('change');
            });
            $('input#shipping_zip.prefilled').trigger('change');

            //$('select#shipping_zones option[value!=""]:eq(0)').each(function() {
            //    $(this).attr('selected', 'selected');
            //});
            //$('select#shipping_zones').triggerHandler('change')
        },

        show_shipping_states: function (data) {
            /* update_shipping_states */
            var shipping_country_id = $("#shipping_zones").val();
            var shipping_states_container_el = $('#shipping_state_container');
            var shipping_zip_container_el = $('#shipping_zip_container');
            var shipping_states_el = $("select#shipping_state");

            if ((!isFinite(parseInt(shipping_country_id)) && shipping_country_id != '')
                || parseInt(shipping_country_id) == 0) {
                // Hide the shipping state field when no country is selected;
                // and remove the state options to allow validate_shipping_info
                // to work properly.
                $(shipping_states_el).empty();
                $(shipping_states_el).append($("<option></option>")
                    .attr("value", "0")
                    .prop("selected", true));
                $(shipping_states_container_el).add(shipping_zip_container_el).css('display', 'none');
            } else if (shipping_country_id != '') {
                const current_shipping_state = $(shipping_states_el).val();
                const states = data.shipping_states;
                const current_state = parseInt(current_shipping_state || data.shipping_state);
                $(shipping_states_el).empty();
                $(shipping_states_el).append($("<option></option>")
                    .attr("value", "0")
                    .prop("selected", true));
                $.each(states, function (i, state) {
                    $(shipping_states_el).append($("<option></option>")
                        .attr("value", state.id)
                        .prop("selected", parseInt(state.id) == current_state)
                        .text(state.name));
                });
                $(shipping_states_container_el).add(shipping_zip_container_el).css('display', states.length === 0 ? 'none' : 'inherit');
            }

            if (data.shipping_state_label) {
                $(shipping_states_container_el).find('#shipping_state_label')
                    .text(data.shipping_state_label);
            }
        },

        update_shipping: function () {
            $('#shipping_container').addClass('shipping_options_loading');
            $('#shipping_options_container').addClass('loading');

            var shipping_country_id = $("#shipping_zones").val();
            // var shipping_option_id = shipping_country_id != '0' ? $("#shipping_options").val() : '0';
            const requestData = {
                'shipping_zone_id': shipping_country_id,
                'shipping_country_id': shipping_country_id,
                'shipping_state_id': $("#shipping_state").val(),
                'shipping_option_id': $("#shipping_options").val(),
                'shipping_zip': $("#shipping_zip").val(),
                'no_reset': (zone_prefilled ? '1' : ''),
                'use_countries': $('#use_countries').val()
            };
            $.post('/cart/update_shipping/', requestData, function (data) {
                // console.log(data);
                if (data.error) {
                    h.alert('<h2>Sorry</h2><p>An unknown server error occurred while updating shipping options.</p>');
                }

                if (data.shipping_error === 'invalid_zip') {
                    $('input#shipping_zip').attr("data-error", "true");
                } else {
                    $('input#shipping_zip').attr("data-error", "false");
                }

                /* update_shipping_cost */
                var shipping_cost_el = $('#sc_shipping_total .shipping_cost');
                shipping_cost_el.html(Number(data.shipping_cost)
                    .toLocaleString('en', {minimumFractionDigits: 2}));

                /* update_shipping_cost_inc_vat */
                var shipping_cost_inc_vat_el = $('.shipping_cost_inc_vat');
                shipping_cost_inc_vat_el.html(Number(data.shipping_cost_inc_vat)
                    .toLocaleString('en', {minimumFractionDigits: 2}));

                /* get_shipping_methods */
                // TODO: on the server side, it makes more sense to return data in
                //       a list like the shipping states rather than as HTML, but
                //       it will need to be a new function so as not to break
                //       backwards compatibility.
                var shipping_zone_id = $('select#shipping_zones').val();
                var shipping_option_id = parseInt($('select#shipping_options').val());
                $('#shipping_options_container #shipping_options')
                    .attr('data-default-label', $('#shipping_options_container #shipping_options option[value=""]').text());
                $('#shipping_options_container #shipping_options')
                    .html(data.shipping_methods);
                $('#shipping_options_container #shipping_options option[value=""]')
                    .text($('#shipping_options_container #shipping_options').attr('data-default-label'));

                if (isFinite(shipping_option_id)) {
                    $('#shipping_options_container #shipping_options').val(shipping_option_id);
                } else {
                    $('#shipping_options_container #shipping_options').val(data.shipping_option);
                }

                if (shipping_zone_id && shipping_zone_id != '0') {
                    $('#shipping_options_container').addClass('active');
                } else {
                    $('#shipping_options_container').removeClass('active');
                }

                /* update_total_vat_amount */
                $('.total_vat_amount').html(Number(data.total_vat_amount).toLocaleString('en', {minimumFractionDigits: 2}));

                /* update_vate_rate */
                if ($('.vate_rate').length && typeof data.vat_rate_base != 'undefined' && data.vat_rate_base != 0) {
                    $('#sc_vat_rate').show();
                    $('.vate_rate').html(Number(data.vat_rate_base).toLocaleString('en', {minimumFractionDigits: 2}));
                } else if (data.vat_rate_base == 0) {
                    $('#sc_vat_rate').hide();
                }

                /* update_order_total */
                var order_total_el = $('.order_total');
                order_total_el.each(function () {
                    $(this).html(Number(data.order_total).toLocaleString('en', {minimumFractionDigits: 2}));
                });

                /* update_shipping_states */
                window.cart.show_shipping_states(data);

                window.cart.validate_shipping_info();
                $('#shipping_options_container').removeClass('loading');
                $('#shipping_container').removeClass('shipping_options_loading');
            });
        },

        validate_shipping_info: function () {
            var shipping_zone = parseInt($('select#shipping_zones').val());
            var shipping_state = parseInt($('select#shipping_state').val());
            var shipping_option = parseInt($('select#shipping_options').val());

            var zone_valid = isFinite(shipping_zone) && shipping_zone != 0;
            var state_valid = true;

            if ($('select#shipping_state>option').length > 1) {
                state_valid = isFinite(shipping_state) && shipping_state != 0;
            }

            var method_valid = isFinite(shipping_option) && shipping_option != 0;

            if (shipping_zone == 227) {
                var zip_regex = /^\d{5}$/;
                var zip_validated = zip_regex.test($('input#shipping_zip').val());
            } else {
                var zip_validated = true;
            }
            var zip_valid = (
                (
                    $('input#shipping_zip').is(':visible')
                    &&
                    $('input#shipping_zip').val() != ''
                    &&
                    zip_validated
                    &&
                    $('input#shipping_zip').attr("data-error") !== 'true'
                )
                ||
                $('input#shipping_zip').length == 0
                ||
                $('input#shipping_zip').is(':hidden')
            );

            if (zip_valid && zone_valid && state_valid && method_valid && ($('#sc_terms_agree').length === 0 || $('#sc_terms_agree').is(':checked'))) {
                // console.log("SHIPPING VALID");
                $('#sc_checkout_content .proceed_to_payment').addClass('active');
                $('#sc_checkout_content #sc_checkout_button').removeClass('sc_shipping_unconfirmed');
            } else {
                // console.log("SHIPPING INVALID");
                $('#sc_checkout_content .proceed_to_payment').removeClass('active');
                $('#sc_checkout_content #sc_checkout_button').addClass('sc_shipping_unconfirmed');
            }
        },

        get_shipping_methods: function () {
            var shipping_zone_id = $('select#shipping_zones').val();

            var shipping_state_id = 0;
            $('#shipping_container').addClass('shipping_options_loading');
            $('#shipping_options_container').addClass('loading');
            if($("#shipping_state").val() != ''){
                    shipping_state_id = $("#shipping_state").val();
            }
            $.post('/cart/get_shipping_methods/', {
                'shipping_zone_id': shipping_zone_id,
                'shipping_state_id': shipping_state_id,
                'use_countries': $('#use_countries').val()
            }, function (data) {

                shipping_options_error = $('#shipping_options_container #shipping_options option[value=""][data-unavailable-option="1"]').length == 1;

                $('#shipping_container').removeClass('shipping_options_loading');
                $('#shipping_options_container').removeClass('loading');
                if (!shipping_options_error) {
                    $('#shipping_options_container #shipping_options').attr('data-default-label', $('#shipping_options_container #shipping_options option[value=""]').text());
                }
                $('#shipping_options_container #shipping_options').html(data);


                shipping_options_error = $('#shipping_options_container #shipping_options option[value=""][data-unavailable-option="1"]').length == 1;

                if (!shipping_options_error) {
                    $('#shipping_options_container #shipping_options option[value=""]').text($('#shipping_options_container #shipping_options').attr('data-default-label'));
                }
                window.cart.set_shipping_option_in_session();
                $('#shipping_options').trigger('change');

                if (shipping_zone_id && parseInt(shipping_zone_id)) {
                    $('#shipping_options_container').addClass('active');
                } else {
                    $('#shipping_options_container').removeClass('active');
                }

                if (shipping_options_error) {
                    if ($('#shipping_options_container #shipping_options option[value=""][data-unavailable-option="1"]').attr('data-error-type') == 'no_country_item_type_matches') {
                        var shipping_item_labels = 'Unknown';
                        var item_label_attribute = $('#shipping_options_container #shipping_options option[value=""][data-unavailable-option="1"]').attr('data-unavailable-product-labels');
                        if (typeof item_label_attribute != 'undefined' && item_label_attribute != '') {
                            var shipping_item_labels = item_label_attribute;
                        }
                        h.alert('<h2>Sorry</h2> Shipping is not available to your selected country for the following item types: ' + shipping_item_labels + '.<br><br>Please remove these items to continue, or contact us for assistance.');
                    } else {
                        h.alert('<h2>Sorry</h2> We could not calculate shipping for the combination of items in your cart. Please purchase each item individually or contact us for assistance.');
                    }
                }

            }, 'html');

        },

        set_shipping_option_in_session: function () {
            $('select#shipping_options').unbind().change(function () {
                if ($('#sc_checkout_container').data('sales-tax-api-enabled')) {
                    window.cart.update_shipping();
                } else {
                    if ($(this).val()) {
                        $(this).addClass('active');
                        $('#shipping_container').addClass('shipping_options_loading');
                        $.post('/cart/set_shipping_option/', {'shipping_option_id': $(this).val()}, function () {
                            $('#shipping_container').removeClass('shipping_options_loading');
                            window.cart.update_shipping_cost($('.shipping_cost'));
                            window.cart.update_shipping_cost_inc_vat($('.shipping_cost_inc_vat'));
                            window.cart.update_order_total($('.order_total'));
                            window.cart.update_total_vat_amount();
                            $('#sc_total_price_container').addClass('active');
                            window.cart.enable_checkout_button();
                        });
                    } else {
                        $(this).removeClass('active');
                        window.cart.disable_checkout_button();
                    }
                }
            });
        },

        set_qty: function (uid, obj, option) {
            var current_value = '';
            var new_value = 1;
            current_value = obj.text();
            if (option == '-') {
                if (parseInt(current_value) > 1) {
                    new_value = parseInt(current_value) - 1;
                } else {
                    new_value = 1
                }
            } else if (option == '+') {
                new_value = parseInt(current_value) + 1;
                if (parseInt(new_value) > parseInt(obj.closest('.sc_cell_quantity').attr('data-max-qty'))) {
                    new_value = parseInt(current_value);
                    //h.alert('Sorry - you have added the maximum quantity of this item.');
                    if ($('#scw_popup').length) {
                        h.alert($('#scw_popup').html(), {buttons: false});
                        $('.arpromptmessage #scw_popup_close a').click(function () {
                            $.prompt.close();
                            return false;
                        });
                    }
                }
            }
            if (new_value == 1) {
                obj.closest('.product_detail').find('.decrease_qty').addClass('disabled').attr('aria-disabled', true);
            } else {
                obj.closest('.product_detail').find('.decrease_qty').removeClass('disabled').removeAttr('aria-disabled');
            }
            obj.text(new_value);
        },

        change_qty: function () {

            /* Increase or decrease the quantity input field value */
            var uid, $tr;
            $('.increase_qty').unbind().click(function () {
                // For accessibility - tracks which element to refocus on
                try {
                    h.accessibility.global_variables.element_to_refocus_to = $(this);
                } catch (error) {
                    console.error(error);
                }
                if (!$(this).hasClass('disabled')) {
                    uid = $(this).closest('.product_detail').attr('data-uid');
                    $tr = $(this).closest('.product_detail').find('.qty');
                    var new_qty = parseInt($tr.text()) + 1;
                    window.cart.update_qty_in_session(uid, new_qty, $tr, '+');
                    $('.product_detail[data-uid="' + uid + '"]').find('.decrease_qty').removeClass('disabled');
                }
                return false;
            });

            $('.decrease_qty').unbind().click(function () {
                // For accessibility - tracks which element to refocus on
                try {
                    h.accessibility.global_variables.element_to_refocus_to = $(this);
                } catch (error) {
                    console.error(error);
                }
                if (!$(this).hasClass('disabled')) {
                    uid = $(this).closest('.product_detail').attr('data-uid');
                    $tr = $(this).closest('.product_detail').find('.qty');
                    var new_qty = parseInt($tr.text()) - 1;
                    window.cart.update_qty_in_session(uid, new_qty, $tr, '-');
                    if ($tr.html() == '1') {
                        $('.product_detail[data-uid="' + uid + '"]').find('.decrease_qty').addClass('disabled').attr('aria-disabled', true);
                    }
                }
                return false;
            });
        },

        update_qty_in_session: function (uid, qty_value, tr, direction) {
            $.post('/cart/qty/', {'unique_id': uid, 'qty_value': qty_value}, function (obj) {
                if (obj.error) {
                    h.alert(obj.error, {'persistent': false});
                } else {
                    window.cart.set_qty(uid, tr, direction);
                    window.cart.update_sub_total($('.sub_total'));
                    window.cart.update_order_total($('.order_total'));
                    window.cart.update_shipping_cost($('.shipping_cost'));
                    window.cart.update_shipping_cost_inc_vat($('.shipping_cost'));
                    window.cart.update_item_total_price(uid);
                    window.cart.update_total_weight($('.total_weight'));
                    window.cart.update_total_vat_amount();
                    window.cart.cart_summary.init();
                    window.cart.cart_summary.get_summary();
                    window.cart.update_discount();
                    window.cart.cart_validate_qty();
                    return true;
                }
            }, 'json');
        },


        update_sub_total: function (sub_total_el) {
            $.post('/cart/get_sub_total/', function (data) {
                sub_total_el.html(Number(data).toLocaleString('en', {minimumFractionDigits: 2}));
            }, 'html');
        },

        update_total_vat_amount: function () {
            $('#shipping_container').addClass('shipping_options_loading');
            $.post('/cart/get_total_vat_amount/', function (data) {
                $('.total_vat_amount').html(Number(data).toLocaleString('en', {minimumFractionDigits: 2}));
                $('#shipping_container').removeClass('shipping_options_loading');
            }, 'html');
        },

        update_order_total: function (order_total_el) {
            $('#shipping_container').addClass('shipping_options_loading');
            $.post('/cart/get_order_total/', function (data) {
                order_total_el.each(function () {
                    $('#shipping_container').removeClass('shipping_options_loading');
                    $(this).html(Number(data).toLocaleString('en', {minimumFractionDigits: 2}));
                    if ($('#sc_checkout_content .proceed_to_payment').hasClass('active')) {
                        window.cart.enable_checkout_button();
                    }
                });
            });

        },

        update_total_weight: function (el) {
            $.post('/cart/get_total_weight/', function (data) {
                el.html(data);
            }, 'html');
        },

        update_item_total_price: function (uid) {
            $.post('/cart/get_item_total_price/', {'unique_id': uid}, function (obj) {
                var $price = $('.product_detail[data-uid="' + uid + '"]').find('.totalprice'),
                    $price_without_vat = $('.product_detail[data-uid="' + uid + '"]').find('.totalprice_without_vat');
                $price.html(obj.total_price);
                $price_without_vat.html(Number(obj.total_price_without_vat).toLocaleString('en', {minimumFractionDigits: 2}));
            }, 'json');
        },

        update_shipping_cost: function (shipping_cost_el) {
            if ($(shipping_cost_el).length) {
                $.post('/cart/get_shipping_cost/', function (data) {
                    shipping_cost_el.html(Number(data).toLocaleString('en', {minimumFractionDigits: 2}));
                }, 'html');
            }
        },

        update_shipping_cost_inc_vat: function (shipping_cost_el) {
            if ($(shipping_cost_el).length) {
                $('#shipping_container').addClass('shipping_options_loading');
                $.post('/cart/get_shipping_cost_inc_vat/', function (data) {
                    $('#shipping_container').removeClass('shipping_options_loading');
                    shipping_cost_el.html(Number(data).toLocaleString('en', {minimumFractionDigits: 2}));
                }, 'html');
            }
        },

        enable_checkout_button: function () {
            if ($('.proceed_to_payment').attr('data-payment-type') == 'stripe') {
                // Validate fields first
                var fields_validated = true;
                // TODO: make validate_shipping_info return a bool and use the result of that.
                if ($('#shipping_options_container').length) {
                    if ($('#shipping_options_container.active').length
                        && parseInt($('#shipping_options_container select').val())) {
                        $('#sc_checkout_button').removeClass('sc_shipping_unconfirmed');
                    } else {
                        $('#sc_checkout_button').addClass('sc_shipping_unconfirmed');
                        if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                            $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                        }
                        var fields_validated = false;
                    }
                }
                if ($('#shipping_zones_container').length) {
                    if ($('#shipping_zones_container.active').length
                        && parseInt($('#shipping_zones_container select').val())) {
                        $('#sc_checkout_button').removeClass('sc_shipping_unconfirmed');
                    } else {
                        $('#sc_checkout_button').addClass('sc_shipping_unconfirmed');
                        if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                            $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                        }
                        var fields_validated = false;
                    }
                }
                if ($('#sc_terms_box').length) {
                    if ($('#sc_terms_box #sc_terms_agree').is(':checked')) {
                        $('#sc_checkout_button').removeClass('sc_terms_unconfirmed');
                    } else {
                        $('#sc_checkout_button').addClass('sc_terms_unconfirmed');
                        if ($('button.stripe-button-el:not(.stripe_placeholder_button)').length) {
                            $('button.stripe-button-el:not(.stripe_placeholder_button)').attr("disabled", true);
                        }
                        var fields_validated = false;
                    }
                }

                checkout_form_validated = false;
                if (fields_validated && !$('#sc_checkout_button').hasClass('sc_fields_unconfirmed') && !$('#sc_checkout_button').hasClass('sc_quantities_failed') && !$('#sc_checkout_button').hasClass('sc_shipping_unconfirmed') && !$('#sc_checkout_button').hasClass('sc_terms_unconfirmed')) {
                    checkout_form_validated = true;
                }

                if (checkout_form_validated) {
                    if ($('#sc_additional_fields form').length) {
                        window.archimedes.archimedes_core.analytics.track_campaigns.save_form_data($('#sc_additional_fields form'));
                    }
                    window.cart.stripe_init_button();
                }

            }
        },

        disable_checkout_button: function () {
            $('.proceed_to_payment').removeClass('active');
            $('#stripe_loader').hide();
            if ($('.proceed_to_payment').attr('data-payment-type') == 'stripe') {
                if ($('#stripe_button_container[data-placeholder-button]').length) {
                    $('.proceed_to_payment').addClass('placeholder');
                    $('#stripe_button_container').html('');
                    var button_placeholder_content = $('#stripe_button_container').attr('data-placeholder-button');
                    $('#stripe_button_container').html(button_placeholder_content);
                    $('#stripe_button_container').find('button').click(function () {
                        return false;
                    });
                } else {
                    $('#stripe_button_container').html('');
                }
            }
        },

        proceed_to_payment: function () {
            var proceed_button = $('.proceed_to_payment');
            var payment_type = proceed_button.attr('data-payment-type');
            if (payment_type == 'worldpay') {
                proceed_button.unbind().click(function () {
                    if ($('#shipping_zones').val() !== '' && $('#shipping_options').val() !== '') {
                        $.post('/cart/worldpay/', function (data) {
                            $('#worldpay').html(data);
                            $('#worldpay form').submit();
                        }, 'html');
                        return false;
                    } else {
                        return false;
                    }
                });
            } else if (payment_type == 'stripe') {
                window.cart.disable_checkout_button();
            }
        },

        set_currency: function () {
            $('.currency_store_select').change(function () {
                $.post('/cart/set_session_currency/', {'currency': $(this).val()}, function (data) {
                    data = jQuery.parseJSON(data);
                    console.log(data)
                    window.cart.set_cart_session_in_localstorage(data.cart_session);
                    location.reload();
                });

            });
        },


        checkout_first_step_form: function () {
            $("#checkout_first_step #sc_next_step_button a").unbind().click(function () {
                $(this).closest('form').submit();
                return false;
            });
            $("#checkout_first_step").submit(function (event) {
                if (!$(this).hasClass('submitting')) {
                    $(this).addClass('submitting');
                    $('#sc_checkout_button .button').addClass('loading');
                    event.preventDefault();
                    var post_url = $(this).attr("action");
                    var request_method = $(this).attr("method");
                    var terms_and_conditions = $('#sc_terms_agree').is(':checked')
                    var terms_and_conditions_accepted = 0
                    if (terms_and_conditions || $('#sc_terms_agree').length < 1) {
                        terms_and_conditions_accepted = 1
                    }
                    var form_data = $(this).serialize() + '&terms_and_conditions_accepted=' + terms_and_conditions_accepted;

                    if (typeof window.archimedes != 'undefined') {
                        if (typeof window.archimedes.proxy_dir != 'undefined') {
                            if (window.archimedes.proxy_dir != '') {
                                form_data = form_data + '&proxy_dir=' + window.archimedes.proxy_dir;
                            }
                        }
                    }

                    // // TODO CLEAN THE ERRORS FROM THE PREVIOUS RESPONSE
                    $.ajax({
                        url: post_url,
                        type: request_method,
                        data: form_data,
                        dataType: "json",
                        error: function () {
                            $("#checkout_first_step").removeClass('submitting');
                            $('#sc_checkout_button .button').removeClass('loading');
                            h.alert('<h2>Sorry</h2><div>An error occurred while trying to process your information.</div>');
                        }
                    }).done(function (response) {
                        if (!response.validated) {
                            $("#checkout_first_step").removeClass('submitting');
                            $('#sc_checkout_button .button').removeClass('loading');
                            $.each(response.errors, function (i, error) {
                                $('[name="' + error.required_field + '"]').closest('.form_row').addClass('error');
                            });
                            h.alert('<h2>Sorry</h2>' + response.message);
                            console.log(response);
                        } else {
                            window.location.href = (response.redirect_to) + (window.location.search.indexOf('_cmspreview=1') > 0 ? '&_cmspreview=1' : '');
                        }
                    });
                } else {
                    return false;
                }
            });
            if ($("#checkout_first_step #sc_next_step_button a").length) {
                $('body').removeClass('checkout_second_step checkout_third_step');
                $('body').addClass('checkout_first_step');
            }
        },

        checkout_second_step_form: function () {
            $("#save_checkout_delivery_form #sc_next_step_button a").unbind().click(function () {

                if (window.cart.test_localstorage()) {
                    // Store the billing postcode if it is needed for the next step
                    var postcode = $('#sc_field_postcode_shipping').val();
                    if (typeof postcode != 'undefined') {
                        if (postcode != '' && postcode) {
                            localStorage.setItem('cart_billing_postcode', postcode);
                        }
                    }
                }

                $(this).closest('form').submit();
                return false;
            });
            $("#save_checkout_delivery_form").submit(function (event) {
                event.preventDefault();
                if (!$(this).hasClass('submitting')) {
                    $(this).addClass('submitting');
                    $('#sc_checkout_button .button').addClass('loading');
                    var post_url = $(this).attr("action");
                    var request_method = $(this).attr("method");
                    var form_data = $(this).serialize();

                    if (typeof window.archimedes != 'undefined') {
                        if (typeof window.archimedes.proxy_dir != 'undefined') {
                            if (window.archimedes.proxy_dir != '') {
                                form_data = form_data + '&proxy_dir=' + window.archimedes.proxy_dir;
                            }
                        }
                    }

                    // TODO CLEAN THE ERRORS FROM THE PREVIOUS RESPONSE

                    $.ajax({
                        url: post_url,
                        type: request_method,
                        data: form_data,
                        dataType: "json",
                        error: function () {
                            $("#save_checkout_delivery_form").removeClass('submitting');
                            $('#sc_checkout_button .button').removeClass('loading');
                            h.alert('<h2>Sorry</h2><div>An error occurred while trying to process your information.</div>');
                        }
                    }).done(function (response) {
                        // CHECK RESPONSE!!!
                        console.log(response);
                        if (!response.validated) {
                            $("#save_checkout_delivery_form").removeClass('submitting');
                            $('#sc_checkout_button .button').removeClass('loading');
                            $.each(response.errors, function (i, error) {
                                $('[name="' + error.required_field + '"]').closest('.form_row').addClass('error');
                            });
                            h.alert('<h2>Sorry</h2><div>Please fill in all the required fields and ensure your details are valid.</div>');
                            console.log(response);
                        } else {
                            window.location.href = (response.redirect_to) + (window.location.search.indexOf('_cmspreview=1') > 0 ? '&_cmspreview=1' : '');
                        }
                    });
                } else {
                    return false;
                }
            });
            if ($("#save_checkout_delivery_form #sc_next_step_button a").length) {
                $('body').removeClass('checkout_first_step checkout_third_step');
                $('body').addClass('checkout_second_step');
            }
        },


        stripe_checkout_payment_intent: function (stripeStyleOverride = "") {

            if ($('#stripe-card-button').length) {

                $('body').removeClass('checkout_first_step checkout_second_step');
                $('body').addClass('checkout_third_step');

                var stripe_publishable_key = $('#stripe_publishable_key').val()
                var connected_stripe_user_id = $('#connected_stripe_user_id').val()

                // Removing this because of the potential cloudflare caching issue below - var mm_post_code = $('#mm_post_code').val();
                var mm_post_code = false;
                if (window.cart.test_localstorage()) {
                    // Use localstorage stored billing postcode instead of the 'mm_post_code' field as it is more reliable if it exists. This avoids any issues of cached checkout screens, which is not usually possible but cloudflare may serve the last uncached page if it does not respond.
                    var localstorage_postcode = localStorage.getItem('cart_billing_postcode');
                    if (typeof localstorage_postcode != 'undefined') {
                        if (localstorage_postcode && localstorage_postcode != '' && localstorage_postcode != 'undefined' && localstorage_postcode != 'null') {
                            mm_post_code = localstorage_postcode;
                        }
                    }
                }

                if (connected_stripe_user_id) {
                    var stripe = Stripe(stripe_publishable_key, {stripeAccount: connected_stripe_user_id});
                } else {
                    var stripe = Stripe(stripe_publishable_key);
                }

                var elements = stripe.elements({
                    //fonts: [
                    //  {
                    //    cssSrc: 'https://fonts.googleapis.com/css?family=Source+Code+Pro',
                    //  },
                    //]
                });
                //var cardElement = elements.create('card');
                //cardElement.mount('#card-element');

                var cardholderName = $('#cardholder-name');
                 if(stripeStyleOverride!=''){
                    var elementStyles = stripeStyleOverride
                }else{
                     var elementStyles = {
                        base: {
                            color: '#333',
                            fontWeight: 500,
                            fontFamily: 'Arial, Sans-Serif',
                            fontSize: '13px',
                            fontSmoothing: 'antialiased',
                            '::placeholder': {
                                color: '#aaa',
                            },
                            ':-webkit-autofill': {
                                color: '#333',
                            },
                        },
                        invalid: {
                            color: '#E25950',
                            '::placeholder': {
                                color: '#FFCCA5',
                            },
                        },
                    };
                }


                var elementClasses = {
                    focus: 'focused',
                    empty: 'empty',
                    invalid: 'invalid',
                };

                var cardNumber = elements.create('cardNumber', {
                    style: elementStyles,
                    classes: elementClasses,
                });
                cardNumber.mount('#sc_stripe_card_number');

                var cardExpiry = elements.create('cardExpiry', {
                    style: elementStyles,
                    classes: elementClasses,
                });
                cardExpiry.mount('#sc_stripe_card_expiry');

                var cardCvc = elements.create('cardCvc', {
                    style: elementStyles,
                    classes: elementClasses,
                });
                cardCvc.mount('#sc_stripe_card_cvc');

                if ($('#sc_stripe_card_zip').length) {
                    if ($('.stripe_checkout_zip_code_disabled').length > 0 && mm_post_code && mm_post_code != '' && mm_post_code != 'undefined' && mm_post_code != 'null') {
                        var cardZip = elements.create('postalCode', {
                            style: elementStyles,
                            disabled: true,
                            value: mm_post_code,
                            classes: elementClasses,
                        });

                        $('.stripe_checkout_zip_code_disabled .overlay').click(function () {
                            var basket_url = window.location.pathname;
                            h.alert('<h2>Changing your payment address</h2> Your payment Postcode/ZIP must match your shipping address. If you need to change this, please go <a href="' + basket_url + '?checkout-step=2">back to the previous step</a>.');
                        });

                    } else {
                        var cardZip = elements.create('postalCode', {
                            style: elementStyles,
                            classes: elementClasses,
                        });
                        $('.stripe_checkout_zip_code_disabled .overlay').remove();
                        $('.stripe_checkout_zip_code_disabled').removeClass('stripe_checkout_zip_code_disabled');
                    }
                    cardZip.mount('#sc_stripe_card_zip');
                }

                //registerElements([cardNumber, cardExpiry, cardCvc], 'example2');


                $("#stripe-card-button").click(function () {

                    if (!$('#sc_checkout_payment_form').hasClass('submitting')) {
                        $('#sc_checkout_payment_form').addClass('submitting');
                        $("#stripe-card-button").parent().addClass('loading');
                        stripe.createPaymentMethod('card', cardNumber, {
                            billing_details: {
                                name: cardholderName.value
                            }
                        }).then(function (result) {
                            if (result.error) {
                                $('#sc_checkout_payment_form').removeClass('submitting');
                                $("#stripe-card-button").parent().removeClass('loading');
                                h.alert('<h2>Sorry</h2><div>' + result.error.message + '</div>');
                                // h.alert('<h2>Sorry</h2><div>An error occurred while processing your card details. Please try again or contact us for support.</div>');
                                // Show error in payment form
                            } else {
                                // Otherwise send paymentMethod.id to your server (see Step 2)

                                var payment_controller = $('#payment_controller').val()
                                if (!payment_controller) {
                                    payment_controller = '/cart/stripe_create_confirm_payment_intent/'
                                }

                                var request = $.ajax({
                                    url: payment_controller,
                                    type: "POST",
                                    data: {
                                        payment_method_id: result.paymentMethod.id,
                                        payment: JSON.stringify(result.paymentMethod),
                                        proxy_dir: (typeof window.archimedes != 'undefined' ? (typeof window.archimedes.proxy_dir != 'undefined' ? window.archimedes.proxy_dir : '') : ''),
                                        _cmspreview: (window.location.search.indexOf('_cmspreview=1') > 0 ? '1' : '')
                                    },
                                    dataType: "json",
                                    error: function () {
                                        $('#sc_checkout_payment_form').removeClass('submitting');
                                        $("#stripe-card-button").parent().removeClass('loading');
                                        h.alert('<h2>Sorry</h2><div>An error occurred while trying to process your payment information. Please check and try again or contact us for support. (Error code 2001)</div>');
                                    }
                                });

                                request.done(function (result) {
                                    handleServerResponse(result);
                                });
                            }
                        });
                    }
                    return false;
                });


                if ($('#stripe-payment-request-button').length && $('#stripe-payment-request-button').attr('data-currency-code') != '' && $('#stripe-payment-request-button').attr('data-order-total') != '') {
                    // ApplePay, GooglePay, MicrosoftPay methods
                    var paymentRequest = stripe.paymentRequest({
                        country: $('#stripe-payment-request-button').attr('data-stripe-locale'),
                        currency: $('#stripe-payment-request-button').attr('data-currency').toLowerCase(),
                        total: {
                            label: $('#stripe-payment-request-button').attr('data-payment-name'),
                            amount: parseInt($('#stripe-payment-request-button').attr('data-order-total')),
                        },
                        requestPayerName: true,
                        requestPayerEmail: true,
                    });
                    var prButton = elements.create('paymentRequestButton', {
                        paymentRequest: paymentRequest,
                    });
                    paymentRequest.canMakePayment().then(function (result) {
                        if (result && result.applePay) {
                            // Currently only enabled for Apple Pay
                            // Google/Microsoft pay also supported - for browser stored-card type payments
                            prButton.mount('#stripe-payment-request-button');
                            $('#sc_checkout_payment_methods_container').addClass('sc_multiple_methods');
                        } else {
                            $('#sc_stripe_request_payment_method_container').hide();
                        }
                    });

                    paymentRequest.on('paymentmethod', function (result) {

                        var payment_controller = $('#payment_controller').val()
                        if (!payment_controller) {
                            payment_controller = '/cart/stripe_create_confirm_payment_intent/'
                        }

                        var request = $.ajax({
                            url: payment_controller,
                            type: "POST",
                            data: {
                                payment_method_id: result.paymentMethod.id,
                                payment: JSON.stringify(result.paymentMethod),
                                proxy_dir: (typeof window.archimedes != 'undefined' ? (typeof window.archimedes.proxy_dir != 'undefined' ? window.archimedes.proxy_dir : '') : ''),
                                _cmspreview: (window.location.search.indexOf('_cmspreview=1') > 0 ? '1' : '')
                            },
                            dataType: "json",
                            error: function () {
                                $('#sc_checkout_payment_form').removeClass('submitting');
                                $("#stripe-card-button").parent().removeClass('loading');
                                h.alert('<h2>Sorry</h2><div>An error occurred while trying to process your payment information. Please check and try again or contact us for support. (Error code 2001)</div>');
                            }
                        });

                        request.done(function (result) {
                            handleServerResponse(result);
                        });

                    });
                }

                function handleServerResponse(response) {

                    if (response.error) {
                        if (response.redirect_to && typeof response.redirect_to != 'undefined') {
                            window.location.href = (response.redirect_to) + (window.location.search.indexOf('_cmspreview=1') > 0 ? '&_cmspreview=1' : '');
                        } else {
                            console.log(response);
                            if (response.message) {
                                var error_message = response.message
                            } else {
                                var error_message = (response.error_message_visual && typeof response.error_message_visual != 'undefined' ? response.error_message_visual : 'An error occurred while trying to process your payment information. Please check and try again or contact us for support. (Error code 2002');
                            }
                            $('#sc_checkout_payment_form').removeClass('submitting');
                            $("#stripe-card-button").parent().removeClass('loading');
                            h.alert('<h2>Sorry</h2><div>' + error_message + '</div>');
                        }
                    } else if (response.requires_action) {

                        // Use Stripe.js to handle required card action
                        stripe.handleCardAction(
                            response.payment_intent_client_secret
                        ).then(function (result) {
                            if (result.error) {

                                if (response.redirect_to && typeof response.redirect_to != 'undefined') {
                                    window.location.href = (response.redirect_to) + (window.location.search.indexOf('_cmspreview=1') > 0 ? '&_cmspreview=1' : '');
                                } else {

                                    // Show error in payment form
                                    console.log(result);
                                    if (response.message) {
                                        var error_message = response.message
                                    } else {
                                        var error_message = (response.error_message_visual && typeof response.error_message_visual != 'undefined' ? response.error_message_visual : 'An error occurred while trying to process your payment information. Please check and try again or contact us for support. (Error code 2002');
                                    }
                                    if (result.error && typeof result.error != 'undefined') {
                                        if (result.error.code && typeof result.error.code != 'undefined') {
                                            if (result.error.code == 'payment_intent_authentication_failure') {
                                                var error_message = 'The secondary security check for your payment method has failed. Please ensure the verification details are correct or contact your card provider for further support.'
                                            }
                                        }
                                    }

                                    $('#sc_checkout_payment_form').removeClass('submitting');
                                    $("#stripe-card-button").parent().removeClass('loading');
                                    h.alert('<h2>Sorry</h2><div>' + error_message + '</div>');
                                }
                            } else {
                                // The card action has been handled
                                // The PaymentIntent can be confirmed again on the server

                                var payment_controller = $('#payment_controller').val()
                                if (!payment_controller) {
                                    payment_controller = '/cart/stripe_create_confirm_payment_intent/'
                                }

                                var request = $.ajax({
                                    url: payment_controller,
                                    type: "POST",
                                    data: {
                                        payment_intent_id: result.paymentIntent.id,
                                        proxy_dir: (typeof window.archimedes != 'undefined' ? (typeof window.archimedes.proxy_dir != 'undefined' ? window.archimedes.proxy_dir : '') : ''),
                                        _cmspreview: (window.location.search.indexOf('_cmspreview=1') > 0 ? '1' : '')
                                    },
                                    dataType: "json",
                                    error: function () {
                                        $('#sc_checkout_payment_form').removeClass('submitting');
                                        $("#stripe-card-button").parent().removeClass('loading');
                                        h.alert('<h2>Sorry</h2><div>An error occurred while trying to process your payment information. Please check and try again or contact us for support. (Error code 2004)</div>');
                                    }
                                });

                                request.done(function (result) {
                                    handleServerResponse(result);
                                });
                            }
                        });
                    } else {
                        if (response.redirect_to && typeof response.redirect_to != 'undefined') {
                            window.location.href = (response.redirect_to) + (window.location.search.indexOf('_cmspreview=1') > 0 ? '&_cmspreview=1' : '');
                        } else {
                            console.log(response);
                            h.alert('<h2>Sorry</h2><div>An error occurred while trying to process your payment information. Please check and try again or contact us for support. (Error code 2005)</div>');
                        }
                    }
                }

            }
        },

        stripe_init_button: function () {
            $('#stripe_form').each(function () {
                window.cart.disable_checkout_button();
                $('.proceed_to_payment').addClass('loading').removeClass('placeholder');
                $('#stripe_loader').show();

                $.post('/cart/get_order_total/', function (order_total) {

                    $('#stripe_button_container')
                        .delay(400)
                        .queue(function () {
                            $('#stripe_button_container').html('');
                            var stripe_form = $("#stripe_form");
                            var stripe_key = $(stripe_form).attr('data-key');
                            var stripe_description = $(stripe_form).attr('data-description');
                            var stripe_checkout_icon = ($(stripe_form).attr('data-icon') && typeof $(stripe_form).attr('data-icon') != 'undefined' ? $(stripe_form).attr('data-icon') : '');
                            var stripe_name = $(stripe_form).attr('data-name');
                            var stripe_currency = $(stripe_form).attr('data-currency');
                            var stripe_bitcoin = $(stripe_form).attr('data-bitcoin');
                            var stripe_enable_shipping_address = $(stripe_form).attr('data-shipping-address');
                            var stripe_email = ($(stripe_form).attr('data-email') && typeof $(stripe_form).attr('data-email') != 'undefined' ? $(stripe_form).attr('data-email') : '');
                            var stripe_total = order_total.replace('.', '');

                            var script_tag = document.createElement('script');
                            script_tag.setAttribute('src', 'https://checkout.stripe.com/checkout.js');
                            script_tag.setAttribute('class', 'stripe-button');
                            script_tag.setAttribute('data-key', stripe_key);
                            script_tag.setAttribute('data-amount', stripe_total);
                            script_tag.setAttribute('data-name', stripe_name);
                            script_tag.setAttribute('data-currency', stripe_currency);
                            script_tag.setAttribute('data-description', stripe_description);
                            script_tag.setAttribute('data-bitcoin', stripe_bitcoin);
                            script_tag.setAttribute('data-billing-address', 'true');
                            script_tag.setAttribute('data-zip-code', 'true');
                            script_tag.setAttribute('data-locale', 'auto');

                            script_tag.setAttribute('data-shipping-address', stripe_enable_shipping_address);
                            script_tag.setAttribute('data-email', stripe_email);
                            script_tag.setAttribute('data-image', stripe_checkout_icon)

                            script_tag.setAttribute('data-allow-remember-me', 'true');
                            script_tag.setAttribute('data-label', 'Pay now');
                            document.getElementById('stripe_button_container').appendChild(script_tag);
                            $(this).dequeue();
                        })
                        .delay(400)
                        .queue(function () {
                            $('#stripe_loader').hide();
                            $('.proceed_to_payment').removeClass('loading');
                            // Check fields have been validated before making the button active
                            if (!$('#sc_checkout_button').hasClass('sc_fields_unconfirmed') && !$('#sc_checkout_button').hasClass('sc_shipping_unconfirmed') && !$('#sc_checkout_button').hasClass('sc_terms_unconfirmed')) {

                                $('.proceed_to_payment').addClass('active');
                            } else {
                                $('.proceed_to_payment').addClass('placeholder');
                            }
                            if (order_total <= 0) {
                                // If the total value of the transaction is 0, prevent the user getting to Stripe as the process will fail.
                                $('#stripe_button_container').html('');
                                h.alert("Transaction of value £0.00 cannot be completed.")
                            }
                            $(this).dequeue();
                        })
                    ;

                    //$('#stripe_form #stripe_button_container').html('<div><script src="https://checkout.stripe.com/checkout.js" class="stripe-button" data-key="' + stripe_key + '"data-amount="' + stripe_total + '"data-name="' + stripe_name + '"data-currency="' + stripe_currency + '"data-description="' + stripe_description + '"data-billing-address="true" data-shipping-address="true" data-label="Pay now" data-allow-remember-me="true"></script></div>');
                });
            });
        },


        // *******************
        // *******************
        //  WISHLIST SPECIFIC FUNCTIONS
        // *******************
        // *******************
        wishlist_summary: {

            init: function () {

                $('#wishlist_cart_widget').unbind().click(function () {
                    $(this).find('.wcw_checkout_link').trigger('click');
                })

                if ($('#wishlist_cart_widget').length > 0 || $('#wishlist_quick_cart_widget').length > 0) {
                    window.cart.wishlist_summary.widget_setup();
                    window.cart.wishlist_summary.quick_wishlist_cart_widget_setup();

                    if ($('#wishlist_cart_widget').hasClass('hide_when_empty')) {
                        $('#wishlist_cart_widget').hide();
                    }

                    if (window.cart.ticketing_enabled() && window.cart.test_localstorage()) {

                        $('#wishlist_quick_cart_widget').addClass('wqcw_initialised');

                        var total_count = '', sub_total = '', order_total = '';
                        if (typeof (Storage) !== "undefined" && localStorage.wishlist_active_timestamp && typeof localStorage.wishlist_active_timestamp != 'undefined') {

                            var cart_days_active = (parseInt(Date.now() - localStorage.getItem('wishlist_active_timestamp')) / (1000 * 60 * 60 * 24)); //milliseconds to days

                            //Get the cart summary info from localStorage
                            if (localStorage.cart_summary && typeof localStorage.cart_summary != 'undefined') {
                                if (localStorage.getItem('wishlist_summary') && typeof localStorage.getItem('wishlist_summary') != 'undefined') {
                                    var cart_summary = JSON.parse(localStorage.getItem('wishlist_summary'));
                                    var total_count = cart_summary.total_count && typeof cart_summary.total_count != 'undefined' ? cart_summary.total_count : '';
                                }
                            }
                        }

                        //Send values to visual update of cart.
                        window.cart.wishlist_summary.update(total_count);

                    } else {
                        //Standard cart summary check, using ajax calls
                        window.cart.wishlist_summary.get_summary($('#wishlist_quick_cart_widget').hasClass('wqcw_initialised') ? false : true);
                    }

                }

            },

            widget_setup: function () {
                if ($('#wishlist_cart_widget').hasClass('hide_when_empty')) {
                    $('#wishlist_cart_widget').hide();
                }
                if ($('#wishlist_quick_cart_widget').length > 0) {
                    $('#wishlist_cart_widget .wcw_checkout_link').unbind('click.wcw_basket_link').bind('click.wcw_basket_link', function () {
                        if (window.cart.ticketing_enabled()) {
                            window.cart.wishlist_summary.get_summary();
                        }
                        window.cart.wishlist_summary.quick_cart_widget_open();
                        return false;
                    });
                }
            },

            quick_wishlist_cart_widget_setup: function () {
                if ($('#wishlist_quick_cart_widget').length) {
                    $('#wishlist_quick_cart_widget #wqcw_close').unbind().click(function () {
                        window.cart.wishlist_summary.quick_wishlist_cart_widget_close();
                    });
                }
            },

            get_summary: function (quick_cart_auto_open, error_info) {
                quick_cart_auto_open = (typeof quick_cart_auto_open != 'undefined' ? quick_cart_auto_open : true);
                error_info = (typeof error_info != 'undefined' ? error_info : {});

                if ($('#wishlist_cart_widget').length > 0 || $('#wishlist_quick_cart_widget').length > 0) {
                    $.ajax({
                        type: "POST",
                        url: '/cart/get_wishlist_info/',
                        success: function (data) {
                            if ($('#wishlist_cart_widget').length) {
                                window.cart.wishlist_summary.update(data.count);
                            }
                            if ($('#wishlist_quick_cart_widget').length) {
                                var count = data.count && typeof data.count != 'undefined' ? data.count : 0;
                                if (count > 0) {
                                    $('#wishlist_quick_cart_widget').removeClass('wqcw_empty');
                                } else {
                                    $('#wishlist_quick_cart_widget').addClass('wqcw_empty');
                                }
                                $('#wishlist_quick_cart_widget #wqcw_item_count').html(count);
                                $('#wishlist_quick_cart_widget #wqcw_items').html(data.quick_cart_widget_html);
                                // Initialise cart functions
                                window.cart.remove_from_wishlist($('#wqcw_items .remove'), false);
                                window.cart.remove_all_wishlist_items($('#wqcw_remove_all'), false);
                                // Open the panel if the auto open setting is enabled
                                if (quick_cart_auto_open && $('#wishlist_quick_cart_widget').hasClass('wqcw_auto_open') && $('#wishlist_quick_cart_widget').hasClass('wqcw_initialised')) {
                                    if (error_info.errortype) {
                                        window.cart.wishlist_summary.quick_cart_widget_open(error_info.item_uid, error_info.errortype, error_info.errormsg);
                                    } else {
                                        window.cart.wishlist_summary.quick_cart_widget_open();
                                    }
                                }
                                if (!quick_cart_auto_open) {
                                    window.cart.wishlist_summary.quick_wishlist_cart_widget_open_callback();
                                }
                                // Add the initialised class to show this has finished loading for the first time
                                $('#wishlist_quick_cart_widget').addClass('wqcw_initialised');
                            }

                            var all_uids = [];
                            if (typeof data.cart_contents != 'undefined') {
                                var all_uids = Object.keys(data.cart_contents).map(function (key) {
                                    return key;
                                });
                                window.cart.update_wishlist_uids('replace', all_uids);
                            }

                            window.cart.set_cart_session_in_localstorage(data.cart_session);
                        },
                        dataType: 'json'
                    });
                }

            },

            update: function (total_count, action, uid) {
                // debugger;
                if ($('#wishlist_cart_widget').size() > 0) {

                    if (total_count < 1) {
                        $('#wishlist_cart_widget').addClass('empty');
                    } else {
                        $('#wishlist_cart_widget').removeClass('empty');
                        $('#wishlist_cart_widget').addClass('active');
                    }

                    if ($('#wishlist_cart_widget').hasClass('hide_when_empty') && total_count == 0) {
                        $('#wishlist_cart_widget').hide();
                    } else {
                        $('#wishlist_cart_widget').fadeOut('fast', function () {
                            $('.wcw_total_count').html(total_count);
                            $('#wishlist_cart_widget').fadeIn('fast');
                            // $('.scw_total_price_amount').html(sub_total);
                        });
                    }

                    if (window.cart.ticketing_enabled()) {
                        //Store cart summary info in local storage - ready for check on page init
                        if (window.cart.test_localstorage()) {
                            //Store cart summary info in local storage - ready for check on page init
                            var total_count = total_count && typeof total_count != 'undefined' ? total_count : '';

                            var cart_summary = {
                                total_count: total_count
                            };
                            localStorage.setItem('wishlist_summary', JSON.stringify(cart_summary));

                            if (uid && typeof uid != 'undefined') {
                                window.cart.update_wishlist_uids(action, uid);
                            }
                        }
                    }
                }
            },


            quick_cart_widget_open: function (item_uid, errortype, errormsg) {
                if (!($('#sc_contents_container').length || $('#sc_checkout_container').length)) {
                    var item_uid = item_uid && typeof item_uid != 'undefined' ? item_uid : false;
                    var errortype = errortype && typeof errortype != 'undefined' ? errortype : false;
                    var errormsg = errormsg && typeof errormsg != 'undefined' ? errormsg : '';

                    $('#wishlist_quick_cart_widget').addClass('active');
                    $('body').addClass('sc_wishlist_quick_cart_widget_active');
                    $('#wishlist_quick_cart_widget').clearQueue().delay(10).queue(function () {
                        $(this).addClass('animate').dequeue();
                        $('body').addClass('sc_wishlist_quick_cart_widget_animate');
                    });
                    if (errortype) {
                        if (errortype == 'max_qty' && item_uid) {
                            $('#wqcw_items_list li[data-uid="' + item_uid + '"]').addClass('wqcw_max_qty_error');
                            $('#wqcw_items_list li[data-uid="' + item_uid + '"] .wqcw_item_error').text(errormsg);
                        }
                    }
                    $('.notify_panel_mask').unbind('click.wishlist_panel').bind('click.wishlist_panel', function () {
                        if ($('#wishlist_quick_cart_widget').hasClass('active')) {
                            $('#wishlist_quick_cart_widget .notify_panel_close').trigger('click');
                        }
                    });
                    window.cart.wishlist_summary.quick_wishlist_cart_widget_open_callback();
                }
            },

            quick_wishlist_cart_widget_open_callback: function () {
                try {
                    h.accessibility.on_popup_opening('#wishlist_quick_cart_widget', false, '#wqcw_close');
                } catch (error) {

                }
            },

            quick_wishlist_cart_widget_close: function () {
                $('#wishlist_quick_cart_widget').removeClass('animate');
                $('body').removeClass('sc_wishlist_quick_cart_widget_animate');
                $('#wishlist_quick_cart_widget').clearQueue().delay(600).queue(function () {
                    $(this).removeClass('active').dequeue();
                    $('body').removeClass('sc_wishlist_quick_cart_widget_active');
                });
                window.cart.wishlist_summary.quick_wishlist_cart_widget_close_callback();
            },

            quick_wishlist_cart_widget_close_callback: function () {
                try {
                    h.accessibility.on_popup_closing();
                } catch (error) {

                }
            },

        },

        wishlist_forms: {

            init: function () {
                if ($('#wishlistEnquiryForm').length) {
                    $('#wishlist_enquiry_form_submit_button a').click(function () {
                        if (!$(this).closest('form').hasClass('wl_fields_unconfirmed')) {
                            $(this).closest('form').submit();
                        } else {
                            window.cart.wishlist_forms.wishlist_enquiry_fields(false, false, true);
                            h.alert('Please fill out all the required fields and ensure you have entered a valid phone number and email address.<br><br>The phone number must only include numbers and dashes.');
                        }
                    });
                    $('input, textarea', '#wishlistEnquiryForm')
                        .each(function () {
                            if ($(this).val() == '' && $(this).val() == $(this).attr('default-value')) {
                                $(this).addClass('sc_field_edited')
                            }
                        })
                        .focus(function () {
                            $(this).closest('.form_row').removeClass('sc_field_error error');
                        })
                        .bind('change', function (e) {
                            $(this).addClass('sc_field_edited');
                            window.cart.wishlist_forms.wishlist_enquiry_fields(false, $(this));
                        })
                    ;
                    window.cart.wishlist_forms.wishlist_enquiry_fields(true);

                }

            },

            wishlist_enquiry_fields: function (first_load, changed_field, all_fields) {
                if ($('#wishlistEnquiryForm').length) {
                    additional_fields_verified = true;
                    additional_fields_errors = [];
                    all_fields = all_fields && typeof all_fields != 'undefined' ? true : false;
                    $('#wishlistEnquiryForm').each(function () {
                        $('input, textarea', this).each(function () {
                            if ($(this).hasClass('requiredField')) {
                                if ($(this).hasClass('sc_field_edited') || all_fields) {
                                    if ($(this).val() == '' || $(this).val() == $(this).attr('default-value')) {
                                        additional_fields_errors.push($(this).attr('name'));
                                    }
                                }
                            }
                            if ($(this).attr('name') == 'f_email') {
                                if (!window.cart.validate_fields.email($(this).val())) {
                                    additional_fields_verified = false;
                                    if ($(this).hasClass('sc_field_edited') || all_fields) {
                                        additional_fields_errors.push($(this).attr('name'));
                                    }
                                }
                            }
                            if ($(this).attr('name') == 'f_phone') {
                                if (!window.cart.validate_fields.phone($(this).val())) {
                                    additional_fields_verified = false;
                                    if ($(this).hasClass('sc_field_edited') || all_fields) {
                                        additional_fields_errors.push($(this).attr('name'));
                                    }
                                }
                            }
                        });
                    })
                        .promise()
                        .done(function () {
                            if (additional_fields_verified && additional_fields_errors.length == 0) {
                                cart_user_email_has_changed = false;
                                $('#wishlistEnquiryForm').removeClass('wl_fields_unconfirmed');
                                $('input, textarea', '#wishlistEnquiryForm').removeClass('sc_field_error error');
                            } else {
                                $('#wishlistEnquiryForm').addClass('wl_fields_unconfirmed');
                                $('#wishlistEnquiryForm .form_row').removeClass('sc_field_error  error');
                                if (!first_load) {
                                    $.each(additional_fields_errors, function (index, field_name) {
                                        var associated_field = $('#wishlistEnquiryForm input[name="' + field_name + '"]');
                                        associated_field.closest('.form_row').addClass('sc_field_error error');
                                    });
                                }

                            }
                        });
                }
            }

        },

        update_wishlist_row: function (uid, total_count, forced) {
            var forced = forced && typeof forced != 'undefined' ? forced : false;

            $('.wishlist_button[data-uid="' + uid + '"]').each(function () {
                if (total_count > 0) {
                    $(this).addClass('active');
                } else {
                    var $that = $(this);
                    setTimeout(function () {
                        $that.removeClass('active');
                        if (!forced) {
                            $that.find('.add_to_wishlist').focus();
                        }
                    }, 150);
                }
                $('.store_item_remove_container', this).each(function () {
                    if (total_count > 0) {
                        $(this).delay(250).fadeIn();
                    } else {
                        $(this).fadeOut();
                    }
                });
                $('.store_item_total', this).each(function () {
                    $('.store_item_total_number', this).html(total_count);
                });
            });
        },

        update_wishlist_uids: function (action, uid) {
            if (window.cart.ticketing_enabled() && window.cart.test_localstorage()) {
                var uids_list = [];
                if (localStorage.getItem('wishlist_uids') && typeof localStorage.getItem('wishlist_uids') != 'undefined') {
                    var uids_list = JSON.parse(localStorage.getItem('wishlist_uids'));
                }
                if (action == 'add') {
                    uids_list.push(uid);
                } else if (action == 'remove') {
                    var index = uids_list.indexOf(uid);
                    if (index > -1) {
                        uids_list.splice(index, 1);
                    }
                } else if (action == 'replace') {
                    uids_list = uid;
                } else if (action == 'remove_all') {
                    uids_list = [];
                }
                localStorage.setItem('wishlist_uids', JSON.stringify(uids_list));
            }
        },

        remove_all_wishlist_items: function (remove_button, reload) {
            var item_uid;
            remove_button.unbind().click(function () {

                if ($(this).closest('.wishlist_button').size() > 0) {
                    parent_row = $(this).closest('.wishlist_button');
                } else if ($(this).closest('#wishlist_quick_cart_widget').size() > 0) {
                    parent_row = $('#wqcw_items');
                } else {
                    item_uid = $(this).attr('data-uid');
                    parent_row = false;
                }

                parent_row_delay = $(this).closest('#wishlist_quick_cart_widget').attr('data-remove-delay') ? $(this).closest('#wishlist_quick_cart_widget').attr('data-remove-delay') : false;

                $.post('/cart/remove_all_wishlist_items/', {}, function (obj) {
                    if (reload == 'reload') {
                        window.cart.wishlist_summary.update(obj.total_count, 'remove', obj.uid);
                        window.cart.update_wishlist_row(obj.uid, obj.item_count);
                        window.location.pathname = window.location.pathname;
                    } else {
                        remove_from_wishlist_after = function () {

                            var wishlist_uids = localStorage.getItem('wishlist_uids') ? JSON.parse(localStorage.getItem('wishlist_uids')) : false;
                            if (wishlist_uids && typeof wishlist_uids != 'undefined') {
                                $.each(wishlist_uids, function (i, uid) {
                                    window.cart.wishlist_summary.update(0, 'remove', uid);
                                    window.cart.update_wishlist_row(uid, 0, true);
                                });
                            }


                            localStorage.setItem('wishlist_uids', '');
                            window.cart.wishlist_summary.get_summary(false);
                        }

                        if (parent_row && parent_row_delay) {
                            $(parent_row)
                                .addClass('hide')
                                .delay(parseInt(parent_row_delay) / 2)
                                .queue(function () {
                                    remove_from_wishlist_after();
                                    $(this).dequeue();
                                    var instance = $(this);
                                    setTimeout(function () {
                                        instance.removeClass('hide')
                                    }, 500, instance);
                                })
                            ;
                        } else {
                            remove_from_wishlist_after();
                        }
                    }
                }, 'json');

                return false;
            });
        },

        remove_from_wishlist: function (remove_button, reload) {
            var item_uid;

            remove_button.unbind().click(function () {
                // $('body').delegate(remove_button.selector, 'click', function() {
                // $('body').off('click.remove_from_wl_'+remove_button.selector).on('click.remove_from_wl_'+remove_button.selector, remove_button.selector, function(event) {
                var element = $(event.target);

                // For accessibility - tracks which element to refocus on
                try {
                    h.accessibility.global_variables.element_to_refocus_to = element;
                } catch (error) {
                    console.error(error);
                }

                if (element.closest('.wishlist_button').size() > 0) {
                    item_uid = element.closest('.wishlist_button').attr('data-uid');
                    parent_row = element.closest('.wishlist_button');
                } else if (element.closest('.product_detail').size() > 0) {
                    item_uid = element.closest('.product_detail').attr('data-uid');
                    parent_row = element.closest('.product_detail');
                } else {
                    item_uid = element.attr('data-uid');
                    parent_row = false;
                }

                parent_row_delay = element.closest('#wishlist_quick_cart_widget').attr('data-remove-delay') ? element.closest('#wishlist_quick_cart_widget').attr('data-remove-delay') : false;

                $.post('/cart/remove_wishlist_item/', {'unique_id': item_uid}, function (obj) {
                    if (reload == 'reload') {
                        window.cart.wishlist_summary.update(obj.total_count, 'remove', obj.uid);
                        window.cart.update_wishlist_row(obj.uid, obj.item_count);
                        window.location.pathname = window.location.pathname;
                    } else {
                        remove_from_cart_after = function () {
                            window.cart.wishlist_summary.get_summary(false);
                            window.cart.wishlist_summary.update(obj.total_count, 'remove', obj.uid);
                            window.cart.update_wishlist_row(obj.uid, obj.item_count, true);
                        }
                        if (parent_row && parent_row_delay) {
                            $(parent_row)
                                .addClass('hide')
                                .delay(parent_row_delay)
                                .queue(function () {
                                    remove_from_cart_after();
                                    $(this).dequeue();
                                })
                            ;
                        } else {
                            remove_from_cart_after();
                        }
                    }
                }, 'json');

                return false;
            });
        },

        remove_from_wishlist_summary_page: function () {
            if ($('#wishlist_information .remove').length) {
                window.cart.remove_from_wishlist($('#wishlist_information .remove'), 'reload');
            }
        },
        enable_framing_option: function () {
            $(".item-without-extra").addClass("switch-on");
            //remove same item in the cart when click, for extra-option-page buttons only
            $(".extra-option-enabled .store_item_add_to_cart").click(function(){
                $('.store-item-switch:not(.switch-on) .store_item').each(function () {
                    $(this).find('.store_item_remove_from_cart').trigger('click');
                });
            })
            //class on / off in radio click
            $('.store-item-extras-radio').unbind().bind().change(function (event) {
                //current radio row index:
                click_index = $(this).parent().index()
                $(".store-item-extras-option").removeClass('active');
                $(this).parent().addClass('active');

                $(".item-with-extra").removeClass('active');
                $(".item-with-extra").removeClass('switch-on');
                $(".item-without-extra").hide();
                $(".item-without-extra").removeClass("switch-on");
                if ($(this).val() == 'no-frame') {
                    //for no-frame option
                    $(".item-without-extra").show();
                    $(".item-without-extra").addClass('switch-on')
                } else {
                    //for other option
                    //version 1:
                    //$(".store_item input[name=extras_option][value='"+$(this).val()+"']").parent().parent().addClass("active switch-on");
                    //version 2:
                    $(".store-item-switch").eq((click_index - 1)).addClass("active switch-on");
                }

            });

        }

    };

})(jQuery);


has_localstorage = false;
$(document).ready(function () {

    window.cart.init();

    // set TR with ID values based on index
    $('.product_detail').each(function () {
        $(this).attr('id', $(this).index() - 1);
    });

    // Change Quantity

    $('.qty').keyup(function () {
        var row_id = $(this).parent().parent().attr('id');
        var qty = $(this).val();
        $.post('/cart/qty/', {'row_id': row_id, 'qty_value': qty}, function (data) {
            update_cart_qty();
            if (parseInt(data) == 0) {
                $('#shopping_cart_container').html('<p>Your shopping basket empty.</p>');
            }
        });
        if (qty == 0) {
            $('#' + row_id).hide();
        }
    });

});


function update_cart_qty() {
    var count = 0
    $.post('/cart/count/', function (data) {
        $('.shopping_cart .items_count').html(data);
        count = data
    }, 'html');
    return parseInt(count)
}
