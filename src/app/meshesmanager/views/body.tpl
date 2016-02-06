<div class="btn-group">
    <button data-bind="event: { click: splitButton.click }" type="button" class="btn btn-info">
        <i class="fa fa-fw fa-scissors"></i>
        <span data-bind="html: splitButton.label"></span>
    </button>
    <button data-bind="event: { click: dropButton.click }" type="button" class="btn btn-info">
        <i class="fa fa-fw fa-tint"></i>
        <span data-bind="html: dropButton.label"></span>
    </button>
</div>
<!-- ko if: meshes().length -->
<ul class="files-list list-group" data-bind="foreach: { data:meshes, as: 'mesh'}">
    <li data-bind="css: mesh.css, event: { click: selectMesh }" class="list-group-item clearfix">
        <div class="mesh-info clearfix">
            <i data-bind="visible: !mesh.selected()" class="fa fa-fw fa-square-o"></i>
            <i data-bind="visible: mesh.selected" class="fa fa-fw fa-check-square-o"></i>
            <span data-bind="html: mesh.shortName, attr: { title: mesh.name }"></span>
            <span class="label label-info pull-right">
                F : <span data-bind="html: mesh.facesCount">n/a</span>
            </span>
        </div>
    </li>
</ul>
<!-- /ko -->
