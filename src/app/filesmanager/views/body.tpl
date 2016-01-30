<div class="btn-group">
    <span type="button" class="file-input btn btn-default">
        <i class="fa fa-fw fa-plus"></i>
        <span data-bind="html:fileInputTitle"></span>
        <input data-bind="event: {change: fileSelect}" type="file" multiple="multiple" />
    </span>
</div>
<!-- ko if: files().length -->
<ul class="files-list list-group" data-bind="foreach: { data:files, as: 'file'}">
    <li data-bind="css: file.css" class="list-group-item">

        <div class="file-info">
            <span class="label label-info">
                <span data-bind="html: file.type">n/a</span>
            </span>
            <span data-bind="html: file.name"></span>

            <span class="label label-default pull-right">
                <span data-bind="html: file.status">n/a</span>
                <!-- ko if: file.progressBar -->
                : <span data-bind="html: file.progressPercent">0%</span>
                <!-- /ko -->
            </span>
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
