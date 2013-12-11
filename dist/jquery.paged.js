/*
 *  jQuery Paged - v0.0.1
 *  JQuery plugin for paged output of data with extra goodies.
 *  https://github.com/dreef3/jquery-paged
 *
 *  Made by Andrey Ermakov
 *  Under Apache License
 */
;
(function ($, window, document, undefined) {
    var pluginName = "paged",
        defaults = {
            // Custom rendering function. Use this to substitute default Underscore template engine.
            render: null,
            // Default items section template. Anything passed either with data or from server is available here.
            template: "<ul><li>Nothing here yet</li></ul>",
            // Event handlers
            events: {
                // Called when both items and pagination are rendered
                afterRender: null,
                // Called before sending the AJAX request. JQuery.ajax() settings object is passed here.
                beforeLoad: null,
                // Called after the AJAX response is acquired. Passed data object with extras: currentPage, totalPages, isLastPage
                afterLoad: null,
                // Called in case of AJAX request failure. Error object is passed here.
                loadFail: null
            },
            // CSS targets to bind pagination events.
            targets: {
                // Previous button.
                previous: '.paged-previous',
                // Next button.
                next: '.paged-next',
                // Specific page. Note: page elements must contain data-page attribute with current page number.
                page: '.paged-page-before, .paged-page-after'
            },
            // Settings for JQuery.ajax().
            ajax: {
                // Underscore templating is available here with variables offset and limit.
                url: null,
                data: null
            },
            // Local data source. If set, would be used instead of AJAX. May be either array or contain 'root' element with name of array child.
            data: null,
            // Pagination settings.
            pages: {
                // Pages to display before current.
                before: 1,
                // Pages to display after current.
                after: 1,
                // Pagination template. Passed variables: current, pagesBefore, pagesAfter, isLast, totalPages
                template: "<ul class='paged-pager-list'>" +
                    "<% if (current > 1) { %>" +
                    "<li class='paged-previous paged-control'><a href='#'><i class='fa fa-long-arrow-left'></i></a></li>" +
                    "<% for(var i = pagesBefore; i > 0; i--) { %>" +
                    "<li class='paged-page-before' data-page='<%=current - i%>'><a href='#'><%=current - i%></a></li>" +
                    "<% } %>" +
                    "<% } else { %>" +
                    "<li class='paged-control'><a href='#'><i class='fa fa-dot-circle-o'></i></a></li>" +
                    "<% } %>" +
                    "<li class='paged-page-current'><a href='#'><%=current%></a></li>" +
                    "<% if (!isLast) { %>" +
                    "<% for(var i = 1; i <= pagesAfter; i++) { %>" +
                    "<li class='paged-page-after' data-page='<%=current + i%>'><a href='#'><%=current + i%></a></li>" +
                    "<% } %>" +
                    "<li class='paged-next paged-control'><a href='#'><i class='fa fa-long-arrow-right'></i></a></li>" +
                    "<% } else { %>" +
                    "<li class='paged-control'><a href='#'><i class='fa fa-dot-circle-o'></i></a></li>" +
                    "<% } %>" +
                    "</ul>",
                // Custom rendering function. Use this to substitute default Underscore template engine.
                render: null,
                // Custom element to hold pagination.
                el: null,
                // If no custom element set, position of pagination inside Paged container. Possible values: before, after.
                position: 'after'
            },
            // Items per page
            limit: 10,
            // First item number
            offset: 0,
            // Total amount of numbers. Can be passed in AJAX response in field 'total'. For local data source may be computed automatically.
            total: null
        }

    function Plugin(element, options) {
        this.element = element;
        this.$element = $(element);
        this.settings = $.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            if (!$.isFunction(this.settings.render)) {
                this.settings.render = null;
                if (typeof _ === 'undefined') {
                    throw new Error("Underscore was not found. Please include underscore.js OR provide a custom render function.");
                }
                else {
                    this._compiledTemplate = _.template(this.settings.template);
                }
            }

            this.$element.html('<div class="paged-items"></div>');
            this.$container = $('.paged-items', this.element);
            if (!this.settings.total && this.settings.data) {
                if (this.settings.data.root) {
                    this.settings.total = this.settings.data[this.settings.data.root].length;
                } else {
                    this.settings.total = this.settings.data.length;
                }
            }
            if (this.settings.total && this.settings.total > this.settings.limit) {
                this._initPager();
            } else {
                this.$pager = null;
            }

            if (!this.settings.data && !this.settings.ajax.url) {
                throw new Error('Neither data nor URL template weren\'t set!');
            } else if (this.settings.data && (!this.settings.data.root && !$.isArray(this.settings.data))) {
                throw new Error('Paginated data must be set as array.');
            } else if (this.settings.ajax.url) {
                this._compiledUrl = _.template(this.settings.ajax.url);
            }

            this.settings.offset -= this.settings.limit;
            this.go(1);
        },

        _initPager: function () {
            if (this.settings.pages.el) {
                this.$pager = $(this.settings.pages.el);
                this.$pager.each(function () {
                    $(this).addClass('.paged-pager');
                })
            } else {
                if (this.settings.pages.position === 'before') {
                    this.$element.prepend('<div class="paged-pager"></div>');
                } else if (this.settings.pages.position === 'after') {
                    this.$element.append('<div class="paged-pager"></div>');
                } else {
                    throw new Error('Invalid pagination position! Can be one of: before, after');
                }
                this.$pager = $('.paged-pager', this.element);
            }
            if (!$.isFunction(this.settings.pages.render)) {
                this.settings.pages.render = null;
                if (typeof _ === 'undefined') {
                    throw new Error("Underscore was not found. Please include underscore.js OR provide a custom pages.render function.");
                }
                else {
                    this._compiledPagerTemplate = _.template(this.settings.pages.template);
                }
            }
        },

        _evalPages: function (offset, limit, total) {
            if (!this.settings.total || total) {
                this.settings.total = total;
                this._totalPages = this.settings.total / this.settings.limit;
                if (this.settings.total % this.settings.limit > 0) {
                    this._totalPages++;
                }
            }

            this._currentPage = offset / limit + 1;
            this._isLastPage = offset + limit === this.settings.total;
        },

        _disableNavigation: function (disable) {
            if (this.$pager) {
                this.$pager.prop('disabled', disable);
            }
        },

        forward: function () {
            this.go(this._currentPage + 1);
        },

        go: function (page) {
            this.settings.offset = this.settings.limit * (page - 1);
            var limit = this.settings.limit;
            if (this.settings.total && this.settings.offset + limit > this.settings.total) {
                limit = this.settings.total - this.settings.offset;
            }

            if (this.settings.data) {
                this._load(this.settings.offset, limit)
            } else {
                this._loadRemote(this.settings.offset, limit)
            }
        },

        back: function () {
            this.go(this._currentPage - 1);
        },

        _load: function (offset, limit, data) {
            this._evalPages(offset, limit, data ? data['total'] : this.settings.total);
            if (!this.$pager && this.settings.total > this.settings.limit) {
                this._initPager();
            }

            var items = data;
            if (!items) {
                var key = this.settings.data.root;
                if (key) {
                    items = $.extend(true, {}, this.settings.data);
                    items[key] = this.settings.data[key].slice(offset, offset + limit);
                } else {
                    items = this.settings.data.slice(offset, offset + limit)
                }
            }
            this._render(items);
            this._renderPager();

            if ($.isFunction(this.settings.afterRender)) {
                this.settings.afterRender().call(this, this.element, data);
            }
        },

        _beforeLoad: function (data) {
            if ($.isFunction(this.settings.events.beforeLoad)) {
                this.settings.events.beforeLoad.call(this, data);
            }
        },

        _afterLoad: function (data) {
            if (this.settings.events.afterLoad) {
                this.settings.events.afterLoad.call(this, $.extend(true, {}, data, {
                    currentPage: this._currentPage,
                    totalPages: this._totalPages,
                    isLastPage: this._isLastPage
                }));
            }
        },

        _loadRemote: function (offset, limit) {
            this._disableNavigation(true);
            var url = this._compiledUrl({offset: offset, limit: limit});

            var ajaxSettings = $.extend(true, {}, this.settings.ajax, {
                url: this._compiledUrl(offset, limit),
                data: {
                    offset: offset,
                    limit: limit,
                    total: this.settings.total
                }
            });

            this._beforeLoad(ajaxSettings);
            $.ajax(ajaxSettings)
                .done((function onLoad(data) {
                    this._load(offset, limit, data);
                    this._afterLoad(data);
                    this._disableNavigation(false);
                }).bind(this))
                .fail((function onError(xhr, status, error) {
                    if ($.isFunction(this.settings.events.loadFail)) {
                        this.settings.events.loadFail.call(this, error);
                    }
                    console.log(error);
                }).bind(this));
        },

        _renderPager: function () {
            if (!this.$pager) {
                return;
            }

            var before = this.settings.pages.before;
            if (before > this._currentPage - 1) {
                before = this._currentPage - 1;
            }

            var after = this.settings.pages.after;
            if (after > this._totalPages - this._currentPage) {
                after = this._totalPages - this._currentPage;
            }


            var data = {
                current: this._currentPage,
                isLast: this._isLastPage,
                pagesBefore: before,
                pagesAfter: after,
                totalPages: this._totalPages
            }

            this.$pager.children().remove();
            if (this.settings.pages.render) {
                this.$pager.html(this.settings.pages.render.apply(this, [data]));
            } else {
                this.$pager.html(this._compiledPagerTemplate(data))
            }

            this._bindEvents();
        },

        _bindEvents: function () {
            var $this = this;
            if (this.settings.targets.next) {
                $(this.settings.targets.next, this.$pager.get()).each(function () {
                    $(this).click($this.forward.bind($this));
                });
            }

            if (this.settings.targets.previous) {
                $(this.settings.targets.previous, this.$pager.get()).each(function () {
                    $(this).click(function () {
                        $this.back();
                    })
                });
            }

            if (this.settings.targets.page) {
                $(this.settings.targets.page, this.$pager.get()).each(function () {
                    var el = $(this);
                    var page = el.attr('data-page');
                    if (page) {
                        el.click($this.go.bind($this, parseInt(page)));
                    }
                });
            }
        },

        _render: function (data) {
            this.$container.children().remove();

            if (this.settings.render) {
                this.$container.html(this.settings.render.apply(this, [data]));
            } else {
                this.$container.html(this._compiledTemplate(data))
            }
        }
    };

    $.fn[ pluginName ] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
