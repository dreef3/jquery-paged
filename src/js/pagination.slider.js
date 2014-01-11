;
(function ($) {
    'use strict';
    $.drf.pagination.prototype.options.template =
        '<div class="<%=extra.css.items%>">' +
        '<img src="<%=data[current - 1][extra.pages.urlKey]%>"/>' +
        '</div>' +
        '<div class="<%=extra.css.pages%>"></div>';
    $.drf.pagination.prototype.options.pagesTemplate =
        '<ul class="<%=extra.css.pages%>-list <%=extra.pages.first ? extra.css.pages + \'-first\' : \'\'%> <%=extra.pages.last ? extra.css.pages + \'-last\' : \'\'%>">' +
            '<li class="<%=extra.css.targets.previous%> <%=extra.css.pages%>-control">' +
                '<a href="#"><i class="fa fa-arrow-circle-o-left"></i></a>' +
            '</li>' +

            '<% for(var i = extra.pages.before; i > 0; i--) { %>' +
            '<li class="<%=extra.css.targets.pageBefore%>" <%=extra.pages.attr%>="<%=current - i%>">' +
                '<a href="#"><img src="<%=data[current - i][extra.pages.thumbUrlKey]%>"/></a>' +
            '</li>' +
            '<% } %>' +

            '<li class="<%=extra.css.targets.pageCurrent%>">' +
            '   <img src="<%=data[current - 1][extra.pages.thumbUrlKey]%>"/>' +
            '</li>' +

            '<% for(var i = 1; i <= extra.pages.after; i++) { %>' +
            '<li class="<%=extra.css.targets.pageAfter%>" <%=extra.pages.attr%>="<%=current + i%>">' +
            '<a href="#"><img src="<%=data[current + i][extra.pages.thumbUrlKey]%>"/></a>' +
            '</li>' +
            '<% } %>' +

            '<li class="<%=extra.css.targets.next%> <%=extra.css.pages%>-control">' +
            '   <a href="#"><i class="fa fa-arrow-circle-o-right"></i></a>' +
            '</li>' +
        '</ul>';
    $.drf.pagination.prototype.options.pages = $.extend(true, $.drf.pagination.prototype.options.pages, {urlKey: 'image', thumbUrlKey: 'thumb'});
    $.drf.pagination.prototype.options.limit = 1;
})(jQuery);