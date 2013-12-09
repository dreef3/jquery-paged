/*
 *  jQuery Boilerplate - v3.3.1
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
;
(function ($, window, document, undefined) {
    var pluginName = "paged",
        defaults = {
            render: null,
            _renderPager: null,
            template: "<ul><li>Nothing here yet</li></ul>",
            pagerTemplate: "<ul>" +
                "<% if (page > 1) { %>" +
                "<li><a href='#' class='paged-previous'><=</a></li>" +
                "<% for(var i = pagesBefore; i > 0; i--) { %>" +
                "<li><a href='#' class='paged-page-before' data-page='<%=page - i%>'><%=page - i%></a></li>" +
                "<% } %>" +
                "<% } %>" +
                "<li><a href='#' class='paged-current'><%=page%></a></li>" +
                "<% if (!isLast) { %>" +
                "<% for(var i = 1; i <= pagesAfter; i++) { %>" +
                "<li><a href='#' class='paged-page-after' data-page='<%=page + i%>'><%=page + i%></a></li>" +
                "<% } %>" +
                "<li><a href='#' class='paged-next'>=></a></li>" +
                "<% } %>" +
                "</ul>",
            events: {
                ready: null,
                afterRender: null,
                _load: null
            },
            targets: {
                previous: '.paged-previous',
                next: '.paged-next',
                page: '.paged-page-before, .paged-page-after'
            },
            url: null,
            ajax: {
            },
            pages: {
                before: 1,
                after: 1
            },
            limit: 10,
            offset: 0,
            total: 100,
            totalField: 'total'
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

            if (!$.isFunction(this.settings._renderPager)) {
                this.settings._renderPager = null;
                if (typeof _ === 'undefined') {
                    throw new Error("Underscore was not found. Please include underscore.js OR provide a custom render function.");
                }
                else {
                    this._compiledPagerTemplate = _.template(this.settings.pagerTemplate);
                }
            }

            this.$element.html('<div class="paged"><div class="paged-items"></div><div class="paged-pager"></div></div>');
            this.$container = $('.paged-items', this.element);
            this.$pager = $('.paged-pager', this.element);

            if (!this.settings.url) {
                throw new Error('URL template was not set');
            } else {
                this._compiledUrl = _.template(this.settings.url);
            }

            if (this.settings.total) {
                this._evalTotalPages();
            }

            this.settings.offset -= this.settings.limit;
            this.forward();
        },

        _evalTotalPages: function () {
            this._totalPages = this.settings.total / this.settings.limit;
            if (this.settings.total % this.settings.limit > 0) {
                this._totalPages++;
            }
        },

        forward: function () {
            this.settings.offset += this.settings.limit;
            var limit = this.settings.limit;
            if (this.settings.offset + limit > this.settings.total) {
                limit = this.settings.total - this.settings.offset;
            }

            this._load(this.settings.offset, limit)
        },

        go: function (page) {
            this.settings.offset = this.settings.limit * (page - 1);
            var limit = this.settings.limit;
            if (this.settings.offset + limit > this.settings.total) {
                limit = this.settings.total - this.settings.offset;
            }
            this._load(this.settings.offset, limit)
        },

        back: function () {
            this.settings.offset -= this.settings.limit;
            this._load(this.settings.offset, this.settings.limit);
        },

        _load: function (offset, limit) {
            var url = this._compiledUrl({offset: offset, limit: limit});

            var ajaxSettings = $.extend(true, {}, this.settings.ajax, {
                url: url,
                offset: offset,
                limit: limit,
                total: this.settings.total
            });
            $.ajax(ajaxSettings)
                .done((function onLoad(data, status, xhr) {
                    if (this.settings.events.load) {
                        this.settings.events.load(data);
                    }

                    if (!this.settings.total || data[this.settings.totalField]) {
                        this.settings.total = data[this.settings.totalField];
                        this._evalTotalPages();
                    }

                    this._currentPage = offset / limit + 1;
                    this._isLastPage = offset + limit === this.settings.total;

                    this._render(data);

                    this._renderPager();

                    if (this.settings.afterRender) {
                        this.settings.afterRender().call(this, this.element, data);
                    }
                }).bind(this))
                .fail((function onError(xhr, status, error) {
                    console.log(error);
                }).bind(this));
        },

        _renderPager: function () {
            var before = this.settings.pages.before;
            if (before > this._currentPage - 1) {
                before = this._currentPage - 1;
            }

            var after = this.settings.pages.after;
            if (after > this._totalPages - this._currentPage) {
                after = this._totalPages - this._currentPage;
            }


            var data = {
                page: this._currentPage,
                isLast: this._isLastPage,
                pagesBefore: before,
                pagesAfter: after
            }

            this.$pager.children().remove();
            if (this.settings._renderPager) {
                this.$pager.html(this.settings._renderPager.apply(this, [data]));
            } else {
                this.$pager.html(this._compiledPagerTemplate(data))
            }

            this._bindEvents();
        },

        _bindEvents: function () {
            var $this = this;
            if (this.settings.targets.next) {
                $(this.settings.targets.next, this.$pager.get()).each(function () {
                    $(this).click(function () {
                        $this.forward();
                    })
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
                        $(this).click(function () {
                            $this.go(page);
                        });
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
