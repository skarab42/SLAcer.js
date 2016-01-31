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

        // create file loader
        var loader = new FileLoader(file);

        loader.onStart    = function(data) { console.log('start'   , data); };
        loader.onProgress = function(data) { console.log('progress', data); };
        loader.onEnd      = function(data) { console.log('end'     , data); };
        loader.onFace     = function(face) { console.log('face'    , face); };

        // try to load the file
        loader.load();
    },

    /**
    * Load a file.
    *
    * @method loadFile
    * @param  {File} file
    */
    __loadFile: function(file) {
        // self alias
        var self = this;

        // File loader
        var loader = new FileLoader();

        // File model
        var fileModel = self.getModel('AppFilesmanagerFile', [file]);

        fileModel.onFileSelected = function(selectedFile) {
            selectedFile.selected(true);
            console.log('pouet');
        };

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
    }
});
