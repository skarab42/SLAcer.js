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

        // viewer size
        self.size = {
            width : 800,
            height: 400
        };

        // create viewer instance
        self.viewer = new Viewer3d({ size: self.size });

        // one view is rendered
        self.model.afterRender = function(elements, model) {
            // set model viewer wrapper element
            model.$viewer = $('#viewer3d');

            // wrap the viewer
            model.$viewer.html(self.viewer.canvas);

            // resize the 3D viewer to fit his wrapper size
            $(window).bind('resize', function() { self.resize(); });
            setTimeout(function() { self.resize(); }, 5);

            // set wrapper verticaly resizable
            model.$viewer.resizable({
                handles: 's',
                resize : function(event, ui) {
                    self.size.height = ui.size.height;
                    self.viewer.resize(self.size.width, self.size.height);
                    self.viewer.render();
                }
            });
        };

        self.model.onExpendPanel = function(self, event) {
            // Call parent method
            GuiPanelModel.prototype.onExpendPanel.call(this, self, event);
            self.module.resize();
        };

        // on panel moved, resize to fit his wrapper
        self.onPanelMoved = function(module, ui) {
            self === module && self.resize();
        };
    },

    /**
    * Resize the 3D viewer to fit his wrapper size.
    *
    * @method resize
    */
    resize: function() {
        this.size.width = this.model.$viewer.width();
        this.viewer.resize(this.size.width, this.size.height);
        this.viewer.render();
    }
});
