/**
* @class   GuiFileinputModel
* @extends GuiModuleModel
*/
var GuiFileinputModel = GuiModuleModel.extend(
{
    /**
    * On file selected.
    *
    * @event select
    * @param {FileList} files
    */
    onChange: function(files) {},

    /**
    * On file input change.
    *
    * @event change
    * @param {GuiModule} self
    * @param {Event}     event
    */
    change: function(self, event) {
        self.onChange(event.target.files);
    }
});
