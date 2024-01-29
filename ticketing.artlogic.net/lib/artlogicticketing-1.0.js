"use strict";
(function($) {

    window.ticketing = {

        // docs: https://docs.artlogic.net/developer_docs/misc/Artlogic-Ticketing/

        base_url: 'https://ticketing.artlogic.net/',
        storage: {},
        storage_key: 'ticketing_uid', // temporary - replaced in set_base_url
        failsafe: true,
        repeat_click_limit: 2, // in seconds

        init: function() {
            this._test_localstorage();
        },

        add_to_pool: function(on_success, on_failure) {
            if (this._waiting && this.repeat_click_limit > 0) {
                return;
            }
            this._waiting = true;
            window.setTimeout(function() {
                window.ticketing._waiting = false;
            }, 1000 * this.repeat_click_limit);
            var url = this.base_url;
            var data = {uid: this.get_uid()};
            $.get(url, data, function(data) {
                if (data.uid) {
                    window.ticketing.store(window.ticketing.storage_key, data.uid);
                }
                if (data.room_in_pool || data.added_to_pool || data.in_pool) {
                    return on_success(data.uid);
                } else {
                    return on_failure(data.uid);
                }
            })
            .fail(function() {
                // failsafe!
                if (window.ticketing.failsafe) {
                    return on_success();
                }
            });
        },

        remove_from_pool: function() {
            if (this.get_uid()) {
                var url = this.base_url;
                var data = {remove: this.get_uid()};
                $.get(url, data, function(data) {
                    console.log(data);
                    window.ticketing.remove_from_store(window.ticketing.storage_key)
                })
            }
        },

        set_base_url: function(base_url) {
            this.base_url = base_url;
            this.storage_key = base_url.replace('https://', '')
                .split('.').join('-').split('/').join('-')
                .split('--').join('-');
        },

        get_uid: function() {
            return this.get(window.ticketing.storage_key) || '';
        },

        get_url: function(path) {
            if (path.indexOf('/') != 0) {
                path = '/' + path;
            }
            return this.base_url + path;
        },

        store: function(k, v) {
            // store in localstorage (for all pages) or in this page's js
            // if localstorage is not supported
            if (this.has_local_storage) {
                localStorage.setItem(k, v);
            } else {
                this.storage[k] = v;
            }
        },

        get: function(k) {
            // store in localstorage (for all pages) or in this page's js
            // if localstorage is not supported
            if (this.has_local_storage) {
                return localStorage.getItem(k);
            } else {
                return this.storage[k];
            }
        },

        remove_from_store: function(k) {
            // remove from localStorage
            if (this.has_local_storage) {
                localStorage.removeItem(k);
            } else {
                delete this.storage[k];
            }
        },

        _test_localstorage: function() {
            if (window.ticketing.has_local_storage) {
                return window.ticketing.has_local_storage;
            }
            try {
                localStorage.setItem('_', '_');
                localStorage.removeItem('_');
                window.ticketing.has_local_storage = true;
            } catch(e) {
                window.ticketing.has_local_storage = false;
            }
            return window.ticketing.has_local_storage;
        }

    }

    $(document).ready(function() {
        window.ticketing.init();
    });

})(jQuery);
