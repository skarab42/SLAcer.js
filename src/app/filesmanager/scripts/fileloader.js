/**
* @class   FileLoader
* @extends JSClass
*/
var FileLoader = JSClass(
{
    // Files workers
    workers: {
        stl: 'src/app/filesmanager/workers/stl.js',
        obj: false
    },

    // Events callbacks
    onStart   : function(data) {},
    onProgress: function(data) {},
    onEnd     : function(data) {},
    onSuccess : function(data) {},
    onError   : function(data) {},
    onAbort   : function(data) {},

    // Status
    READ : 'read',
    PARSE: 'parse',

    // Errors
    ERR_EMPTY_FILE   : 'emptyFile',
    ERR_DISABLED_TYPE: 'disabledType',
    ERR_UNKNOWN_TYPE : 'unknownType',
    ERR_NOT_FOUND    : 'fileNotFound',
    ERR_NOT_READABLE : 'fileNotReadable',
    ERR_UNKNOWN      : 'unknownError',

    /**
    * Load the file.
    *
    * @param {File} file
    */
    load: function(file) {
        // self alias
        var self = this;

        // if empty file
        if (file.size == 0) {
            return self.onError({
                file  : file,
                status: self.READ,
                error : self.ERR_EMPTY_FILE
            });
        }

        // file extension
        var ext = file.name.split('.').pop().toLowerCase();

        // if disabled or unknown type
        if (! self.workers[ext]) {
            return self.onError({
                file  : file,
                status: self.READ,
                error : self.workers[ext] === false
                      ? self.ERR_DISABLED_TYPE
                      : self.ERR_UNKNOWN_TYPE
            });
        }

        // create file reader instance
        var reader = new FileReader();

        // on load start
        reader.onloadstart = function(e) {
            self.onStart({ file: file, status: self.READ });
        };

        // on progress
        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                var percent = Math.round((e.loaded / e.total) * 100);
                if (percent <= 100) {
                    self.onProgress({
                        file   : file,
                        status : self.READ,
                        percent: percent,
                        loaded : e.loaded,
                        total  : e.total
                    });
                }
            }
        };

        // on load end
        reader.onloadend = function(e) {
            self.onEnd({
                file  : file,
                status: self.READ,
                buffer: e.target.result
            });

            var worker = new Worker(self.workers[ext]);
            worker.postMessage(e.target.result);

            worker.onmessage = function(e) {
                if (e.data.action == 'start') {
                    self.onStart({ file: file, status: self.PARSE, data: e.data.data });
                }
                else if (e.data.action == 'end') {
                    self.onEnd({ file: file, status: self.PARSE });
                }
                else if (e.data.action == 'success') {
                    self.onSuccess({
                        file  : file,
                        status: self.PARSE,
                        faces : e.data.faces
                    });
                }
                else if (e.data.action == 'error') {
                    self.onError({
                        file  : file,
                        status: self.PARSE,
                        error : e.data.error
                    });
                }
                else if (e.data.action == 'progress') {
                    self.onProgress({
                        file   : file,
                        status : self.PARSE,
                        percent: e.data.percent,
                        loaded : e.data.loaded,
                        total  : e.data.total
                    });
                }
            };
        };

        // on error
        reader.onerror = function(e) {
            switch(e.target.error.code) {
                case e.target.error.ABORT_ERR:
                    return self.onAbort({ file: file, status: self.READ });
                case e.target.error.NOT_FOUND_ERR:
                    return self.onError({
                        file  : file,
                        status: self.READ,
                        error : self.ERR_NOT_FOUND
                    });
                case e.target.error.NOT_READABLE_ERR:
                    return self.onError({
                        file  : file,
                        status: self.READ,
                        error : self.ERR_NOT_READABLE
                    });
                default:
                    return self.onError({
                        file  : file,
                        status: self.READ,
                        error : self.ERR_UNKNOWN
                    });
            }
        };

        // get file contents as buffer array
        reader.readAsArrayBuffer(file);
    }
});
