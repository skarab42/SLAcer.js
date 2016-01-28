<!-- App -->
<div id="body" class="container-fluid">
    <!-- Two columns grid -->
    <div class="row">
        <!-- Column 1 -->
        <div data-bind="template: { name: 'app-panel-tpl', foreach: columnOne }" id="column-one" class="col col-md-4"></div>
        <!-- Column 2 -->
        <div data-bind="template: { name: 'app-panel-tpl', foreach: columnTwo }" id="column-two" class="col col-md-8"></div>
    </div>
</div>
