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

        // On files selected...
        self.model.onFilesSelected = function(files) {
            self.loadFiles(files);
        };
    },

    /**
    * Load one file.
    *
    * @method loadFile
    * @param  {File} file
    */
    loadFile: function(file) {
        // self alias
        var self = this;

        // File loader
        var loader = new FileLoader();

        // File model
        var fileModel = self.getModel('AppFilesmanagerFile', [file]);

        // Add file model to DOM list
        self.model.files.push(fileModel);

        // Events callbacks
        loader.onStart = function(data) {
            self.info('loadStart', {
                file  : file.name,
                status: data.status,
            });
            fileModel.progressBar(true);
            fileModel.status(data.status);
        };

        loader.onProgress = function(data) {
            fileModel.percent(data.percent);
        };

        loader.onEnd = function(data) {
            self.info('loadEnd', {
                file  : file.name,
                status: data.status,
            });
            fileModel.progressBar(false);
        };

        loader.onSuccess = function(data) {
            fileModel.status('loaded');
        };

        loader.onError = function(data) {
            self.warning(data.error, {
                file  : file.name,
                status: data.status,
            });
            fileModel.status('error');
        };

        loader.onAbort = function(data) {
            self.warning('loadAborted', {
                file  : file.name,
                status: data.status,
            });
            fileModel.status('aborted');
        };

        loader.load(file);
    },

    /**
    * Load many files.
    *
    * @method loadFiles
    * @param  {FileList} files
    */
    loadFiles: function(files) {
        for (var i = 0; i < files.length; i++) {
            this.loadFile(files[i]);
        }
    }
});
