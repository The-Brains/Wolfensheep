define([
    '../../util/agent-goals.js',
    '../random.js',
    '../localization/location.js',
    '../world/world-status.js',
    './dna-random-gene.js',
], function (AgentGoals, Generator, Location, WorldStatus, ObjectDNA) {
    var Agent = function(objectDNA, location) {
        var myself = this;
        var generator = new Generator(objectDNA.getDNA());
        var previousLocations = [];
        var currentLocation = location;
        var agentData = {
            alive: true,
            age: 0,
        };

        var currentGoal = null;
        var currentTarget = null;

        this.weight = 0;
        this.threat = 0;

        var die = function() {
            agentData.alive = false;
        }

        // SPEEDS
        agentData.speed = {};
        agentData.speed.speeds = null; // array of speed for every terrains.
        agentData.speed.canMove = true;
        var initializeSpeeds = function() {
            agentData.speed.speeds = {};

            var plantChance = generator.getInt(2, 5);
            var plantRoll = generator.getInt(0, plantChance);

            if (plantRoll === 1) {
                // is a plant
                _.forEach(WorldStatus.getAllPossibleType(), function(ws) {
                    var key = ws.serialize();
                    agentData.speed.speeds[key] = 0;
                });
                agentData.speed.canMove = false;
            } else {
                // is a moving creature
                // Speed boundaries
                var speedCoefficient = 1 + generator.getFloat();
                var maxMaxSpeed = generator.getInt(2, 5) * speedCoefficient;
                var minSpeed = generator.getFloatInRange(0, 0.9) * speedCoefficient;
                var maxSpeed = generator.getFloatInRange(
                    minSpeed,
                    maxMaxSpeed
                );

                _.forEach(WorldStatus.getAllPossibleType(), function(ws) {
                    var key = ws.serialize();
                    agentData.speed.speeds[key] = generator.getFloatInRange(
                        minSpeed,
                        maxSpeed
                    );
                });
            }
        }

        this.isPlant = function() {
            return !agentData.speed.canMove;
        }

        /**
        * get the speed of the agent for the given WorldStatus
        */
        this.getSpeed = function(worldStatus) {
            var key = worldStatus.serialize();
            return agentData.speed.speeds[key];
        }
        ///////////////

        // FOOD PART
        agentData.food = {};
        agentData.food.hungry = null; // current hunger status.
        agentData.food.deathByHunger = null; // if hunger is above this, agent die.
        agentData.food.hungerRate = null; // hunger spend every cycle.
        agentData.food.hungerMove = null; // hunger spend every 1 unit of movement done.
        var initializeHunger = function() {
            var hungerMaxOriginal = generator.getInt(0, 30);
            agentData.food.hungry = generator.getInt(0, hungerMaxOriginal);
            var bonusHungerSurvival = generator.getFloatInRange(0.6, 5);
            agentData.food.deathByHunger = generator.getInt(
                hungerMaxOriginal,
                100 * bonusHungerSurvival
            );

            agentData.food.hungerRate = generator.getFloatInRange(0.1, hungerMaxOriginal / 3.0);
            agentData.food.hungerMove = generator.getFloatInRange(0, 1);
        }

        var spendHunger = function(hungerSpent) {
            agentData.food.hungry = agentData.food.hungry + hungerSpent;

            if (agentData.food.hungry >= agentData.food.deathByHunger) {
                die();
            }
        }

        this.canEat = function(agent) {
            // TODO
            return true;
        }
        ///////////////

        // Reproduction
        agentData.reproduction = {};
        agentData.reproduction.kidQuantity = null;
        var initializeReproductiveFunction = function() {
            agentData.reproduction.kidQuantity = {
                min: null,
                max: null,
            };
            var maxPossibleKid = generator.getInt(1, 100) * generator.getFloatInRange(0.1, 0.6);
            agentData.reproduction.kidQuantity.max = generator.getInt(1, maxPossibleKid);
            agentData.reproduction.kidQuantity.min = generator.getInt(1, agentData.reproduction.kidQuantity.max);
            agentData.reproduction.mutationRate = generator.getInt(0, 100);
            agentData.reproduction.failingBirthRate = generator.getInt(0, 100);

            // TODO: create a way so agent has to wait N cycle before reproducing again.
        }

        this.canReproduceWith = function(agent) {
            // TODO
            return true;
        }

        var createChildWith = function(agent) {
            var myDNA = myself.getDNA();
            var myDNALength = myDNA.length;
            var otherDNA = agent.getDNA();
            var otherDNALength = otherDNA.length;

            var newLocation = myself.getLocation();

            var newDNA = '';

            for (var i = 0; i < Math.max(myDNALength, otherDNALength); i++) {
                var gene = '';
                var myDNAAvailable = i < myDNALength;
                var otherDNAAvailable = i < otherDNALength;
                var willMutate = generator.getInt(0, 100) < agentData.reproduction.mutationRate;
                var WillStop = i > (myDNALength + otherDNALength) / 2.0 * (0.5 + generator.getFloat());

                if (WillStop) {
                    break;
                }

                if (willMutate) {
                    newDNA[i] = generator.getChar();
                } else {
                    if (myDNAAvailable && otherDNAAvailable) {
                        newDNA[i] = generator.getInt(0, 100) < 50
                            ? myDNA[i]
                            : otherDNA[i];
                    }

                    if (!myDNAAvailable && !otherDNAAvailable) {
                        newDNA[i] = generator.getChar();
                    }

                    if (!myDNAAvailable && otherDNAAvailable) {
                        newDNA[i] = otherDNA[i];
                    }

                    if (myDNAAvailable && !otherDNAAvailable) {
                        newDNA[i] = myDNA[i];
                    }
                }
            }

            var newObjectDNA = new ObjectDNA(newDNA);

            var child = new Agent(newObjectDNA, newLocation);

            if (generator.getInt(0, 100) < agentData.reproduction.failingBirthRate) {
                child.kill();
            }

            return child;
        }

        this.reproduceWith = function(agent) {
            var kidQuantity = generator.getInt(
                agentData.reproduction.kidQuantity.min,
                agentData.reproduction.kidQuantity.max
            );
            var kids = [];

            _.times(kidQuantity, function() {
                kids.push(createChildWith(agent));
            });

            return kids;
        }
        ///////////////


        // Sleep
        agentData.energy = {};
        agentData.energy.tired = null;
        agentData.energy.deathByExhaustion = null;
        agentData.energy.exhaustionRate = null;
        agentData.energy.exhaustionMove = null;
        var initializeSleep = function() {
            var sleepMaxOriginal = generator.getInt(0, 30);
            agentData.energy.tired = generator.getInt(0, sleepMaxOriginal);
            var bonusSleepSurvival = generator.getFloatInRange(0.6, 5);
            agentData.energy.deathByExhaustion = generator.getInt(
                sleepMaxOriginal,
                100 * bonusSleepSurvival
            );

            agentData.energy.exhaustionRate = generator.getFloatInRange(0.1, sleepMaxOriginal / 3.0);
            agentData.energy.exhaustionMove = generator.getFloatInRange(0, 1);
        }

        var spendEnergy = function(energySpent) {
            agentData.energy.tired = agentData.energy.tired + energySpent;

            if (agentData.energy.tired >= agentData.energy.deathByExhaustion) {
                die();
            }
        }
        /////////////

        // Extra Traits
        agentData.playful = {};
        agentData.playful.curiosity = null;
        agentData.playful.playful = null;
        agentData.playful.looseCuriosityWithAgeCoef = null;
        agentData.playful.loosePlayfulWithAgeCoef = null;
        var initializeExtraTraits = function() {
            // curiosity
            agentData.playful.curiosity = generator.getInt(10, 90);
            agentData.playful.looseCuriosityWithAgeCoef = generator.getFloatInRange(0.01, 0.99);

            // playful
            agentData.playful.playful = generator.getInt(10, 90);
            agentData.playful.loosePlayfulWithAgeCoef = generator.getFloatInRange(0.01, 0.99);
        }

        var loseFun = function() {
            agentData.playful.curiosity =
                agentData.playful.curiosity * agentData.playful.looseCuriosityWithAgeCoef;
            agentData.playful.playful =
                agentData.playful.playful * agentData.playful.loosePlayfulWithAgeCoef;
        }
        /////////////

        // Brain
        var decideGoal = function() {
            var allGoals = _.cloneDeep(AgentGoals);

            if (!agentData.alive) {
                currentGoal = allGoals.dead;
                return currentGoal;
            } else {
                allGoals.dead.score = 0;
            }

            allGoals.exploring.score = agentData.playful.curiosity;
            allGoals.play.score = agentData.playful.playful;

            // going to get food
            var closeToDieFromHunger = agentData.food.deathByHunger - agentData.food.hungry;
            allGoals.lookingForFood.score = 100.0 / closeToDieFromHunger;
            if (currentTarget && myself.canEat(currentTarget)) {
                allGoals.lookingForFood.score = 0;
                allGoals.goingToTarget = 100.0 / closeToDieFromHunger;
            }

            // going to sleep
            var closeToDieFromExhaustion =
                agentData.energy.deathByExhaustion - agentData.energy.tired;
            allGoals.sleeping.score = 100.0 / closeToDieFromExhaustion;

            currentGoal = _.head(_.sortBy(allGoals, function(g) {
                return g.score;
            }));

            return currentGoal;
        }

        this.getCurrentGoal = function() {
            return currentGoal;
        }
        /////////////

        var moveTo = function(location) {
            if (!location) {
                previousLocations.push(currentLocation);
                return;
            }

            var distance = location.distance(currentLocation);

            spendHunger(agentData.food.hungerMove * distance);
            spendEnergy(agentData.energy.exhaustionMove * distance);

            previousLocations.push(currentLocation);
            currentLocation = location;
        }

        this.cycle = function(newLocation = null) {
            decideGoal();
            moveTo(newLocation);
            spendHunger(agentData.food.hungerRate);
            spendEnergy(agentData.energy.exhaustionRate);

            agentData.age += 0.1;
            loseFun();
        }

        this.kill = function() {
            agentData.alive = false;
        }

        // GET METHODS
        this.getLocation = function() {
            return currentLocation;
        }

        this.getAge = function() {
            return agentData.age;
        }

        this.getData = function() {
            return agentData;
        }

        this.getDNA = function() {
            return objectDNA.getDNA();
        }
        /////////////

        this.serialize = function() {
            return JSON.stringify(agentData);
        }

        var initAll = function() {
            initializeSpeeds();
            initializeHunger();
            initializeSleep();
            initializeExtraTraits();
            initializeReproductiveFunction();
        }

        initAll();
    };

    Agent.createNewAgent = function(generator, location) {
        var dna = ObjectDNA.createNewDNA(generator);
        return new Agent(dna, location);
    }

    return Agent;
});
