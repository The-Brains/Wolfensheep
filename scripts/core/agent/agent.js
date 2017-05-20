define([
    '../../util/agent-goals.js',
    '../random.js',
    '../localization/location.js',
    '../world/world-status.js',
], function (AgentGoals, Generator, Location, WorldStatus) {
    var Agent = function(objectDNA, location) {
        var myself = this;
        this.objectDNA = objectDNA;
        this.generator = new Generator(this.objectDNA.getDNA());
        this.previousLocations = [];
        this.location = location;

        this.currentGoal = null;
        this.target = null;

        this.age = 0;

        this.alive = true;

        this.weight = 0;
        this.threat = 0;

        var die = function() {
            myself.alive = false;
        }

        // SPEEDS
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
        ///////////////

        // FOOD PART
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
        ///////////////

        // Sleep
        this.tired = null;
        this.deathByExhaustion = null;
        this.exhaustionRate = null;
        this.exhaustionMove = null;
        var initializeSleep = function() {
            var sleepMaxOriginal = myself.generator.getInt(0, 30);
            myself.tired = myself.generator.getInt(0, sleepMaxOriginal);
            var bonusSleepSurvival = myself.generator.getFloatInRange(0.6, 5);
            myself.deathByExhaustion = myself.generator.getInt(
                sleepMaxOriginal,
                100 * bonusSleepSurvival
            );

            myself.exhaustionRate = myself.generator.getFloatInRange(0.1, sleepMaxOriginal / 3.0);
            myself.exhaustionMove = myself.generator.getFloatInRange(0, 1);
        }

        var spendEnergy = function(energySpent) {
            myself.tired = myself.tired + energySpent;

            if (myself.tired >= myself.deathByExhaustion) {
                die();
            }
        }
        /////////////

        // Extra Traits
        this.curiosity = null;
        this.playful = null;
        this.looseCuriosityWithAgeCoef = null;
        this.loosePlayfulWithAgeCoef = null;
        var initializeExtraTraits = function() {
            // curiosity
            myself.curiosity = myself.generator.getInt(10, 90);
            myself.looseCuriosityWithAgeCoef = myself.generator.getFloatInRange(0.01, 0.99);

            // playful
            myself.playful = myself.generator.getInt(10, 90);
            myself.loosePlayfulWithAgeCoef = myself.generator.getFloatInRange(0.01, 0.99);
        }

        var loseFun = function() {
            myself.curiosity = myself.curiosity * myself.looseCuriosityWithAgeCoef;
            myself.playful = myself.playful * myself.loosePlayfulWithAgeCoef;
        }

        // Brain
        var decideGoal = function() {
            var allGoals = _.cloneDeep(AgentGoals);

            if (!myself.alive) {
                myself.currentGoal = allGoals.dead;
                return myself.currentGoal;
            } else {
                allGoals.dead.score = 0;
            }

            allGoals.exploring.score = myself.curiosity;
            allGoals.play.score = myself.playful;

            // going to get food
            var closeToDieFromHunger = myself.deathByHunger - myself.hungry;
            allGoals.lookingForFood.score = 100.0 / closeToDieFromHunger;
            if (myself.target && myself.canEat(target)) {
                allGoals.lookingForFood.score = 0;
                allGoals.goingToTarget = 100.0 / closeToDieFromHunger;
            }

            // going to sleep
            var closeToDieFromExhaustion = myself.deathByExhaustion - myself.tired;
            allGoals.sleeping.score = 100.0 / closeToDieFromExhaustion;

            myself.currentGoal = _.head(_.sortBy(allGoals, function(g) {
                return g.score;
            }));

            return myself.currentGoal;
        }
        /////////////

        var moveTo = function(location) {
            if (!location) {
                myself.previousLocations.push(myself.location);
                return;
            }

            var distance = location.distance(myself.location);

            spendHunger(myself.hungerMove * distance);
            spendEnergy(myself.exhaustionMove * distance);

            myself.previousLocations.push(myself.location);
            myself.location = location;
        }

        this.cycle = function(newLocation = null) {
            decideGoal();
            moveTo(newLocation);
            spendHunger(this.hungerRate);
            spendEnergy(this.exhaustionRate);

            this.age += 0.1;
            loseFun();
        }

        var initAll = function() {
            initializeSpeeds();
            initializeHunger();
            initializeSleep();
            initializeExtraTraits();
        }

        initAll();
    };

    return Agent;
});
