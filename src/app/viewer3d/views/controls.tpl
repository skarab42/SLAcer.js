<div class="btn-toolbar">
    <div data-bind="foreach: { data: views, as: 'view' }" class="btn-group btn-group-xs">
        <button data-bind="value: view.name, attr: { title: view.title }, event: { click: $parent.viewSelected }" type="button" class="btn btn-default">
            <!-- ko ifnot: view.icon -->
            <span data-bind="html: view.title"></span>
            <!-- /ko -->
            <!-- ko if: view.icon -->
            <i data-bind="css: view.icon"></i>
            <!-- /ko -->
        </button>
    </div>
</div>
