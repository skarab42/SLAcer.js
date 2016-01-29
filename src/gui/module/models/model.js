/**
* Gui modules base model.
*
* - All __gui models__ must extend this class or one of his children !
*
* @class   GuiModuleModel
* @extends JSClass
*/
var GuiModuleModel = JSClass(
{
    /**
    * Module instance.
    *
    * @protected
    * @property module
    * @type     {GuiModule}
    */
    module: null,

    /**
    * Class constructor.
    *
    * !!! Do not oweride this method.
    * --> Instead use __setup()__ for Module instanciation.
    *
    * @protected
    * @method create
    * @param  {GuiModule} module Gui module instance.
    */
    create: function(module)
    {
        this.module = module;
    },

    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function() {},

    /**
    * Called after template is rendered.
    *
    * @event afterRender
    * @param {Array}     elements
    * @param {GuiModule} self
    */
    afterRender: function(elements, self) {}
});
