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

        // on split button click
        self.model.splitMesh = function() {
            self.triggerEvent('splitSelectedMeshes');
        };
    },

    /**
    * Called when a mesh is removed from viewer.
    *
    * @method onMeshRemoved
    * @param  {ToysModule} module
    * @param  {Object}     data
    */
    onMeshRemoved: function(module, data) {
        this.model.removeMeshByUuid(data.uuid);
    },

    /**
    * Called when a mesh is added to viewer.
    *
    * @method onMeshAdded
    * @param  {ToysModule} module
    * @param  {Object}     data
    */
    onMeshAdded: function(module, data) {
        // self alias
        var self = this;

        // Mesh model
        var meshModel = self.getModel('AppMeshesmanagerMesh', [ data.mesh ]);

        // on mesh selected
        meshModel.onMeshSelected = function(selected) {
            self.triggerEvent('meshSelected', {
                mesh    : data.mesh,
                selected: selected
            });
        };

        // Add mesh model to DOM list
        self.model.meshes.push(meshModel);
    },

    /**
    * Called when a mesh is selected.
    *
    * @method onFileLoaded
    */
    onMeshSelected: function(module, data) {
        if (module !== this) {
            var meshModel = this.model.getMeshByUuid(data.mesh.uuid);
            meshModel && meshModel.selected(data.selected);
        }
    }
});
