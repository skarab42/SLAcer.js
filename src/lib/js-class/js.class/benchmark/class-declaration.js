var JSClass = require('../src/js.class.js');
var Class = require('class');
var EEClass = require('ee-class');
var klass = require('klass');
var Benchmark = require('benchmark').Benchmark;

var suite = new Benchmark.Suite;

// add tests
suite.add('ee-class', function() {
    var Animal = new EEClass({
        init: function(){},
        eat: function() {},
        sleep: function() {}
    });

    var bobby = new Animal();
}).add('js.class', function() {
    var Animal = JSClass({
        create: function() {},
        eat: function() {},
        sleep: function() {}
    });

    var bobby = new Animal();
}).add('class', function() {
    var Animal = Class.new(function(){
        this.class.eat = function(){};
        this.class.sleep = function(){};
        this.initialize = function(){};
    });
    var bobby = Animal.new();
}).add('klass', function(){
    var Animal = klass(function(){

    }).methods({
        eat: function() {},
        sleep: function() {}
    });
    var bobby = new Animal();

}).on('cycle', function(event) {
    console.log(String(event.target));
}).on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
}).run();