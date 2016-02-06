/**
* @class   AppMeshesmanagerMeshModel
* @extends GuiModuleModel
*/
var AppMeshesmanagerMeshModel = GuiModuleModel.extend(
{
    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function(mesh) {
        var self = this;

        var shortNameLimit = 30;

        self.uuid       = mesh.uuid;
        self.name       = ko.observable(mesh.name.length ? mesh.name : mesh.uuid);
        self.disable    = ko.observable(false);
        self.selected   = ko.observable(false);
        self.facesCount = ko.observable(mesh.facesCount);

        self.shortName = ko.computed(function() {
            var name  = self.name();
            if (name.length > shortNameLimit) {
                name = '...' + name.substr(-(shortNameLimit - 3));
            }
            return name;
        });

        self.css = ko.computed(function() {
            var css = 'list-group-item-';
            css += self.disable() ? ' disabled' : ' enabled';
            return css += (self.selected() ? ' selected' : '');
        });

        self.onMeshSelected = function(selected) {};

        self.selectMesh = function(self, event) {
            if (! self.disable()) {
                var selected = ! self.selected();
                self.selected(selected);
                self.onMeshSelected(selected);
            }
        }
    }
});
