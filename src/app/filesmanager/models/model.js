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
            label : ko.observable(self.module.getText('fileInputLabel')),
            change: function(self, event) {
                self.onFileInputChange(event.target.files);
                self.fileInput.value(''); // reset input
            }
        }

        // remove button
        self.removeButton = {
            label: ko.observable(self.module.getText('removeButtonLabel')),
            click: function(self, event) {
                var files = self.getSelectedFiles();
                var file  = null;
                for (var i = 0; i < files.length; i++) {
                    file = files[i];
                    self.files.remove(file);
                    self.onFileRemoved(file);
                }
            }
        };

        // files list
        self.files = ko.observableArray();
    },

    /**
    * Return all selected files.
    *
    * @event getSelectedFiles
    * @return {Array}
    */
    getSelectedFiles: function() {
        var removed = [];
        var file    = null;
        var files   = this.files();
        for (var i = 0; i < files.length; i++) {
            file = files[i];
            if (file.selected()) {
                removed.push(file);
            }
        }
        return removed;
    },

    /**
    * On file input change.
    *
    * @event onFileInputChange
    * @param {FileList} fileList
    */
    onFileInputChange: function(fileList) {},

    /**
    * Called after each file removed.
    *
    * @event onFilesRemoved
    * @param {File} file
    */
    onFileRemoved: function(file) {}
});
