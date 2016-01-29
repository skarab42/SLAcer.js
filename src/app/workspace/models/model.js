/**
* @class   AppWorkspaceModel
* @extends GuiModuleModel
*/
var AppWorkspaceModel = GuiModuleModel.extend(
{
    /**
    * Application name.
    *
    * @property appName
    * @type     {String}
    */
    appName: null,

    /**
    * Application codename.
    *
    * @property appCodeName
    * @type     {String}
    */
    appCodeName: null,

    /**
    * Application version.
    *
    * @property appVersion
    * @type     {String}
    */
    appVersion: null,

    /**
    * Observable array.
    *
    * @protected
    * @method columnOne
    * @param  {Array} [collection]
    * @return {Array}
    */
    columnOne: [],

    /**
    * Observable array.
    *
    * @protected
    * @method columnTwo
    * @param  {Array} [collection]
    * @return {Array}
    */
    columnTwo: [],

    /**
    * Model setup.
    *
    * Called by GuiModule, immediately after Module create().
    *
    * @method setup
    * @return {Mixed}
    */
    setup: function()
    {
        this.appName     = this.module.kernel.getConfig('name');
        this.appCodeName = this.module.kernel.getConfig('codename');
        this.appVersion  = this.module.kernel.getConfig('version');

        this.columnOne = ko.observableArray();
        this.columnTwo = ko.observableArray();
    }
});
