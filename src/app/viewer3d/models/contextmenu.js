/**
* @class   AppViewer3dContextmenuModel
* @extends GuiContextmenuModel
*/
var AppViewer3dContextmenuModel = GuiContextmenuModel.extend(
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
        this.addItem({
            icon  : 'eraser',
            text  : 'clear',
            action: function() { console.log('Clear...') }
        });
        this.addItem({text: 'item 1'});
        this.addItem({text: 'item 2'});
        this.addItem({text: 'item 3'});
        this.addDivider();
        this.addItem({text: 'item 4'});
        this.addItem({text: 'item 5'});
    }
});
