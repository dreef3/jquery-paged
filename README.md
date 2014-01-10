JQuery Paged
============

JQuery plugin for paged output of data with extra goodies. Inspired by [CLNDR](https://github.com/kylestetz/CLNDR) JQuery plugin which uses the template approach to display calendar. Bootstrapped with [JQuery Boilerplate](https://github.com/jquery-boilerplate/jquery-boilerplate/).

Dependencies
------------

The required dependency is [JQuery](http://jquery.com/download/). Default pagination template uses [Font Awesome](http://fontawesome.io/icons/) arrows and [Underscore.js](http://underscorejs.org/#template) templates, but this can be altered.

Usage
============

First define a template for displaying your items:

```javascript
<script type="text/html" id="paged-items-template">
    <ul class="paged-items-list">
        <% _.each(items, function(item) { %>
            <li>
                <%=item.name%> - <%=item.time%>
            </li>
        <% }); %>
    </ul>
</script>
```

Next step is to call Paged on arbitrary element:

```javascript
<div id="#element"></div>
<script>
$(function () {
    $('#element').paged({
        ajax: {
            url: 'http://localhost:8282/booking/all/',
        },
        template: $('#paged-items-template').html()
    });
});
</script>
```

The plugin would perform a request to the server and display data using default pagination inside `#element` container.

Options
=======

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
        // Called after the AJAX response is acquired. Passed data object with extras:
        // currentPage, totalPages, isLastPage
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

Access instance methods
-----------------------

To manipulate with plugin's instance use the same approach as in JQuery UI widgets:

```javascript
var $el = $('#element');
el.paged({...});

// Move one page forward:
el.paged('forward');
// One back:
el.paged('back');
// To the first page:
el.paged('first');
// To the last one:
el.paged('last');
// To page with number 24:
el.paged('go', 24);
// Reload the current page contents:
el.paged('reload');
```

Alter rendering engine
----------------------

To achieve this you need to provide a custom rendering function:

```javascript
var precompiled = customTemplateEngine.template($('#paged-items-template').html());
var precompiledPagination = customTemplateEngine.template($('#paged-pagination-template').html());

$(function () {
    $('#element').paged({
        ajax: {
            url: 'http://localhost:8282/booking/all/',
        },
        render: function(data) {
            precompiled(data);
        },
        pages: {
            render: function(data) {
                precompiledPagination(data);
            }
        }
    });
});
```

Or you can pass a general templating function and two templates:

```javascript
var itemsTemplate = $('#paged-items-template').html();
var paginationTemplate = $('#paged-pagination-template').html();

$(function () {
    $('#element').paged({
        ajax: {
            url: 'http://localhost:8282/booking/all/',
        },
        // Must accepts two arguments: template, data
        render: customTemplateFunction,
        template: itemsTemplate,
        pages: {
            template: paginationTemplate
        }
    });
});
```

Design
======

Pagination
----------
Template has to contain a container with class defined in `$.paged.defaults.css.pages`.

If `$.paged.defaults.pages.lookup` is set to true and no such container was found then a lookup would be performed:
1. Lookup in the whole page.
2. If still wasn't found, append to the end of the template.

If container was found but empty (that is, doesn't contain any child elements, but may contain text), a default pagination
template would be inserted there.

Pagination events will be bound to elements inside the container with classes defined in `$.paged.defaults.css.targets`, if any.

How data is paginated
---------------------
The data may be either passed with `$.paged.defaults.data` or retrieved from remote source specified by `$.paged.defaults.url` (`$.paged.defaults.ajax.url`).

If no data source was set or it's failed to retrieve the data via AJAX, the container defined by `$.paged.defaults.css.error` will be shown.

Various cases how data would be handled once it's available:
1. Plain array: copied, sliced, passed wrapped in `$.paged.defaults.keys.array`.
2. Object. First searched for the array. Next the whole object would be copied and array property would be substituted with sliced copy.
2.2. Use a property with key `$.paged.defaults.keys.root` if it's an array.
2.3. If the value of property with key `$.paged.defaults.keys.root` isn't an array:
2.3.1. Use the value of `obj[obj[$.paged.defaults.keys.root]]` if it's present and contains the array.
2.3.2. Look up for a single array property and use it. If there's no such property or there's more than one of them, an error occurs (handled as above).

Most of the time you need to specify your data's root in `$.paged.defaults.keys.root` and that's it.

Limit, offset, total
--------------------
Each page contains a portion of data starting from `offset` with `limit` count.
These values are set as `$.paged.defaults.limit`, `$.paged.defaults.offset`.

Total amount of items may be set by several exclusive ways:
1. As `$.paged.defaults.total`.
2. In data object under key `$.paged.defaults.keys.total`.
3. Assumed from data source array size.

If it was set as plugin option and actual data source contains less items,
then the value will be corrected.

If it was set as a property of data object retrieved by AJAX and the size of array is
less than passed total amount of items, only `limit` count of items would be displayed
and a separate request would be performed for the each subsequent portion of items.

Changing options after initialization
-------------------------------------

