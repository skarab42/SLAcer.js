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

        var self = this;

        // Set close button title
        self.closeButtonTitle = module.getText('GuiModal.closeButtonTitle');

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

        // Set body view id
        self.id = module.id + '-help';

        // Set body view name
        self.bodyView = self.id + '-tpl';
    }
});
