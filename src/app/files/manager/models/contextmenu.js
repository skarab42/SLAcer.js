/**
* @class   AppFilesManagerContextmenuModel
* @extends GuiContextmenuModel
*/
var AppFilesManagerContextmenuModel = GuiContextmenuModel.extend(
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
            text  : this.module.getText('clearConsole'),
            action: function() { console.log('Clear console...') }
        });
        this.addItem({text: 'item 1'});
        this.addItem({text: 'item 2'});
        this.addItem({text: 'item 3'});
        this.addDivider();
        this.addItem({text: 'item 4'});
        this.addItem({text: 'item 5'});
    }
});
