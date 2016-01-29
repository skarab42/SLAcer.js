/**
* @class   AppWorkspaceModel
* @extends GuiModuleModel
*/
var AppWorkspaceModel = GuiModuleModel.extend(
{
    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function() {
        var self = this;

        self.appName     = self.module.kernel.getConfig('name');
        self.appCodeName = self.module.kernel.getConfig('codename');
        self.appVersion  = self.module.kernel.getConfig('version');

        self.columnOne = ko.observableArray();
        self.columnTwo = ko.observableArray();

        // Set panels sortable
        var $cols = $('#body .col').sortable({
            connectWith         : '.col',
            handle              : '.panel-heading',
            cancel              : '.panel-heading .btn-group',
            placeholder         : 'panel panel-placeholder',
            forcePlaceholderSize: true,
            opacity             : 0.9,

            start: function(e, ui) {
                // Add higlight class
                $cols.addClass('highlight');
            },

            stop: function(e, ui) {
                // Remove higlight class
                $cols.removeClass('highlight');

                // Get the module instance
                var panelName   = ui.item.attr('name');
                var panelModule = self.module.kernel.getModule(panelName);

                // Trigger event in the scope of panel module
                self.module.triggerEvent('panelMoved', ui, panelModule);
            }
        });
    }
});
