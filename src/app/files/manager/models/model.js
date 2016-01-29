/**
* @class   AppFilesManagerModel
* @extends GuiPanelModel
*/
var AppFilesManagerModel = GuiPanelModel.extend(
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
        this.icon('files-o');
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
