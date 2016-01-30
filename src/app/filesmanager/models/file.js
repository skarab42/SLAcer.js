/**
* @class   AppFilesmanagerFileModel
* @extends GuiModuleModel
*/
var AppFilesmanagerFileModel = GuiModuleModel.extend(
{
    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function(file) {
        var self = this;
        var name = file.name.split('.');

        self.type        = ko.observable(name.pop());
        self.name        = ko.observable(name.join('.'));
        self.size        = ko.observable(file.size);
        self.status      = ko.observable('read');
        self.percent     = ko.observable(0);
        self.progressBar = ko.observable(false);

        self.css = ko.computed(function() {
            switch (self.status()) {
                case 'error': return 'list-group-item-danger';
                default     : return 'list-group-item-default';
            }
        });

        self.progressPercent = ko.computed(function() {
            return self.percent() + '%';
        });

        self.progressBarCss = ko.computed(function() {
            switch (self.status()) {
                case 'read' : return 'progress-bar-info';
                case 'parse': return 'progress-bar-success';
                default     : return 'progress-bar-danger';
            }
        });
    }
});
