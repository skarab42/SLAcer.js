/**
* @class   AppMeshesmanagerModel
* @extends GuiPanelModel
*/
var AppMeshesmanagerModel = GuiPanelModel.extend(
{
    /**
    * Panel target id.
    *
    * @protected
    * @property target
    * @type     {String}
    * @default  'columnOne'
    */
    target: 'columnOne',

    /**
    * Panel position index.
    *
    * @protected
    * @property index
    * @type     {Integer}
    * @default  1
    */
    index: 1,

    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function() {
        // self alias
        var self = this;

        // panel color and icon
        self.color('red');
        self.icon('diamond');

        // meshes list
        self.meshes = ko.observableArray();

        self.splitMesh = function() {};
        self.dropMesh = function() {};

        // split button
        self.splitButton = {
            label: ko.observable(self.module.getText('splitButtonLabel')),
            click: function(self, event) {
                self.splitMesh();
            }
        };

        // drop button
        self.dropButton = {
            label: ko.observable(self.module.getText('dropButtonLabel')),
            click: function(self, event) {
                self.dropMesh();
            }
        };
    },

    /**
    * Return a mesh model by uid.
    *
    * @method getMeshByUuid
    * @param  {String} uuid
    * @return {AppMeshesmanagerMeshModel}
    */
    removeMeshByUuid: function(uuid) {
        var meshModel = this.getMeshByUuid(uuid);
        meshModel && this.meshes.remove(meshModel);
    },

    /**
    * Return a mesh model by uid.
    *
    * @method getMeshByUuid
    * @param  {String} uuid
    * @return {AppMeshesmanagerMeshModel}
    */
    getMeshByUuid: function(uuid) {
        return _.find(this.meshes(), function(o) { return o.uuid === uuid; });
    }
});
