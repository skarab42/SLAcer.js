/**
* @class   AppViewer3dControlsModel
* @extends GuiModuleModel
*/
var AppViewer3dControlsModel = GuiModuleModel.extend(
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
        var self = this;

        self.views = [
            { name: 'default', title: self.module.getText('reset') , icon: 'fa fa-cube' },
            { name: 'front'  , title: self.module.getText('front') , icon: null },
            { name: 'left'   , title: self.module.getText('left')  , icon: null },
            { name: 'right'  , title: self.module.getText('right') , icon: null},
            { name: 'back'   , title: self.module.getText('back')  , icon: null },
            { name: 'top'    , title: self.module.getText('top')   , icon: null },
            { name: 'bottom' , title: self.module.getText('bottom'), icon: null },
        ];

        self.onViewSelected = function(name) {};

        self.viewSelected = function(model, event) {
            var $target = $(event.target);
            var $button = $target.is('button') ? $target : $target.parent();

            self.onViewSelected($button.val());
        };
    }
});
