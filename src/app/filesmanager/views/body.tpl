<div class="input-group">
    <input type="text" class="form-control" for="input-file" />
    <div class="input-group-btn">
        <button id="fileSelect" type="button" class="beautifile btn btn-default"
                data-bind="event: { fileselect: fileSelect }"
                data-input="input-file"
                data-type="primary"
                data-multiple="true">browse...</button>
        <button data-bind="click: loadFile" type="button" class="btn btn-success">
            <span class="fa fa-fw fa-upload"></span> load
        </button>
    </div>
</div>
<!-- ko if: files().length -->
<br />
<ul class="list-group" data-bind="foreach: { data:files, as: 'file'}">
    <li data-bind="css: file.typeCss" class="list-group-item">
        <span class="badge">
            <span data-bind="html: file.action"></span>
            <span data-bind="visible: file.progressBar">: </span>
            <span data-bind="visible: file.progressBar, html: file.readingPercent"></span>
        </span>
        <span data-bind="html: file.name"></span>
        <div data-bind="visible: file.progressBar" class="progress">
            <div data-bind="html: file.readingPercent, style: { width: file.readingPercent }, css: file.progressBarColor" class="progress-bar"></div>
        </div>
    </li>
</ul>
<!-- /ko -->
