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
        // Files loader
        //this.loader = new FilesLoader();

        // on files selected...
        this.model.onFilesSelected = function(files) {
            console.log('files', files);
        };
    }
});
