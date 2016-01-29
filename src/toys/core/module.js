/**
* Implement core functionalities.
*
* @license   MIT
* @version   1.0.0
* @copyright 2016 Onl'Fait (http://www.onlfait.ch)
* @author    Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @link      https://github.com/lautr3k/Toys
* @module    Toys
* @submodule ToysCore
*/

/**
* Implement core functionalities shared by Toys and his modules.
*
* @class     ToysCore
* @extends   JSClass
* @uses      lib/lodash
*/
var ToysCore = JSClass(
{
    /**
    * Get property value at 'dotted.path.index'.
    *
    * @method get
    * @param  {String} path
    * @param  {Mixed}  [defaultValue]
    * @return {Mixed}
    */
    get: function(path, defaultValue)
    {
        return _.get(this, path, defaultValue);
    },

    /**
    * Set property value at 'dotted.path.index'.
    *
    * @method set
    * @param  {String} path
    * @param  {Mixed}  value
    * @chainable
    */
    set: function(path, value)
    {
        return _.set(this, path, value);
    },

    /**
    * Return if has property at 'dotted.path.index'.
    *
    * @method has
    * @param  {String} path
    * @return {Boolean}
    */
    has: function(path)
    {
        return _.has(this, path);
    },

    /**
     * Get config value at 'dotted.path.index'.
     *
     * @method getConfig
     * @param  {String} path
     * @param  {Mixed}  [defaultValue]
     * @return {Mixed}
     */
    getConfig: function(path, defaultValue)
    {
        return (this.kernel || this).get('config.' + path, defaultValue);
    },

    /**
     * Get translated and formatted text for current language at 'dotted.path.index'.
     *
     * @method getText
     * @param  {String} path
     * @param  {Mixed}  [data]
     * @param  {String} [lang=en]
     * @throws {Error}
     * @return {String}
     */
    getText: function(path, data, lang)
    {
        var toys = this.kernel || this;

        lang  = lang || this.getConfig('lang', 'en');

        var rootKey  = 'texts.' + lang + '.';
        var localKey = this.name + '.' + path;

        var key  = rootKey + localKey;
        var text = toys.get(key);

        // Local key does not exist
        if (! text)
        {
            // Text fall back in global scope
            text = toys.get(rootKey + path);

            // Do not notify next time
            toys.set(key, text || path);

            if (! text)
            {
                // Text fall back to input path
                text = path;

                // Print a warning message in the console
                this.message('warn', 'Toys.undefinedTextPath',
                {
                    path: localKey,
                    lang: lang
                });
            }
        }

        try
        {
            if (data)
            {
                // Use lodash template to format the text
                text = _.template(text)(data || {});
            }
        }
        catch (error)
        {
            // Throw custom error
            this.error('Toys.parseTextError',
            {
                error: error,
                lang : lang,
                path : localKey,
                text : text
            });
        }

        return text;
    },

    /**
    * Console message wrapper with translation and formatting.
    *
    * @method message
    * @param  {String} type
    * @param  {String} text
    * @param  {Object} [data]
    * @return {String}
    */
    message: function(type, text, data)
    {
        // Get translated/formatted text
        text = this.getText(text, data);

        // Print text in console prefixed with module name
        console[type](this.name + ' >>> ' + text);

        // Return translated/formatted text
        return text;
    },

    /**
    * Throw and log an error with message translation and formatting.
    *
    * @method error
    * @param  {String} text
    * @param  {Object} [data]
    */
    error: function(text, data)
    {
        throw this.message('error', text, data);
    },

    /**
    * Get local store as object.
    *
    * @method getLocalStore
    * @param  {String} [namespace]
    * @return {Object} { namespace: 'namespace', data: { ... }}
    */
    getLocalStore: function(namespace)
    {
        // Get the namespace
        var namespace = namespace || this.name;

        // Get the local storage value (JSON)
        var data = window.localStorage.getItem(namespace);

        // If set, parse JSON string as Object
        data = data ? JSON.parse(data) : {};

        return { namespace: namespace, data: data };
    },

    /**
    * Get local item.
    *
    * @method getLocal
    * @param  {String} path
    * @param  {Mixed}  [defaultValue]
    * @param  {String} [namespace]
    * @return {Mixed}
    */
    getLocal: function(path, defaultValue, namespace)
    {
        return _.get(this.getLocalStore(namespace).data, path, defaultValue);
    },

    /**
    * Set local item.
    *
    * @method setLocal
    * @param  {String} path
    * @param  {Mixed}  [value]
    * @param  {String} [namespace]
    * @chainable
    */
    setLocal: function(path, value, namespace)
    {
        // Get the local store as Object
        var store = this.getLocalStore(namespace);

        // Set/Update the new value
        _.set(store.data, path, value);

        // Stringifiy the store Object
        var data = JSON.stringify(store.data);

        // Set/Update the local store
        window.localStorage.setItem(store.namespace, data);

        // Chainable
        return this;
    },

    /**
    * Clear one or all namespace(s).
    *
    * @method clearLocal
    * @param  {String} [namespace]
    * @chainable
    */
    clearLocal: function(namespace)
    {
        if (! namespace) window.localStorage.clear();
        else window.localStorage.removeItem(namespace);

        return this;
    },

    /**
    * Trigger an event to notify all modules.
    *
    * @example
    *
    *     // Call onSetup() on all registrered modules.
    *     this.trigger('setup', data);
    *
    * @method triggerEvent
    * @param  {String}    eventName
    * @param  {Mixed}     [data]
    * @param  {ToysCore} [caller=this]
    * @chainable
    */
    triggerEvent: function(eventName, data, caller)
    {
        var method = 'on' + _.capitalize(eventName);
        var toys  = this.kernel || this;
        var caller = caller || this;

        // For each registered modules
        for (var namespace in toys.modules)
        {
            var module = toys.getModule(namespace);

            // If the is a valid method
            if (module[method] && _.isFunction(module[method]))
            {
                module[method].call(module, caller, data || {});
            }
        }

        return this;
    }
});
