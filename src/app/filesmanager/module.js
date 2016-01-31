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

        // on file input change.
        self.model.onFileInputChange = function(fileList) {
            self.loadFileList(fileList);
        };

        // on file removed (from the list)
        self.model.onFileRemoved = function(file) {
            //console.log(file);
        };
    },

    /**
    * Load an FileList.
    *
    * @method loadFileList
    * @param  {FileList} files
    */
    loadFileList: function(fileList) {
        for (var i = 0; i < fileList.length; i++) {
            this.loadFile(fileList[i]);
        }
    },

    /**
    * Load a file.
    *
    * @method loadFile
    * @param  {File} file
    */
    loadFile: function(file) {
        // self alias
        var self = this;

        // File model
        var fileModel = self.getModel('AppFilesmanagerFile', [file]);

        // Add file model to DOM list
        self.model.files.push(fileModel);

        // create file loader
        var loader = new FileLoader(file);

        loader.onStart = function(data) {
            //console.log('start', data);
            fileModel.status(data.action);
            fileModel.progressBar(true);
        };

        loader.onProgress = function(data) {
            //console.log('progress', data);
            fileModel.percent(data.percent);
        };

        loader.onEnd = function(data) {
            //console.log('end', data);
            fileModel.progressBar(false);
            fileModel.percent(0);
            if (data.error) {
                fileModel.disable(true);
                fileModel.status('error');
                setTimeout(function() {
                    self.model.files.remove(fileModel);
                }, 3000);
            } else if (data.action === 'stream') {
                fileModel.status('loaded');
            }
            console.log(data);
        };

        loader.onFace = function(face) {
            //console.log('face', face);
        };

        // try to load the file
        loader.load();
    }
});
