/**
* @class   FileLoader
* @extends JSClass
*/
var FileLoader = JSClass(
{
    // Files workers
    workers: {
        stl: 'src/app/filesmanager/scripts/workers/stl.js',
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

    // Errors
    ERR_EMPTY_FILE    : 'emptyFile',
    ERR_DISABLED_TYPE : 'disabledType',
    ERR_UNKNOWN_TYPE  : 'unknownType',

    /**
    * Load the file.
    *
    * @param {File} file
    */
    load: function(file) {
        // if empty file
        if (file.size == 0) {
            return this.onError({
                file  : file,
                status: this.READ,
                error : this.ERR_EMPTY_FILE
            });
        }

        // file extension
        var ext = file.name.split('.').pop().toLowerCase();

        // if disabled or unknown type
        if (! this.workers[ext]) {
            return this.onError({
                file  : file,
                status: this.READ,
                error : this.workers[ext] === false ? this.ERR_DISABLED_TYPE : this.ERR_UNKNOWN_TYPE
            });
        }

    }
});
