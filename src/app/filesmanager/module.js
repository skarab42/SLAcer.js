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
        var faces  = [];

        loader.onStart = function(data) {
            //console.log('start', data);
            fileModel.status(data.action);
            fileModel.progressBar(true);
        };

        loader.onProgress = function(data) {
            //console.log('progress', data);
            fileModel.percent(data.percent);
            if (data.action === 'stream') {
                fileModel.facesCount(data.loaded);
            }
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
                self.warning(data.error.message, data.error.data);
                $.notify({
                    icon   : 'fa fa-fw fa-warning',
                	title  : '<strong>Oops!</strong>',
                	message: self.getText(data.error.message, data.error.data)
                }, {
                    delay: 5000,
                    type : 'danger',
                    newest_on_top: false
                });
            } else if (data.action === 'stream') {
                fileModel.status('loaded');
            }
            //console.log(data);
        };

        loader.onFace = function(data) {
            //console.log('face', data);
            faces.push(data.face);
            if (data.last) {
                fileModel.facesCount(data.num);
                self.triggerEvent('fileLoaded', { file: file, faces: faces });
            }
        };

        // try to load the file
        loader.load();
    }
});
