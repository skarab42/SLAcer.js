/**
* @class   AppBuildvolumeHelpModel
* @extends GuiModalModel
*/
var AppBuildvolumeHelpModel = GuiModalModel.extend({
    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function() {
        this.icon('question');
    }
});
