;
(function ($) {
    'use strict';
    $.drf.pagination.prototype.options.pagesTemplate = '<ul class="<%=extra.css.pages%>">' +
        '<% if (current > 1) { %>' +
        '<li class="<%=extra.css.targets.previous%>"><a href="#"><i class="fa fa-arrow-circle-o-left"></i></a></li>' +
        '<% } %>' +
        '<% for(var i = extra.pages.before; i > 0; i--) { %>' +
        '<% if ((current - i) < 1) { %>' +
        '<li class="paged-control"><i class="fa fa-dot-circle-o"></i></li>' +
        '<%} else {%>' +
        '<li class="<%=extra.css.targets.pageBefore%>" <%=extra.pages.attr%>="<%=current - i%>"><a href="#"><%=current - i%></a></li>' +
        '<% } %>' +
        '<% } %>' +

        '<li class="<%=extra.css.targets.pageCurrent%>"><a href="#"><%=current%></a></li>' +

        '<% for(var i = 1; i <= extra.pages.after; i++) { %>' +
        '<% if ((current + i) > total) { %>' +
        '<li class="paged-control"><i class="fa fa-dot-circle-o"></i></li>' +
        '<%} else {%>' +
        '<li class="<%=extra.css.targets.pageAfter%>" <%=extra.pages.attr%>="<%=current + i%>"><a href="#"><%=current + i%></a></li>' +
        '<% } %>' +
        '<% } %>' +
        '<% if (current < total) { %>' +
        '<li class="<%=extra.css.targets.next%>"><a href="#"><i class="fa fa-arrow-circle-o-right"></i></a></li>' +
        '<% } %>' +
        '</ul>';
    $.drf.pagination.prototype.options.pages = $.extend(true, $.drf.pagination.prototype.options.pages, { before: 2, after: 2});
})(jQuery);