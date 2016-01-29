/**
* Implement modules functionalities.
*
* @license   MIT
* @version   1.0.0
* @copyright 2016 Onl'Fait (http://www.onlfait.ch)
* @author    Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @link      https://github.com/lautr3k/Toys
* @module    Toys
* @submodule ToysModule
*/

/**
* Implement modules functionalities.
*
* - All __modules__ must extend this class or one of his children !
*
* @class   ToysModule
* @extends ToysCore
*/
var ToysModule = ToysCore.extend(
{
    /**
    * Module class name.
    *
    * @property name
    * @type     {String}
    */
    name: 'ToysModule',

    /**
    * Module id (class name lowecased).
    *
    * @property id
    * @type     {String}
    */
    id: 'toysmodule',

    /**
    * Kernel instance.
    *
    * @property kernel
    * @type     {ToysKernel}
    */
    kernel: null,

    /**
    * Class constructor.
    *
    * !!! Do not oweride this method.
    * --> Instead use __setup()__ for Module instanciation.
    *
    * @method create
    * @param {String} name Module class name in CamelCase style.
    */
    create: function(name)
    {
        this.name   = name;
        this.id     = name.toLowerCase();
        this.kernel = ToysKernel.instance();

        this.kernel.message('info', 'moduleCreated', { module: this.name });
    },

    /**
    * Setup the module.
    *
    * - Called once by Toys.addModule() after class instanciation.
    *
    * @method setup
    */
    setup: function() {},

    /**
    * Called after a module is setup.
    *
    * @event  onSetup
    * @param  {ToysModule} module
    * @param  {Mixed}       result The value returned by module.setup().
    */
    onSetup: function(module, result) {}
});
