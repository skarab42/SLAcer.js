/**
* @class   AppBuildvolume
* @extends GuiPanel
*/
var AppBuildvolume = GuiPanel.extend(
{
    /**
    * Setup the module.
    *
    * - Called once by ToysKernel.addModule() after class instanciation.
    *
    * @method setup
    */
    setup: function() {
        // self alias
        var self = this;

        // on size change
        self.model.onSizeChange = function(size) {
            console.log(size);
        };

        // toggle element
        self.model.onToggleElement = function(name) {
            console.log(name);
        };
    }
});
