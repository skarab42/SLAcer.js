/**
* @class   AppFilesmanagerModel
* @extends GuiPanelModel
*/
var AppFilesmanagerModel = GuiPanelModel.extend(
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
        var self = this;

        self.color('blue');
        self.icon('files-o');

        self.files          = ko.observableArray();
        self.fileValue      = ko.observable('');
        self.fileInput      = self.module.getModel('GuiFileinput');
        self.fileInputTitle = self.module.getText('fileInputTitle');
        self.fileSelect     = function(self, event) {
            self.onFilesSelected(event.target.files);
        }
    },

    /**
    * On file input change.
    *
    * @event onFilesSelected
    * @param {GuiModule} files
    */
    onFilesSelected: function(files) {}
});
