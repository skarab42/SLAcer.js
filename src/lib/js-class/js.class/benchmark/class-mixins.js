var JSClass = require('../src/js.class.js');
var Class = require('class');
var EEClass = require('ee-class');
var klass = require('klass');
var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite;

var EEAnimal = new EEClass({
    init: function(){},
    eat: function() {},
    sleep: function() {}
});

var JSCAnimal = JSClass({
    create: function() {},
    eat: function() {},
    sleep: function() {}
});

var CAnimal = Class.new(function(){
    this.class.eat = function(){};
    this.class.sleep = function(){};
    this.initialize = function(){};
});

var KAnimal = klass(function(){

}).methods({
    eat: function() {},
    sleep: function() {}
});


var MixinObject = {
    isWarmBlooded: function() {
        return true;
    }
};

var MixinClass = function() {};
MixinClass.prototype.isWarmBlooded = function() {return true;};//mixin can be also js class definition



// add tests
suite.add('ee-class', function() {

    var bobby = new EEAnimal();
    EEClass.implement(bobby, MixinObject);

}).add('js.class', function() {

    JSCAnimal.mixin(MixinObject);
    var bobby = new JSCAnimal();

}).add('class', function() {

    CAnimal.include(MixinObject);
    var bobby = CAnimal.new();

}).add('klass', function() {

    var bobby = new KAnimal();
    bobby.implement(MixinObject);

}).on('cycle', function(event) {
    console.log(String(event.target));
}).on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
}).run();