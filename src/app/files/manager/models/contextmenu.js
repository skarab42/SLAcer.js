/**
* Contextmenu model.
*
* @license   GPL
* @version   1.0.0
* @copyright 2015 Onl'Fait (http://www.onlfait.ch)
* @author    Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @link      https://github.com/lautr3k/Straw
* @module    App
*/

/**
* @class   AppConsoleContextmenuModel
* @extends GuiContextmenuModel
*/
var AppConsoleContextmenuModel = GuiContextmenuModel.extend(
{
    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function()
    {
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
