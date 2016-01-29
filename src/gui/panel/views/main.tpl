<div data-bind="attr: { id: module.id, name: module.name }, css: css" class="panel panel-default">
    <!-- Panel header -->
    <div class="panel-heading">
        <!-- Panel controls -->
        <div class="btn-group btn-group-xs pull-right" role="group">
            <!-- ko if: helpModel -->
            <button data-bind="attr: { title: helpButtonTitle, 'data-target': helpTarget }" type="button" class="btn btn-default" data-toggle="modal">
                <i class="fa fa-fw fa-question"></i>
            </button>
            <!-- /ko -->
            <div data-bind="attr: { title: toggleButtonTitle }" class="btn-group btn-group-xs" role="group">
                <button data-bind="attr: { 'data-target': toggleTarget }" type="button" class="btn btn-default" data-toggle="collapse">
                    <i data-bind="css: toggleButtonCss" class="fa fa-fw"></i>
                </button>
            </div>
        </div>
        <!-- Panel title -->
        <h3 class="panel-title">
            <i data-bind="visible: icon, css: iconCss" class="fa fa-fw"></i>
            <span data-bind="text: title"></span>
        </h3>
    </div>
    <!-- Panel content -->
    <div data-bind="
        template: {
            name: bodyView,
            data: bodyModel,
            afterRender: bodyModel.afterRender
        },
        attr: { id: bodyId },
        css: bodyCss,
        event: {
            'hidden.bs.collapse': onCompressPanel,
            'shown.bs.collapse' : onExpendPanel
        }" class="panel-body collapse"></div>
</div>
