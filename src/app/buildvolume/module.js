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

        var size = self.kernel.getModule('AppViewer3d').getLocal('size');

        self.model.size.x(size.x);
        self.model.size.y(size.y);
        self.model.size.z(size.z);

        // on size change
        self.model.onSizeChange = function(size) {
            self.triggerEvent('buildVolumeSizeChange', size);
        };

        // toggle element
        self.model.onToggleElement = function(name) {
            self.triggerEvent('buildVolumeToggleElement', name);
        };
    }
});
