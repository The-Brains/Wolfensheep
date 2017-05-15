define([
    '../random.js',
    '../localization/location.js',
    '../world/world-status.js',
], function (Generator, Location, WorldStatus) {
    var Agent = function(objectDNA, location) {
        var myself = this;
        this.objectDNA = objectDNA;
        this.generator = new Generator(this.objectDNA.getDNA());
        this.previousLocations = [];
        this.location = location;

        this.alive = true;

        this.tired = 0;
        this.weight = 0;
        this.threat = 0;

        var die = function() {
            myself.alive = false;
        }

        this.speeds = null; // array of speed for every terrains.
        this.canMove = true;
        var initializeSpeeds = function() {
            myself.speeds = {};

            var plantChance = myself.generator.getInt(2, 5);
            var plantRoll = myself.generator.getInt(0, plantChance);

            if (plantRoll === 1) {
                // is a plant
                _.forEach(WorldStatus.getAllPossibleType(), function(ws) {
                    var key = ws.serialize();
                    myself.speeds[key] = 0;
                });
                myself.canMove = false;
            } else {
                // is a moving creature
                // Speed boundaries
                myself.speedCoefficient = 1 + myself.generator.getFloat();
                myself.maxMaxSpeed = myself.generator.getInt(2, 5) * myself.speedCoefficient;
                myself.minSpeed = myself.generator.getFloatInRange(0, 0.9) * myself.speedCoefficient;
                myself.maxSpeed = myself.generator.getFloatInRange(
                    myself.minSpeed,
                    myself.maxMaxSpeed
                );

                _.forEach(WorldStatus.getAllPossibleType(), function(ws) {
                    var key = ws.serialize();
                    myself.speeds[key] = myself.generator.getFloatInRange(
                        myself.minSpeed,
                        myself.maxSpeed
                    );
                });
            }
        }

        this.isPlant = function() {
            return !this.canMove;
        }

        /**
        * get the speed of the agent for the given WorldStatus
        */
        this.getSpeed = function(worldStatus) {
            var key = worldStatus.serialize();
            return this.speeds[key];
        }

        this.hungry = null; // current hunger status.
        this.deathByHunger = null; // if hunger is above this, agent die.
        this.hungerRate = null; // hunger spend every cycle.
        this.hungerMove = null; // hunger spend every 1 unit of movement done.
        var initializeHunger = function() {
            var hungerMaxOriginal = myself.generator.getInt(0, 30);
            myself.hungry = myself.generator.getInt(0, hungerMaxOriginal);
            var bonusHungerSurvival = myself.generator.getFloatInRange(0.6, 5);
            myself.deathByHunger = myself.generator.getInt(
                hungerMaxOriginal,
                100 * bonusHungerSurvival
            );

            myself.hungerRate = myself.generator.getFloatInRange(0.1, hungerMaxOriginal / 3.0);
            myself.hungerMove = myself.generator.getFloatInRange(0, 1);
        }

        var spendHunger = function(hungerSpent) {
            myself.hungry = myself.hungry + hungerSpent;

            if (myself.hungry >= myself.deathByHunger) {
                die();
            }
        }

        var moveTo = function(location) {
            if (!location) {
                myself.previousLocations.push(myself.location);
                return;
            }

            var distance = location.distance(myself.location);

            spendHunger(myself.hungerMove * distance);

            myself.previousLocations.push(myself.location);
            myself.location = location;
        }

        this.cycle = function(newLocation = null) {
            moveTo(newLocation);
            spendHunger(this.hungerRate);
        }

        var initAll = function() {
            initializeSpeeds();
            initializeHunger();
        }

        initAll();
    };

    return Agent;
});
