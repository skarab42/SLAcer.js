/**
* @class   AppViewer3dHelpModel
* @extends GuiModalModel
*/
var AppViewer3dHelpModel = GuiModalModel.extend({
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
