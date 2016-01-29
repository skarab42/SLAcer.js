/**
* @class   GuiPanelModel
* @extends GuiModuleModel
*/
var GuiPanelModel = GuiModuleModel.extend(
{
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
        self.target = ko.observable(module.getLocal('target', 'columnOne'));
        self.index  = ko.observable(module.getLocal('index' , 0));

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

        // Init body view
        self.bodyId    = module.id + '-body';
        self.bodyView  = self.bodyId + '-tpl';
        self.bodyCss   = ko.observable(self.collapsed ? '' : 'in');
        self.bodyModel = self.module.getModel(module.name + 'Body') || self;
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
        self.toggleButtonIcon('compress');
        self.module.setLocal('collapsed', false);
    }
});
