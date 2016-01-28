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


// add tests
suite.add('ee-class', function() {


    var Mammal = new EEClass({
        inherits: EEAnimal,
        eatMilk: function() {}
    });

    var bobby = new Mammal();

}).add('js.class', function() {

    var Mammal = JSCAnimal.extend({
        eatMilk: function() {}
    });

    var bobby = new Mammal();

}).add('class', function() {


    var Mammal = CAnimal.subclass({
        eatMilk: function() {}
    });

    var bobby = Mammal.new();

}).add('klass', function() {

    var Mammal = KAnimal.extend({
        eatMilk: function() {}
    });

    var bobby = new Mammal();

}).on('cycle', function(event) {
    console.log(String(event.target));
}).on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
}).run();