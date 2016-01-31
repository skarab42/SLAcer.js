<div class="btn-group">
    <span type="button" class="file-input btn btn-default">
        <i class="fa fa-fw fa-plus"></i>
        <span data-bind="html:fileInput.title"></span>
        <input data-bind="value: fileInput.value, event: { change: fileInput.change }" type="file" multiple="multiple" />
    </span>
</div>
<!-- ko if: files().length -->
<ul class="files-list list-group" data-bind="foreach: { data:files, as: 'file'}">
    <li data-bind="css: file.css, event: { click: setCurrentFile }" class="list-group-item clearfix">

        <div class="file-info">
            <span class="label label-warning">
                <span data-bind="html: file.type">n/a</span>
            </span>
            <span data-bind="html: file.shortName, attr: { title: file.name }"></span>

            <span class="label label-default pull-right">
                <span data-bind="html: file.status">n/a</span>
                <!-- ko if: file.progressBar -->
                : <span data-bind="html: file.progressPercent">0%</span>
                <!-- /ko -->
            </span>
            <span class="label label-success pull-right">
                <span data-bind="html: file.size">n/a</span>
            </span>
            <!-- ko if: file.facesCount -->
            <span class="label label-info pull-right">
                F : <span data-bind="html: file.facesCount">n/a</span>
            </span>
            <!-- /ko -->
        </div>

        <!-- ko if: file.progressBar -->
        <div class="progress">
            <div data-bind="style: { width: file.progressPercent }, css: file.progressBarCss" class="progress-bar">
                <span data-bind="html: file.progressPercent">0%</span>
            </div>
        </div>
        <!-- /ko -->

    </li>
</ul>
<!-- /ko -->
