var JSClass = require('../src/js.class');
describe("Class basic test", function() {

    it("Class - declaration by function", function() {

        var Pet = JSClass(function Pet() {
            return {
                create: function () {
                    this._created = true;
                },
                getCreated: function() {
                    return this._created;
                },
                setCreated: function(val) {
                    this._created = val;
                }
            };
        });

        var d1 = new Pet();
        expect(d1.getCreated()).toBeTruthy();
        var d2 = new Pet();
        d2.setCreated(false);
        expect(d1.getCreated()).toBeTruthy();
        expect(d2.getCreated()).toBeFalsy();


    });

    it("Class - new no arguments", function() {
        var Pet = JSClass({
            create: function() {
                this.created = true;
            }
        });
        var dog = new Pet();
        expect(dog instanceof Pet).toBeTruthy();
        expect(dog.hasOwnProperty('created')).toBeTruthy();
        expect(dog.created).toBeTruthy();

    });

    it("Class - new with arguments", function() {
        var Pet = JSClass({
            create: function(arg1, arg2) {
                this.arg1 = arg1;
                this.arg2 = arg2;
            }
        });
        var dog1 = new Pet(1);
        expect(dog1.hasOwnProperty('arg1')).toBeTruthy();
        expect(dog1.hasOwnProperty('arg2')).toBeTruthy();
        expect(dog1.arg1).toEqual(1);
        expect(dog1.arg2).toEqual(undefined);
        var dog2 = new Pet(3,4);
        expect(dog1.arg1).toEqual(1);
        expect(dog1.arg2).toEqual(undefined);
        expect(dog2.arg1).toEqual(3);
        expect(dog2.arg2).toEqual(4);
        dog1.arg2 = 22;
        dog1.arg1 = 11;
        expect(dog1.arg1).toEqual(11);
        expect(dog1.arg2).toEqual(22);
        expect(dog2.arg1).toEqual(3);
        expect(dog2.arg2).toEqual(4);
    });

    it("Class - with methods", function() {
        var Pet = JSClass({
            create: function() {
                this.woof = false;
                this.hungry = true;
            },
            bark: function() {
                this.woof = true;
            },
            eat: function() {
                this.hungry = false;
            }
        });
        var dog = new Pet();
        var dog2 = new Pet();
        expect(dog instanceof Pet).toBeTruthy();
        expect(dog.hungry).toBeTruthy();
        expect(dog.woof).toBeFalsy();
        dog.bark();
        expect(dog.woof).toBeTruthy();
        dog.eat();
        expect(dog.hungry).toBeFalsy();
        expect(dog2.hungry).toBeTruthy();
        expect(dog2.woof).toBeFalsy();
    });

});