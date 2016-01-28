var JSClass = require('../src/js.class');
describe("Class extend test", function() {

    it("Class - extend", function() {
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
        });

        var Dog = Pet.extend({
            bark: function() {
                this.noisy = true;
            }
        });


        var flaffy = new Dog();

        expect(flaffy instanceof Pet).toBeTruthy();
        expect(flaffy instanceof Dog).toBeTruthy();
        expect(typeof flaffy.create).toEqual('function');
        expect(typeof flaffy.eat).toEqual('function');
        expect(typeof flaffy.drink).toEqual('function');
        expect(typeof flaffy.bark).toEqual('function');

        expect(flaffy.noisy).toBeUndefined();
        flaffy.bark();
        expect(flaffy.noisy).toBeTruthy();

        expect(flaffy.hungry).toBeTruthy();
        flaffy.eat();
        expect(flaffy.hungry).toBeFalsy();

    });

    it("Class - extend with override", function() {
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
        });

        var Dog = Pet.extend({
            create: function() {
                this.noisy = false;
                Pet.prototype.create.apply(this, arguments);
            },
            bark: function() {
                this.noisy = true;
            }
        });

        var flaffy = new Dog();
        expect(flaffy.hungry).toBeTruthy();
        expect(flaffy.thirsty).toBeTruthy();
        expect(flaffy.noisy).toBeFalsy();

    });

});