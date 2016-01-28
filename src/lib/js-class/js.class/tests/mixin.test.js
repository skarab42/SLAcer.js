var JSClass = require('../src/js.class');
describe("Class test", function() {

    it("Class - mixins", function() {

        var Other = JSClass({
            other: function(){}
        });

        var Other2 = JSClass({
            other2: function() {}
        });

        var Pet = JSClass({
            name: function() {
                return 'flaffy';
            }
        });

        function unusedMixin() {};

        var Animal = JSClass({
            eat: function() {
                this.hungry = false;
            },
            drink: function() {
                this.thirsty = false;
            }
        });

        var Dog = JSClass({
            create: function() {
                this.hungry = true;
                this.thirsty = true;
            }
        }).mixin(Animal, Pet);

        var flaffy = new Dog();

        expect(flaffy.hungry).toBeTruthy();
        expect(flaffy.thirsty).toBeTruthy();
        expect(typeof flaffy['eat'] === 'function').toBeTruthy();
        expect(typeof flaffy['drink'] === 'function').toBeTruthy();
        expect(typeof flaffy['name'] === 'function').toBeTruthy();
        expect(flaffy.typeOf(Animal)).toBeTruthy();
        expect(flaffy.typeOf(Pet)).toBeTruthy();
        expect(flaffy.typeOf(Dog)).toBeTruthy();
        expect(flaffy.typeOf(unusedMixin)).toBeFalsy();

        flaffy.eat();
        expect(flaffy.hungry).toBeFalsy();

        var ManyOthers = JSClass({}).mixin(Other, Other2);

        var o = new ManyOthers();
        expect(o.typeOf(Animal)).toBeFalsy();
        expect(o.typeOf(Pet)).toBeFalsy();
        expect(o.typeOf(Dog)).toBeFalsy();
        expect(o.typeOf(ManyOthers)).toBeTruthy();
        expect(o.typeOf(Other)).toBeTruthy();
        expect(o.typeOf(Other2)).toBeTruthy();

        var Literal = {
            doA: function() {}
        };

        ManyOthers.mixin(Literal);

        var mo = new ManyOthers();
        expect(mo.typeOf(Literal)).toBeTruthy();
        expect(typeof mo['doA'] === 'function').toBeTruthy();

    });

});