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
        // self alias
        var self = this;

        // panel color and icon
        self.color('blue');
        self.icon('files-o');

        // file input
        self.fileInput = {
            value : ko.observable(''),
            title : ko.observable(self.module.getText('fileInputTitle')),
            change: function(self, event) {
                self.onFileInputChange(event.target.files);
                self.fileInput.value(''); // reset input
            }
        }

        // files list
        self.files = ko.observableArray();
    },

    /**
    * On file input change.
    *
    * @event onFileInputChange
    * @param {FileList} fileList
    */
    onFileInputChange: function(fileList) {}
});
