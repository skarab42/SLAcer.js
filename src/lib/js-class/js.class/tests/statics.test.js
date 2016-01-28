var JSClass = require('../src/js.class');
describe("Class test", function() {

    it("Class - statics", function() {
        var Pet = JSClass({
            create: function() {
                this.hungry = true;
                this.thirsty = true;
            },
            eat: function() {
                this.hungry = false;
            },
            drink: function() {
                this.thirsty = false;
            }
        }).static({
            CONST_TEST: 'constTest',
            CONST_TEST_2: 'constTest2',
            staticTest: 'staticTest',
            staticTest2: 'staticTest2'
        });

        expect(Pet.CONST_TEST).toEqual('constTest');
        expect(Pet.CONST_TEST_2).toEqual('constTest2');
        expect(Pet.staticTest).toEqual('staticTest');
        expect(Pet.staticTest2).toEqual('staticTest2');
        Pet.CONST_TEST = 'fail';
        Pet.staticTest = 'pass';
        expect(Pet.CONST_TEST).toEqual('constTest');
        expect(Pet.staticTest).toEqual('pass');


        var dog = new Pet();
        expect(dog.CONST_TEST).toEqual('constTest');
        expect(dog.staticTest).toEqual('pass');




        var Pet2 = JSClass({singleton: true}).static({
            st1: {
                a: 1
            }
        });
        expect(Pet2.st1.a).toEqual(1);


    });



});
