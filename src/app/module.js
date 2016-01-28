/**
* Application module (front controller).
*
* @module  SLAcer
* @class   App
* @extends JSClass
*/
var App = JSClass({
    /**
    * @property singleton
    */
    singleton: true,

    /**
    * Constructor.
    *
    * @constructor
    */
    create: function() {
        console.log('app running...')
    }
});
