<div data-bind="attr: { id: module.id, name: module.name }, css: css" class="panel panel-default">
    <!-- Panel header -->
    <div class="panel-heading">
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
