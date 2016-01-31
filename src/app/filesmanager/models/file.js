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

        var shortNameLimit = 30;

        self.type        = ko.observable(name.pop());
        self.name        = ko.observable(name.join('.'));
        self.size        = ko.observable(filesize(file.size));
        self.status      = ko.observable('preload');
        self.percent     = ko.observable(0);
        self.disable     = ko.observable(false);
        self.selected    = ko.observable(false);
        self.progressBar = ko.observable(false);
        self.facesCount  = ko.observable(0);

        self.shortName = ko.computed(function() {
            var name  = self.name();
            if (name.length > shortNameLimit) {
                name = '...' + name.substr(-(shortNameLimit - 3));
            }
            return name;
        });

        self.css = ko.computed(function() {
            var css = 'list-group-item-';

            switch (self.status()) {
                case 'error': css += 'danger';
                    break;
                default: css += 'default';
            }

            css += self.disable() ? ' disabled' : ' enabled';

            return css += (self.selected() ? ' selected' : '');
        });

        self.progressPercent = ko.computed(function() {
            return self.percent() + '%';
        });

        self.progressBarCss = ko.computed(function() {
            switch (self.status()) {
                case 'read' : return 'progress-bar-info';
                case 'parse': return 'progress-bar-success';
                case 'load' : return 'progress-bar-warning';
                default     : return 'progress-bar-danger';
            }
        });

        self.onFileSelected = function(file) {};
        self.selectFile = function(self, event) {
            self.onFileSelected(self);
        }
    }
});
