<div data-bind="css: modalCss, attr: {id: id}" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button data-bind="attr: {title: closeButtonText}" type="button" class="close" data-dismiss="modal">
                    <i class="fa fa-fw fa-close"></i>
                </button>
                <h4 class="modal-title">
                    <i data-bind="visible: icon, css: iconCss" class="fa fa-fw fa-lg"></i>
                    <span data-bind="text: title"></span>
                </h4>
            </div>
            <div data-bind="template: {name: bodyView}" class="modal-body"></div>
        </div>
    </div>
</div>
