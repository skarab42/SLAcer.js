/**
* Implement GUI modules functionalities.
*
* - All __gui modules__ must extend this class or one of his children !
*
* @class   GuiModule
* @extends ToysModule
* @uses    lib/font-awesome
* @uses    lib/jquery
* @uses    lib/jquery-ui
* @uses    lib/bootstrap
* @uses    lib/knockout
*/
var GuiModule = ToysModule.extend(
{
    /**
    * Model instance.
    *
    * @protected
    * @property model
    * @type     {GuiModel}
    * @default  null
    */
    model: null,

    /**
    * Class constructor.
    *
    * !!! Do not oweride this method.
    * --> Instead use __setup()__ for Module instanciation.
    *
    * @protected
    * @method create
    * @param  {String} name Module class name in CamelCase style.
    */
    create: function(name) {
        // Call parent constructor
        ToysModule.prototype.create.call(this, name);

        // Try to get the view model
        this.model = this.getModel();
    },

    /**
    * Test if the model is a valid GuiModuleModel.
    *
    * @method isModel
    * @param  {GuiModel} model
    * @return {Boolean}
    */
    isModel: function(model) {
        return (model instanceof GuiModuleModel);
    },

    /**
    * Return the model instance if exist or NULL if not found.
    *
    * @method getModel
    * @param  {String} moduleName
    * @return {GuiModel|null}
    */
    getModel: function(moduleName) {
        // Model
        var model = null;

        // Model class name
        var modelClassName = (moduleName || this.name) + 'Model';

        // If the view model class exist
        if (window[modelClassName]) {
            // Create the model instance
            model = new window[modelClassName](this);

            // If not an valid GuiModule
            if (! this.isModel(model)) {
                this.throwError('GuiModule.invalidModelClass', {
                    model: modelClassName
                });
            }

            // Ensure the model has an callable setup method
            if (model.setup && _.isFunction(model.setup)) {
                // Setup the model
                model.setup();
            }
        }

        // Return the module instance
        return model;
    }
});
