/**
* @class   GuiModalModel
* @extends GuiModuleModel
*/
var GuiModalModel = GuiModuleModel.extend(
{
    /**
    * Class constructor.
    *
    * !!! Do not oweride this method.
    * --> Instead use __setup()__ for instanciation.
    *
    * @protected
    * @method create
    * @param  {GuiModal} module Modal module instance.
    */
    create: function(module)
    {
        // Call parent constructor
        GuiModuleModel.prototype.create.call(this, module);

        // Default context menu items
        this.items = ko.observableArray();
    },

    /**
    * Add a new item.
    *
    * @method addItem
    * @param  {Object} options
    */
    addItem: function(options)
    {
        // Create item model
        var item = _.defaults(options || {},
        {
            icon  : null,
            text  : 'item',
            role  : 'default',
            action: function() {}
        });

        // Prifix the icon name if set
        item.icon = item.icon ? 'fa-' + item.icon : null;

        // Add the new item
        this.items.push(item);
    },

    /**
    * Add a new divider.
    *
    * @method addDivider
    */
    addDivider: function()
    {
        this.items.push({ divider: true });
    },

    /**
    * Called after template is rendered.
    *
    * @event afterRender
    * @param {Array}     elements
    * @param {GuiModule} self
    */
    afterRender: function(elements, self)
    {
        console.log('pouet');
        self.$panel = $('#' + self.module.id);

        self.$contextMenuWrapper = self.$panel.find('.context-menu-wrapper');
        self.$contextMenu = self.$contextMenuWrapper.find('.context-menu');

        self.$contextMenuWrapper.hide();
        self.$contextMenu.show();

        $(document).on('click contextmenu', function()
        {
            self.$contextMenuWrapper.hide();
        });
    },

    /**
    * Show the contextual menu at mouse position.
    *
    * @event  onRightClick
    * @param  {GuiModule} module
    * @param  {n.Event}   event
    */
    onRightClick: function(module, event)
    {
        // Self alias
        var self = module.contextMenuModel;

        // Prevent menu to display if CTRL key pressed
        if (event.ctrlKey || ! self.items().length)
        {
            return true;
        }

        event.stopPropagation();
        self.$contextMenuWrapper.show();

        var $win   = $(window);
        var xLimit = $win.width()  - self.$contextMenu.outerWidth(true);
        var yLimit = $win.height() - self.$contextMenu.outerHeight(true);

        var offset   = self.$panel.offset();
        var position = self.$panel.position();
        var left     = position.left + event.pageX - offset.left;
        var top      = position.top  + event.pageY - offset.top;

        var xOffset = event.pageX - xLimit;
        var yOffset = event.pageY - yLimit;

        if (xOffset > 0) left -= xOffset;
        if (yOffset > 0) top  -= yOffset;
        if (yLimit  < 0) top  -= yLimit;
        if (xLimit  < 0) left -= xLimit;

        self.$contextMenuWrapper.css(
        {
            position: 'absolute',
            left    : left,
            top     : top
        });
    }
});
