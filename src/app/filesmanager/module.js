/**
* @class   AppFilesmanager
* @extends GuiPanel
*/
var AppFilesmanager = GuiPanel.extend(
{
    /**
    * Setup the module.
    *
    * - Called once by ToysKernel.addModule() after class instanciation.
    *
    * @method setup
    */
    setup: function() {
        // self alias
        var self = this;

        // Files loader
        self.fileLoader = new FileLoader();

        self.fileLoader.onError = function(data) {
            self.warning(data.error, { file: data.file.name });
        };

        // on files selected...
        self.model.onFilesSelected = function(files) {
            for (var i = 0; i < files.length; i++) {
                self.fileLoader.load(files[i]);
            }
        };
    }
});
