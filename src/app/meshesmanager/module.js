/**
* @class   AppMeshesmanager
* @extends GuiPanel
*/
var AppMeshesmanager = GuiPanel.extend(
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
    },

    /**
    * Called when a mesh is added to viewer.
    *
    * @method onMeshAdded
    * @param  {ToysModule} module
    * @param  {Object}     data
    */
    onMeshAdded: function(module, data) {
        console.log(data.mesh.uuid);
    }
});
