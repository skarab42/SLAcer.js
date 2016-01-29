/**
* Front controller.
*
* @module    Toys
* @submodule ToysKernel
*/

/**
* Front controller (singleton).
*
* - Use __ToysKernel.instance()__ to get the class instance.
* - Use __ToysKernel.setup(options)__ to pass initial settings.
* - Finally use __ToysKernel.run([module, ...])__ to start your application.
*
* @example
*     ToysKernel.instance.setup(
*     {
*         config: {"name": "Toys", "version": "1.0.0", "description": "..."},
*         texts : {"en": {"key": "value"}, "fr": {"key": "valeur"}},
*     })
*     .run(["ModuleOne", "ModuleTwo"]);
*
* @class   ToysKernel
* @extends ToysCore
*/
var ToysKernel = ToysCore.extend(
{
    /**
    * @property singleton
    * @type     {Boolean}
    * @default  true
    */
    singleton: true,

    /**
    * @property initialized
    * @type     {Boolean}
    * @default  false
    */
    initialized: false,

    /**
    * @property name
    * @type     {String}
    * @default  ToysKernel
    */
    name: 'ToysKernel',

    /**
    * Setup the front controller.
    *
    * @method setup
    * @param  {Object} options
    * @chainable
    */
    setup: function(options)
    {
        // Allready initialized
        if (this.initialized)
        {
            return; // exit...
        }

        // Set config, texts and modules base collection
        this.set('config' , options.config || {});
        this.set('texts'  , options.texts  || {});
        this.set('modules', {});

        // Mark as initialized
        this.initialized = true;

        // Chainable
        return this;
    },

    /**
    * Run the front controller.
    *
    * - Register and load all provided modules.
    *
    * @method run
    * @param {Array} modules
    */
    run: function(modules)
    {
        // For each modules provided
        for (var i in modules)
        {
            // Create and initialize module
            this.addModule(modules[i]);
        }
    },

    /**
    * Get an module instance.
    *
    * @method getModule
    * @param  {String} namespace
    * @return {ToysModule|null}
    */
    getModule: function(namespace)
    {
        return this.modules[namespace] || null;
    },

    /**
    * Return if it is a valid ToysModule.
    *
    * @method isModule
    * @param  {ToysModule} module
    * @return {Boolean}
    */
    isModule: function(module)
    {
        return (module instanceof ToysModule);
    },

    /**
    * Create and add one (or many) new module instance.
    *
    * @method addModule
    * @param  {String} className
    * @param  {String} [namespace]
    * @return {ToysModule|Array}
    */
    addModule: function(className, namespace)
    {
        // Get module namespace
        var namespace = namespace || className;

        // If className is a string
        if (typeof className === 'string')
        {
            // Try to get the module
            if (this.getModule(namespace))
            {
                // Oups module already registrered
                this.error('moduleAllreadySet',
                {
                    module   : className,
                    namespace: namespace
                });
            }

            // Class not defined !
            if (! window[className])
            {
                this.error('undefinedModule',
                {
                    module   : className,
                    namespace: namespace
                });
            }

            // Create module instance
            var module = new window[className](namespace);

            // Not a valid module !
            if (! this.isModule(module))
            {
                this.error('invalidModuleClass',
                {
                    module   : className,
                    namespace: namespace
                });
            }

            // Register module
            this.modules[namespace] = module;

            // Setup module
            var setupResult = module.setup();

            // Trigger an event on all registrered modules
            this.triggerEvent('setup', setupResult, module);

            // Return the module instance
            return module;
        }

        // Instances collection
        var instances = {};

        // For each class name provided
        for (var key in className)
        {
            // Class name is the first param
            var _className = className[key];

            // Namespace is the class name on Numeric key.
            var _namespace = Number(key) == key ? _className : key;

            // Create new module instance
            instances[namespace] = this.setModule(_className, _namespace);
        }

        // Return instances collection
        return instances;
    }
});
