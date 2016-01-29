<div data-bind="template: {name: 'guifileinput-main-tpl', data: fileInput, afterRender: fileInput.afterRender}"></div>
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
