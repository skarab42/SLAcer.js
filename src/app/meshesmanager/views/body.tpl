<!-- ko if: meshes().length -->
<ul class="files-list list-group" data-bind="foreach: { data:meshes, as: 'mesh'}">
    <li data-bind="css: mesh.css, event: { click: selectMesh }" class="list-group-item clearfix">
        <div class="mesh-info clearfix">
            <i data-bind="visible: !mesh.selected()" class="fa fa-fw fa-square-o"></i>
            <i data-bind="visible: mesh.selected" class="fa fa-fw fa-check-square-o"></i>
            <span data-bind="html: mesh.shortName, attr: { title: mesh.name }"></span>
        </div>
    </li>
</ul>
<!-- /ko -->
