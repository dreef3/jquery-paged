;
(function ($) {
    'use strict';
    $.widget('drf.pagination', {
        options: {
            page: 1,
            limit: 10,
            offset: 0,
            total: null,
            template: null,
            pagesTemplate: null,
            url: null,
            data: null,
            pages: {
                attr: 'data-page',
                total: 5
            },
            css: {
                items: 'pg-items',
                pages: 'pg-pager',
                targets: {
                    previous: 'pg-previous',
                    next: 'pg-next',
                    pageBefore: 'pg-page-before',
                    pageAfter: 'pg-page-after',
                    pageCurrent: 'pg-page-current'
                }
            },
            keys: {
                array: 'data',
                root: 'root',
                total: 'total',
                limit: 'limit',
                offset: 'offset',
                totalPages: 'total',
                currentPage: 'current',
                templateExtra: 'extra'
            },

            // Callbacks
            load: null,
            paginated: null,
            render: null,
            ajax: null
        },

        // JQUERY UI WIDGET OVERRIDES
        _create: function () {
            this._initComplete = false;
            this._setOptions(this.options);
            this._initComplete = true;
        },

        _setTemplate: function (option) {
            var key = '_' + option;
            if ($.isFunction(this.options[option])) {
                this[key] = this.options[option];
            } else if (this.options[option]) {
                if (_ === undefined) {
                    throw new Error('Underscore.js wasn\'t found. It\'s a default template engine');
                }
                this[key] = _.template(this.options[option]);
            }
        },

        _setTotal: function () {
            var tk = this.options.keys.total;
            var ak = this.options.keys.array;
            this._total = this.options.total;
            if (this._data) {
                if (this._total && this._data[ak].length < this._total) {
                    this._total = this._data[ak].length;
                } else if (this._data[tk]) {
                    this._total = this._data[tk];
                } else {
                    this._total = this._data[ak].length;
                }
            }
        },

        _setPage: function () {
            if (!this._total) {
                // First time, nothing was set yet.
                this._limit = limit;
                this._offset = offset;
                return;
            }

            var page = this.options.page;
            var limit = this.options.limit;
            var startOffset = this.options.offset;
            var offset = startOffset + limit * (page - 1);

            if (this._total > offset) {
                if (this._total < offset + limit) {
                    limit = this._total - offset;
                }
                this._currentPage = page;
                this._totalPages = Math.floor(this._total / this._limit);
                if (this._total % this._limit > 0) {
                    this._totalPages++;
                }
                if (this.options.pages.total > this._totalPages) {
                    this.options.pages.total = this._totalPages;
                }
                this._limit = limit;
                this._offset = offset;
            }
        },

        _setDataSource: function (loadFn) {
            this._reset();
            this._load = loadFn;
            if (this._initComplete) {
                this._load();
            }
        },

        _validateOption: function (key, value) {
            var valid = true;
            switch (key) {
                case 'limit':
                case 'offset':
                case 'total':
                    valid = $.isNumeric(value) && value > 0;
                    break;
                case 'page':
                    if (this._totalPages) {
                        valid = $.isNumeric(value) && value > 0 && value <= this._totalPages;
                    }
                    break;
                case 'template':
                    valid = !!value;
                    if (!valid) {
                        throw new Error('Template wasn\'t set!');
                    }
                    break;
            }
            return valid;
        },

        _setOption: function (key, value) {
            if (!this._validateOption(key, value)) {
                return;
            }
            this._super(key, value);
            switch (key) {
                case 'template':
                    this._setTemplate('template');
                    break;
                case 'pagesTemplate':
                    this._setTemplate('pagesTemplate');
                    break;
                case 'page':
                    this._setPage();
                    break;
                case 'limit':
                case 'offset':
                    this._setPage();
                    break;
                case 'total':
                    this._setTotal();
                    break;
                case 'url':
                    this._setDataSource(this._loadRemote);
                    break;
                case 'data':
                    if (value !== null) {
                        this._setDataSource(this._loadLocal);
                    }
                    break;
            }
        },

        _setOptions: function (options) {
            this._super(options);
            this.refresh();
        },

        _reset: function () {
            this._data = null;
            this._currentData = null;
            this._total = null;
        },

        _destroy: function () {

        },

        // PRIVATE

        _loadLocal: function () {
            this._saveData(this.options.data);
            this.refresh();
        },

        _loadRemote: function () {
            var params = {
                url: this.options.url,
                type: 'POST',
                dataType: 'json',
                data: {}
            };
            params.data[this.options.keys.offset] = this._offset;
            params.data[this.options.keys.limit] = this._limit;
            // Let user to change the ajax params before request
            this._trigger('ajax', null, params);

            var $this = this;
            $.ajax(params).done(function (response) {
                $this._trigger('load', null, response);
                $this._saveData(response);
                $this.refresh();

            }).fail(function () {
                // TODO Not implemented yet.
            });
        },

        _setCurrentData: function () {
            var ak = this.options.keys.array;
            var items = this._data ? this._data[ak] : null;

            this._setTotal();
            this._setPage();
            if (!items || items.length < this._offset) {
                this._load();
                return false;
            } else {
                // TODO Don't copy array property
                this._currentData = $.extend(true, {}, this._data);
                this._currentData[ak] = items.slice(this._offset, this._offset + this._limit);
                this._setPaginationData(this._currentData);
            }

            // Let user change the data before rendering
            this._trigger('paginated', null,  this._currentData);
            return true;
        },

        _setPaginationData: function (data) {
            data[this.options.keys.currentPage] = this._currentPage;
            data[this.options.keys.totalPages] = this._totalPages;
            data[this.options.keys.templateExtra] = {
                pages: this.options.pages,
                css: this.options.css
            };

            var p = data[this.options.keys.templateExtra].pages;
            p.before = Math.floor(p.total / 2);
            if (this._currentPage - p.before <= 0) {
                p.before = this._currentPage - 1;
            }
            p.after = p.total - p.before - 1;
            if (this._totalPages - this._currentPage < p.after) {
                p.after = this._totalPages - this._currentPage;
            }
            if (p.after + p.before + 1 < p.total) {
                p.before = p.total - p.after - 1;
            }
            p.first = this._currentPage === 1;
            p.last = this._currentPage === this._totalPages;
        },

        _createTargets: function () {
            var targets = {};
            targets[this.options.css.targets.previous] = this.previous;
            targets[this.options.css.targets.next] = this.next;
            targets[this.options.css.targets.pageBefore] = this.go;
            targets[this.options.css.targets.pageAfter] = this.go;
            return targets;
        },

        _bindTargets: function () {
            var targets = this._createTargets();
            var $this = this;
            $.each(targets, function (t, fn) {
                $('.' + t).each(function () {
                    var $el = $(this);
                    $el.click(fn.bind($this, $el.attr($this.options.pages.attr)));
                });
            });
        },

        _saveData: function (rawData) {
            if ($.isArray(rawData)) {
                this._saveArray(rawData);
            } else {
                var key = this.options.keys.array;
                if (rawData && this._data &&
                    $.isArray(rawData[key]) &&
                    $.isArray(this._data[key])) {
                    this._saveToExisting(rawData);
                } else {
                    this._saveNewObject(rawData);
                }
            }
        },

        _saveToExisting: function (rawData) {
            var k = this.options.keys.array;
            var ok = this.options.keys.offset;
            var lk = this.options.keys.limit;
            var limit = this._limit;
            if ($.isNumeric(rawData[lk])) {
                limit = parseInt(rawData[lk], 10);
            }
            var offset = this._offset;
            if ($.isNumeric(rawData[ok])) {
                offset = parseInt(rawData[ok], 10);
            }

            var args = [offset, limit].concat(rawData[k]);
            Array.prototype.splice.apply(this._data[k], args);
        },

        _saveArray: function (rawData) {
            var ak = this.options.keys.array;
            this._data = this._data || {};
            this._data[ak] = this._data[ak] || [];
            for (var i = 0; i < rawData.length; i++) {
                this._data[ak].push(rawData[i]);
            }
        },

        _saveNewObject: function (rawData) {
            var rk = this.options.keys.root;
            var key = null;
            if ($.isArray(rawData[rk])) {
                key = rk;
            } else if (typeof rawData[rk] === 'string' && $.isArray(rawData[rawData[rk]])) {
                key = rawData[rk];
            } else {
                $.each(rawData, function (k, v) {
                    if (key) {
                        key = null;
                        return false;
                    } else if ($.isArray(v)) {
                        key = k;
                    }
                    return true;
                });
            }

            if (key) {
                this.options.keys.array = key;
                this._data = $.extend(true, {}, rawData);
            } else {
                // TODO Handle error.
            }
        },

        // PUBLIC
        go: function (pageIndex) {
            this._setOption('page', parseInt(pageIndex));
            this.refresh();
        },

        forward: function () {
            this.go(this._currentPage + 1);
        },

        back: function () {
            this.go(this._currentPage - 1);
        },

        previous: function () {
            this.back();
        },

        next: function () {
            this.forward();
        },

        refresh: function () {
            if (this._setCurrentData()) {
                this.element.html(this._template(this._currentData));
                var $this = this;

                if (this._pagesTemplate) {
                    this.element.find('.' + this.options.css.pages).each(function () {
                        $(this).html($this._pagesTemplate($this._currentData));
                    });
                }
                this._bindTargets();

                this._trigger('render', null, {element: this.element, data: $.extend(true, {}, this._currentData)});
            }
        }
    });
})(jQuery);
