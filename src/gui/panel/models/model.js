/**
* @class   GuiPanelModel
* @extends GuiModuleModel
*/
var GuiPanelModel = GuiModuleModel.extend(
{
    /**
    * Panel target id.
    *
    * @protected
    * @property target
    * @type     {String}
    * @default  'columnOne'
    */
    target: 'columnOne',

    /**
    * Panel position index.
    *
    * @protected
    * @property index
    * @type     {Integer}
    * @default  0
    */
    index: 0,

    /**
    * Class constructor.
    *
    * !!! Do not oweride this method.
    * --> Instead use __setup()__ for instanciation.
    *
    * @protected
    * @method create
    * @param  {GuiPanel} module Panel module instance.
    */
    create: function(module) {
        // Call parent constructor
        GuiModuleModel.prototype.create.call(this, module);

        // Self alias
        var self = this;

        // Position
        self.target = ko.observable(module.getLocal('target', self.target));
        self.index  = ko.observable(module.getLocal('index' , self.index));

        // Set panel color and css classes
        self.color = ko.observable('white');
        self.css   = ko.computed(function() {
            return self.color() + '-panel';
        });

        // Set panel icon
        self.icon    = ko.observable(null);
        self.iconCss = ko.computed(function() {
            return 'fa-' + self.icon();
        });

        // Set default title
        self.title = module.getText('title');

        // Is collapsed ?
        self.collapsed = module.getLocal('collapsed', false);

        // Init body view
        self.bodyId    = module.id + '-body';
        self.bodyView  = self.bodyId + '-tpl';
        self.bodyCss   = ko.observable(self.collapsed ? '' : 'in');
        self.bodyModel = self.module.getModel(module.name + 'Body') || self;

        // Init panel toggle
        self.toggleTarget      = '#' + self.bodyId;
        self.toggleButtonTitle = module.getText('GuiPanel.togglePanel');
        self.toggleButtonIcon  = ko.observable(self.collapsed ? 'expand' : 'compress');
        self.toggleButtonCss   = ko.computed(function()
        {
            return 'fa-' + self.toggleButtonIcon();
        });

        // Init help modal
        self.helpModel       = self.module.getModel(module.name + 'Help');
        self.helpTarget      = '#' + module.id + '-help';
        self.helpButtonTitle = module.getText('GuiPanel.help');

        // Try to create the default context menu model
        self.contextMenuModel = self.module.getModel(module.name + 'Contextmenu');
        self.contextMenuModel = self.contextMenuModel || self.module.getModel('GuiContextmenu');
    },

    /**
    * On panel is compressed.
    *
    * @protected
    * @event  onCompressPanel
    * @param  {GuiPanel} self
    * @param  {n.Event}  event
    */
    onCompressPanel: function(self, event) {
        self.collapsed = true;
        self.toggleButtonIcon('expand');
        self.module.setLocal('collapsed', true);
    },

    /**
    * On panel is expended.
    *
    * @protected
    * @event  onExpendPanel
    * @param  {GuiPanel} self
    * @param  {n.Event}  event
    */
    onExpendPanel: function(self, event) {
        self.collapsed = false;
        self.toggleButtonIcon('compress');
        self.module.setLocal('collapsed', false);
    }
});
