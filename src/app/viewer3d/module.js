/**
* @class   AppViewer3d
* @extends GuiPanel
*/
var AppViewer3d = GuiPanel.extend(
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

        // create viewer instance
        this.viewer = new Viewer3d();

        // one view is rendered
        this.model.afterRender = function(elements, model) {
            // set model viewer wrapper element
            model.$viewer = $('#viewer3d');

            // wrap the viewer
            model.$viewer.html(self.viewer.canvas);
        }
    }
});
