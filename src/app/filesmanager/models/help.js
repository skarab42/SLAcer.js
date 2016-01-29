/**
* @class   AppFilesmanagerHelpModel
* @extends GuiModalModel
*/
var AppFilesmanagerHelpModel = GuiModalModel.extend({
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
