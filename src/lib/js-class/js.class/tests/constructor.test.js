var JSClass = require('../src/js.class');
describe("Class tests", function() {
    it("Class - constructor tests", function() {
        var A = JSClass({});
        var B = A.extend({});
        var C = B.extend({});

        var x = new A();
        var y = new B();
        var z = new C();

        expect(x.constructor == A).toBeTruthy();
        expect(y.constructor == B).toBeTruthy();
        expect(z.constructor == C).toBeTruthy();

        expect(x.constructor == B).toBeFalsy();
        expect(y.constructor == C).toBeFalsy();
        expect(z.constructor == A).toBeFalsy();

        expect(x.constructor == C).toBeFalsy();
        expect(y.constructor == A).toBeFalsy();
        expect(z.constructor == B).toBeFalsy();




    });

});