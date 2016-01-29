/**
* @class   AppWorkspace
* @extends GuiModule
*/
var AppWorkspace = GuiModule.extend(
{
    /**
    * Setup the module.
    *
    * - Called once by Straw.addModule() after class instanciation.
    *
    * @method setup
    */
    setup: function()
    {
        // Bind model with main view
        this.model && ko.applyBindings(this.model);
    },

    /**
    * Add a new panel
    *
    * @event  addPanel
    * @param  {StrawModule} module
    * @param  {Mixed}       result The value returned by module.setup().
    */
    addPanel: function(module)
    {
        var column = this.model[module.model.target()];

        // Push to obserable array
        column.push(module.model);

        // Sort panels in user order
        column.sort(function(left, right)
        {
            if (left.index() == right.index()) return  0;
            if (left.index() >  right.index()) return  1;
            if (left.index() <  right.index()) return -1;
        });

        this.message('info', 'panelAdded', { panel: module.name });
    },

    /**
    * Called after a module is setup.
    *
    * @event  onSetup
    * @param  {StrawModule} module
    * @param  {Mixed}       result The value returned by module.setup().
    */
    onSetup: function(module, result)
    {
        // New panel ready
        if (module instanceof GuiPanel) {
            this.addPanel(module);
        }
    }
});
