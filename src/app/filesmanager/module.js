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
            self.model.fileValue('');
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
            //fileModel.progressBar(true);
        };

        loader.onEnd = function(data) {
            self.info('loadEnd', {
                file  : file.name,
                status: data.status,
            });
            if (data.status === loader.LOAD) {
                fileModel.status('loaded');
                fileModel.facesCount(data.data.total);
            } else {
                fileModel.status('wait...');
            }
            fileModel.progressBar(false);
            fileModel.percent(0);
        };

        loader.onSuccess = function(data) {
            //fileModel.status('loaded');
        };

        loader.onLoad = function(data) {
            var face = data.face;

            //console.log(face);
        };

        loader.onError = function(data) {
            self.warning(data.error, _.defaults({
                file  : file.name,
                status: data.status,
            }, data.data || {}));
            fileModel.status('error');
            setTimeout(function() {
                self.model.files.remove(fileModel);
            }, 3000);
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
