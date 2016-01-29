/**
* @class   AppFilesManagerModel
* @extends GuiPanelModel
*/
var AppFilesManagerModel = GuiPanelModel.extend(
{
    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function() {
        this.icon('terminal');
        this.target('columnTwo');
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
