/**
* @class   AppBuildvolumeModel
* @extends GuiPanelModel
*/
var AppBuildvolumeModel = GuiPanelModel.extend(
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
    index: 2,

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
        self.color('gray');
        self.icon('cube');

        // size
        self.size = {
            x: ko.observable(200),
            y: ko.observable(200),
            z: ko.observable(200)
        };

        // texts
        self.texts = {
            floor: self.module.getText('floor'),
            grid : self.module.getText('grid'),
            axis : self.module.getText('axis'),
            box  : self.module.getText('box')
        };

        // after render
        self.afterRender = function(elements, self) {
            var $self   = $('#appbuildvolume-size input');
            self.$sizeX = $($self.get(0));
            self.$sizeY = $($self.get(1));
            self.$sizeZ = $($self.get(2));
        };

        // public events
        self.onSizeChange    = function(size) {};
        self.onToggleElement = function(name) {};

        // on size change
        self.sizeChange = function(self, event) {
            self.onSizeChange({
                x: self.$sizeX.val(),
                y: self.$sizeY.val(),
                z: self.$sizeZ.val(),
            });
        };

        // toggle element
        self.toggleElement = function(self, event) {
            self.onToggleElement(event.target.value);
        };
    }

});
