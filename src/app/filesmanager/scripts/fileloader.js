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
    onFace    : function(face) {},

    /**
    * Class constructor.
    *
    * @constructor
    * @param {File} file
    */
    create: function(file) {
        // set file
        this.file = file;

        // file extension as type (all lowecase)
        this.type = file.name.split('.').pop().toLowerCase();
    },

    /**
    * Load the file.
    *
    * @method load
    */
    load: function() {
        // self alias
        var self = this;

        // trigger start check event
        self.onStart({ action: 'check' });

        // if empty file
        if (self.file.size == 0) {
            return self.onEnd({ action: 'check', error: 'emptyFile' });
        }

        // if disabled or unknown type
        if (! self.workers[self.type]) {
            return self.onEnd({
                action: 'check',
                error : self.workers[self.type] === undefined
                      ? 'unknownType'
                      : 'disabledType'
            });
        }

        // trigger end check event
        self.onEnd({ action: 'check' });

        // create the parser instance
        var parser = new Worker(self.workers[self.type]);

        parser.onmessage = function(e) {
            if (e.data.type === 'start') {
                self.onStart(e.data.data);
            }
            else if (e.data.type === 'progress') {
                self.onProgress(e.data.data);
            }
            else if (e.data.type === 'face') {
                self.onFace(e.data.data);
            }
            else if (e.data.type === 'error' || e.data.type === 'end') {
                self.onEnd(e.data.data);
            }
        };

        // create file reader instance
        var reader      = new FileReader();
        var lastPercent = 0;

        reader.onprogress = function(e) {
            if (! e.lengthComputable) {
                return null;
            }
            var percent = Math.round(e.loaded / e.total * 100);
            if (lastPercent !== percent) {
                self.onProgress({
                    action : 'read',
                    total  : e.total,
                    loaded : e.loaded,
                    percent: percent
                });
            }
            lastPercent = percent;
        };

        reader.onloadend = function(e) {
            if (e.target.error) {
                return self.onEnd({ action: 'read', error: e.target.error });
            }
            self.onEnd({ action: 'read' });
            self.onStart({ action: 'parse' });
            parser.postMessage(e.target.result);
        };

        // trigger start read event
        self.onStart({ action: 'read' });

        // read file contents as buffer array
        reader.readAsArrayBuffer(self.file);
    }
});



var _FileLoader = JSClass(
{
    // Files workers
    workers: {
        stl: 'src/app/filesmanager/workers/stl.js',
        obj: false
    },

    // Events callbacks
    onStatus  : function(data) {},
    onStart   : function(data) {},
    onProgress: function(data) {},
    onSuccess : function(data) {},
    onError   : function(data) {},
    onAbort   : function(data) {},
    onEnd     : function(data) {},

    /**
    * Class constructor.
    *
    * @constructor
    * @param {File} file
    */
    create: function(file) {
        // set file
        this.file = file;

        // set initial status
        this.status = FileLoader.STATUS_WAIT;

        // file extension as type (all lowecase)
        this.type = file.name.split('.').pop().toLowerCase();
    },

    /**
    * Make data to send to event.
    *
    * @protected
    * @method _data
    * @param  {Object} data
    */
    _data: function(data) {
        return _.defaults({
            file  : this.file,
            type  : this.type,
            status: this.status
        }, data || {});
    },

    /**
    * Change status.
    *
    * @method _status
    * @param  {String} status
    */
    _status: function(status) {
        this.status = FileLoader['STATUS_' + status.toUpperCase()];
        this.onStatus(this._data());
    },

    /**
    * Notify an error.
    *
    * @method _error
    * @param  {String} errorId
    */
    _error: function(data) {
        // trigger error event
        this.onError(this._data({ error: data }));

        // set error status
        this._status('error');

        // trigger end event
        this.onEnd(this._data({ error: data }));
    },

    /**
    * Load the file.
    *
    * @method load
    */
    load: function() {
        // self alias
        var self = this;

        // set check status
        this._status('check');

        // trigger start event
        self.onStart(self._data());

        // if empty file
        if (self.file.size == 0) {
            return self._error({ name: FileLoader.ERROR_EMPTY_FILE });
        }

        // if disabled or unknown type
        if (! self.workers[self.type]) {
            return self._error({
                name: self.workers[self.type] === undefined
                    ? FileLoader.ERROR_UNKNOWN_TYPE
                    : FileLoader.ERROR_DISABLED_TYPE
            });
        }

        // create the parser instance
        var parser = new Worker(self.workers[self.type]);

        parser.onmessage = function(e) {
            if (e.data.action === 'progress') {

            }
            else if (e.data.action === 'error') {

            }
            else if (e.data.action === 'error') {

            }
        };


        // create file reader instance
        var reader      = new FileReader();
        var lastPercent = 0;

        reader.onprogress = function(e) {
            if (! e.lengthComputable) {
                return null;
            }
            var percent = Math.round(e.loaded / e.total * 100);
            if (lastPercent !== percent) {
                self.onProgress(self._data({
                    percent: percent,
                    loaded : e.loaded,
                    total  : e.total
                }));
            }
            lastPercent = percent;
        };

        reader.onabort = function(e) {
            self.onAbort(self._data());
            self.status = FileLoader.STATUS_ABORT;
        };

        reader.onloadend = function(e) {
            if (e.target.error && self.status !== FileLoader.STATUS_ABORT) {
                return self._error(e.target.error);
            }
            self.status = FileLoader.STATUS_READ;
            self.onProgress(self._data({
                percent: 0,
                loaded : 0,
                total  : file.size
            }));
            parser.postMessage({
                action: 'parse',
                buffer: e.target.result
            });
        };

        // set status to read
        self.status = FileLoader.STATUS_READ;

        // read file contents as buffer array
        reader.readAsArrayBuffer(self.file);
    }

}).static({
    STATUS_WAIT : 'wait',
    STATUS_CHECK: 'check',
    STATUS_READ : 'read',
    STATUS_PARSE: 'parse',
    STATUS_LOAD : 'load',
    STATUS_ERROR: 'error',
    STATUS_ABORT: 'abort',

    ERROR_EMPTY_FILE   : 'emptyFile',
    ERROR_DISABLED_TYPE: 'disabledType',
    ERROR_UNKNOWN_TYPE : 'unknownType',
    ERROR_NOT_FOUND    : 'fileNotFound',
    ERROR_NOT_READABLE : 'fileNotReadable',
    ERROR_UNKNOWN      : 'unknownError'
});


var __FileLoader = JSClass(
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
    onLoad    : function(data) {},

    // Status
    READ : 'read',
    PARSE: 'parse',
    LOAD : 'load',

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
                return;
            }
            var percent = Math.round(e.loaded / e.total * 100);
            if (percent <= 100) {
                self.onProgress({
                    file   : file,
                    status : self.READ,
                    percent: percent,
                    loaded : e.loaded,
                    total  : e.total
                });
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
                        status: self.PARSE
                    });
                }
                else if (e.data.action == 'error') {
                    self.onError({
                        file  : file,
                        status: self.PARSE,
                        error : e.data.message,
                        data  : e.data.data || null
                    });
                }
                else if (e.data.action == 'progress') {
                    self.onProgress({
                        file   : file,
                        status : self.PARSE,
                        percent: e.data.data.percent,
                        loaded : e.data.data.loaded,
                        total  : e.data.data.total
                    });
                }
                else if (e.data.action == 'loadStart') {
                    self.onStart({ file: file, status: self.LOAD, data: e.data.data });
                }
                else if (e.data.action == 'loadEnd') {
                    self.onEnd({ file: file, status: self.LOAD, data: e.data.data });
                }
                else if (e.data.action == 'load') {
                    self.onLoad({
                        file  : file,
                        status: self.LOAD,
                        face  : e.data.data.face
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
