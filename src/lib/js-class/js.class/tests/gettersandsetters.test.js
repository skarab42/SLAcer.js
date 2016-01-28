var JSClass = require('../src/js.class');
describe("Class getters/setters", function() {

    it("Class - get", function() {

        var Person = JSClass({
            get: {
                fullName: function () {
                    return this.name + " " + this.familyName;
                }
            },
            create: function(name, familyName) {
                this.name = name;
                this.familyName = familyName;

            }
        });

        var tommy = new Person("Tomee", "LeeJohnes");
        expect('fullName' in tommy).toBeTruthy();
        expect(tommy.hasOwnProperty('fullName')).toBeTruthy();
        expect(tommy.fullName).toEqual("Tomee LeeJohnes");

        var johnny = new Person("Johnny", "LeeJohnes");
        expect('fullName' in johnny).toBeTruthy();
        expect(johnny.hasOwnProperty('fullName')).toBeTruthy();
        expect(johnny.fullName).toEqual("Johnny LeeJohnes");

        var BetterPerson = Person.extend({
            get: {
                betterFullName: function() {
                    return this.title + " " + this.name + " " + this.familyName;
                }
            },
            create: function(title, name, familyName) {
                Person.prototype.create.apply(this, [name, familyName]);
                this.title = title;
            }
        });
        var betterTommy = new BetterPerson("Mr", "Tommy", "LiJohnes");
        expect('fullName' in betterTommy).toBeTruthy();
        expect(betterTommy.fullName).toEqual("Tommy LiJohnes");

        expect('betterFullName' in betterTommy).toBeTruthy();
        expect(betterTommy.hasOwnProperty('betterFullName')).toBeTruthy();
        expect(betterTommy.betterFullName).toEqual("Mr Tommy LiJohnes");

    });

    it("Class - set", function() {
        var Person = JSClass({
            set: {
                fullName: function (value) {
                    var name = value.split(' ');
                    this.name = name[0];
                    this.familyName = name[1];
                }
            },
            create: function(name, familyName) {
                this.name = name;
                this.familyName = familyName;

            }
        });

        var tommy = new Person("Tommy", "LeeJohnes");
        tommy.fullName = "Tommee LiJohnes";
        expect(tommy.name).toEqual("Tommee");
        expect(tommy.familyName).toEqual("LiJohnes");

        var johnny = new Person("Johnny", "LeeJohnes_the_Second");
        tommy.fullName = "Johnny LiJohnes_the_Second";
        expect(tommy.name).toEqual("Johnny");
        expect(tommy.familyName).toEqual("LiJohnes_the_Second");

        var BetterPerson = Person.extend({
            set: {
                betterFullName: function(value) {
                    var name = value.split(' ');
                    this.title = name[0];
                    this.name = name[1];
                    this.familyName = name[2];
                }
            },
            create: function(title, name, familyName) {
                Person.prototype.create.apply(this, [name, familyName]);
                this.title = title;
            }
        });

        var betterTommy = new BetterPerson("Mr", "Tommy", "LiJohnes");
        betterTommy.betterFullName = "Dr Tomee LeeJohnes";
        expect(betterTommy.title).toEqual("Dr");
        expect(betterTommy.name).toEqual("Tomee");
        expect(betterTommy.familyName).toEqual("LeeJohnes");

    });

    it("Class - get/set", function() {
        var Person = JSClass({
            get: {
                fullName: function () {
                    return this.name + " " + this.familyName;
                },
                upperCaseName: function() {
                    var name = this.name;
                    return name.toUpperCase();
                }
            },
            set: {
                fullName: function (value) {
                    var name = value.split(' ');
                    this.name = name[0];
                    this.familyName = name[1];
                }
            },
            create: function(name, familyName) {
                this.name = name;
                this.familyName = familyName;

            }
        });
        var tommy = new Person("Tommy", "LeeJohnes");
        expect('fullName' in tommy).toBeTruthy();
        expect(tommy.hasOwnProperty('fullName')).toBeTruthy();
        expect(tommy.fullName).toEqual("Tommy LeeJohnes");
        expect(tommy.hasOwnProperty('upperCaseName')).toBeTruthy();

        tommy.fullName = "Tommee LiJohnes";

        expect(tommy.name).toEqual("Tommee");
        expect(tommy.familyName).toEqual("LiJohnes");

        var johnny = new Person("Johnny", "LeeJohnes_the_Second");
        expect('fullName' in johnny).toBeTruthy();
        expect(johnny.hasOwnProperty('fullName')).toBeTruthy();
        expect(johnny.fullName).toEqual("Johnny LeeJohnes_the_Second");
        expect(johnny.hasOwnProperty('upperCaseName')).toBeTruthy();

        johnny.fullName = "Johnny LiJohnes_the_Second";

        expect(johnny.name).toEqual("Johnny");
        expect(johnny.familyName).toEqual("LiJohnes_the_Second");


    });
});
