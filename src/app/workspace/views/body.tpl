<!-- Body -->
<div id="body" class="container-fluid">
    <!-- Two columns grid -->
    <div class="row">
        <!-- Column 1 -->
        <div data-bind="template: { name: 'guipanel-main-tpl', foreach: columnOne }" id="column-one" class="col col-md-4"></div>
        <!-- Column 2 -->
        <div data-bind="template: { name: 'guipanel-main-tpl', foreach: columnTwo }" id="column-two" class="col col-md-8"></div>
    </div>
</div>
