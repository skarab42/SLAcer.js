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
    }
});
