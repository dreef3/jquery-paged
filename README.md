JQuery Paged
============

JQuery plugin for paged output of data with extra goodies

Inspiration
-----------

Inspired by [CLNDR](https://github.com/kylestetz/CLNDR) JQuery plugin which uses the template approach to display calendar. Bootstrapped with [JQuery Boilerplate](https://github.com/jquery-boilerplate/jquery-boilerplate/).

Options
-------

A variety of default options is available:

```javascript
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
```