var JSClass = require('../src/js.class');
describe("Class singleton", function() {

    it("Class - singleton", function() {

        var Pet = JSClass({
            singleton: true,
            create: function() {
                this.a = this.a || 0;
                this.a++;
            }
        });

        var d1 = Pet.instance();
        var d2 = Pet.instance();

        expect(d1 === d2).toBeTruthy();
        expect(d1.a).toEqual(1);
        expect(d2.a).toEqual(1);


        var Pet2 = JSClass({
            singleton: true,
            a: function() {
                return 'b';
            }
        });

        var d3 = Pet2.instance();

        expect(d1 === d2 !== d3).toBeTruthy();

        expect(typeof d3['a'] === 'function').toBeTruthy();

        var exception;
        try {
            new Pet2();
        } catch (e) {
            exception = e;
        }

        expect(exception instanceof Error).toBeTruthy();



    });

    it ("Class - singleton extend", function() {
        var Pet = JSClass({
            singleton: true,
            create: function() {
                this.a = this.a || 0;
                this.a++;
            }
        });

        var exception;
        try {
            Pet.extend({

            });
        } catch (e) {
            exception = e;
        }
        expect(exception instanceof Error).toBeTruthy();

    });

    it ("Class - extend as singleton", function() {
        var Pet = JSClass({
            create: function() {
                this.a = this.a || 0;
                this.a++;
            }
        });

        var MyPet = Pet.extend({
            singleton: true,
            create: function() {
                this.b = this.b || 0;
                this.b++;
            }
        });

        var exception;
        try {
            MyPet.extend({

            });
        } catch (e) {
            exception = e;
        }
        expect(exception instanceof Error).toBeTruthy();

        var p1 = new Pet();
        var p2 = new Pet();

        var p3 = MyPet.instance();
        var p4 = MyPet.instance();

        expect(p3 === p4).toBeTruthy();
        expect(p3 instanceof Pet && p3 instanceof MyPet).toBeTruthy();



    });




});