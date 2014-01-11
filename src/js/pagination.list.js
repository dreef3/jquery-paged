;
(function ($) {
    'use strict';
    $.drf.pagination.prototype.options.pagesTemplate =
        '<ul class="<%=extra.css.pages%>-list <%=extra.pages.first ? extra.css.pages + \'-first\' : \'\'%> <%=extra.pages.last ? extra.css.pages + \'-last\' : \'\'%>">' +
        '<li class="<%=extra.css.targets.previous%> <%=extra.css.pages%>-control"><a href="#"><i class="fa fa-arrow-circle-o-left"></i></a></li>' +

        '<% for(var i = extra.pages.before; i > 0; i--) { %>' +
        '<li class="<%=extra.css.targets.pageBefore%>" <%=extra.pages.attr%>="<%=current - i%>"><a href="#"><%=current - i%></a></li>' +
        '<% } %>' +

        '<li class="<%=extra.css.targets.pageCurrent%>"><%=current%></li>' +

        '<% for(var i = 1; i <= extra.pages.after; i++) { %>' +
        '<li class="<%=extra.css.targets.pageAfter%>" <%=extra.pages.attr%>="<%=current + i%>"><a href="#"><%=current + i%></a></li>' +
        '<% } %>' +

        '<li class="<%=extra.css.targets.next%> <%=extra.css.pages%>-control"><a href="#"><i class="fa fa-arrow-circle-o-right"></i></a></li>' +
        '</ul>';
})(jQuery);