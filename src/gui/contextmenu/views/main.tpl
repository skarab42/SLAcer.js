<ul data-bind="foreach: { data: items, as: 'item' }" class="dropdown-menu context-menu">
    <li data-bind="visible: item.divider" role="separator" class="divider"></li>
    <li data-bind="visible: ! item.divider, css: item.role">
        <a data-bind="click: item.action" href="#">
            <i data-bind="visible: item.icon, css: item.icon" class="fa fa-fw"></i>
            <i data-bind="visible: ! item.icon" class="fa fa-fw"></i>
            <span data-bind="text: item.text"></span>
        </a>
    </li>
</ul>
