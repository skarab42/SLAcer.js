/**
* @class   AppViewer3dModel
* @extends GuiPanelModel
*/
var AppViewer3dModel = GuiPanelModel.extend(
{
    /**
    * Panel target id.
    *
    * @protected
    * @property target
    * @type     {String}
    * @default  'columnTwo'
    */
    target: 'columnTwo',

    /**
    * Panel position index.
    *
    * @protected
    * @property index
    * @type     {Integer}
    * @default  0
    */
    index: 0,

    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function() {
        this.color('orange');
        this.icon('diamond');
    },

    /**
    * Called after template is rendered.
    *
    * @event afterRender
    * @param {Array}     elements
    * @param {GuiModule} self
    */
    afterRender: function(elements, self) {

    }
});
