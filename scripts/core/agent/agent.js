define([
    'lodash',
    '../../util/agent-goals.js',
    '../random.js',
    '../localization/location.js',
    '../../util/world-parameters.js',
    './dna-random-gene.js',
    './intent.js',
], function (_, AgentGoals, Generator, Location, WorldParameters, ObjectDNA, Intent) {
    var MAX_HISTORY_LENGTH = 5;

    var Agent = function(objectDNA, location, initialize=true) {
        var myself = this;
        if (initialize) {
            var generator = new Generator(objectDNA.getDNA());
        }
        var previousLocations = [];
        var currentLocation = location;

        var id = null;

        var causeOfDeath = null;

        var agentData = {
            alive: true,
            age: 0,
            hadChild: 0,
        };

        var containerWorld = null;

        this.threat = 0;

        var intent = new Intent();

        var die = function(deathCause) {
            agentData.alive = false;
            causeOfDeath = deathCause;

            if(!_.isNil(myself.getWorld())) {
                myself.getWorld().removeAgent(myself, currentLocation);
            }

            if (window.agentDeathDebug) {
                console.log(`Agent #${id}: Die from '${causeOfDeath}'.`);
            }
        };

        // SPEEDS
        agentData.speed = {};
        agentData.speed.mainSpeed = null;
        agentData.speed.speeds = null; // array of speed for every terrains.
        agentData.speed.canMove = true;
        var initializeSpeeds = function() {
            agentData.speed.speeds = {};

            var plantChance = generator.getInt(2, 5);
            var plantRoll = generator.getInt(0, plantChance);
            var speedCoefficient = 1 + generator.getFloat();

            if (plantRoll === 1) {
                // is a plant
                agentData.speed.mainSpeed = 0;
                agentData.speed.canMove = false;
            } else {
                // is a moving creature
                // Speed boundaries
                var maxMaxSpeed = generator.getInt(2, 5) * speedCoefficient;
                var minSpeed = generator.getFloatInRange(0, 0.9) * speedCoefficient;
                var maxSpeed = generator.getFloatInRange(
                    minSpeed,
                    maxMaxSpeed
                );
                agentData.speed.mainSpeed = generator.getFloatInRange(
                    minSpeed,
                    maxSpeed
                );
            }
            var seed = objectDNA.getSpeedSeed();

            // Second generator so if we decide to add new terrains,
            // the rest of the number generated by the main generator won't change.
            var speedGenerator = new Generator(seed);

            _.forEach(WorldParameters, function(terrainParamters, terrainParameterName) {
                agentData.speed.speeds[terrainParameterName] = {};
                _.forEach(terrainParamters, function(option) {
                    agentData.speed.speeds[terrainParameterName][option] =
                        speedGenerator.getFloatInRange(0, speedCoefficient);
                });
            });
        };

        this.isPlant = function() {
            return !agentData.speed.canMove;
        };

        /**
        * get the speed of the agent for the given WorldStatus
        */
        this.getSpeed = function(worldStatus) {
            var speed = agentData.speed.mainSpeed;
            _.forEach(worldStatus.getParameters(), function(option ,terrainParamter) {
                speed = speed * agentData.speed.speeds[terrainParamter][option];
            });
            return speed;
        };
        ///////////////

        // Global feature
        agentData.global = {};
        agentData.global.radiusVision = null;
        agentData.global.attentionTargetSpan = null;
        agentData.global.actionDistance = null;
        var initializeGlobalFeature = function() {
            var visionMax = generator.getInt(
                0,
                _.isNil(containerWorld)
                    ? 30
                    : (containerWorld.getWidth() + containerWorld.getHeight()) / 4
            );
            agentData.global.radiusVision = generator.getFloatInRange(1, visionMax);

            agentData.global.attentionTargetSpan = generator.getInt(1, 10);

            agentData.global.actionDistance = generator.getFloatInRange(0.5, 3);
        };

        // FOOD PART
        agentData.food = {};
        agentData.food.hungry = null; // current hunger status.
        agentData.food.deathByHunger = null; // if hunger is above this, agent die.
        agentData.food.hungerRate = null; // hunger spend every cycle.
        agentData.food.hungerMove = null; // hunger spend every 1 unit of movement done.
        agentData.food.weight = null;
        agentData.food.conversionRate = null;
        agentData.food.weightLossRate = null;
        agentData.food.weightLossMove = null;
        var initializeHunger = function() {
            var hungerMaxOriginal = generator.getInt(0, 20);
            agentData.food.hungry = generator.getInt(0, hungerMaxOriginal);
            var bonusHungerSurvival = generator.getFloatInRange(0.7, 5);
            agentData.food.deathByHunger = generator.getInt(
                hungerMaxOriginal,
                100 * bonusHungerSurvival
            );

            agentData.food.weight =

            agentData.food.hungerRate = generator.getFloatInRange(0.1, hungerMaxOriginal / 3.0);
            agentData.food.hungerMove = generator.getFloatInRange(0, 1);

            agentData.food.weight = generator.getInt(2, 1000 / agentData.food.hungry);
            agentData.food.conversionRate = generator.getFloatInRange(0.01, 1);
            agentData.food.weightGainRate =
                generator.getFloatInRange(agentData.food.conversionRate, 1.5);
            agentData.food.weightLossRate = generator.getFloatInRange(0.01, 0.5);
            agentData.food.weightLossMove =  generator.getFloatInRange(0.02, 0.7);
        };

        var spendHunger = function(hungerSpent) {
            agentData.food.hungry = agentData.food.hungry + hungerSpent;

            if (agentData.food.hungry >= agentData.food.deathByHunger) {
                die('starvation');
            }
        };

        var spendWeight = function(weightSpent) {
            agentData.food.weight = agentData.food.weight - weightSpent;

            if (agentData.food.weight <= 0) {
                die('weightless');
            }
        }

        this.canEat = function(agent) {
            if (!agent.isAlive()) {
                return false;
            }
            return agent.getData().food.weight <= agentData.food.weight;
        };

        this.eatTarget = function(agent) {
            var consumedWeight = agent.getData().food.weight;

            var caloriesAbsorbed = consumedWeight * agentData.food.conversionRate;
            var weightGain = consumedWeight * agentData.food.weightGainRate;

            agentData.food.weight = agentData.food.weight + weightGain;

            agentData.food.hungry = agentData.food.hungry - caloriesAbsorbed;
            if (agentData.food.hungry < 0) {
                agentData.food.hungry = 0;
            }

            agent.kill('eaten');
        }
        ///////////////

        // Reproduction
        agentData.reproduction = {};
        agentData.reproduction.kidQuantity = {
            min: null,
            max: null,
        };
        agentData.reproduction.mutationRate = null;
        agentData.reproduction.failingBirthRate = null;
        agentData.reproduction.waitingPeriod = null;
        agentData.reproduction.timeToNextKid = 0;
        agentData.reproduction.ageToReproduction = null;
        var initializeReproductiveFunction = function() {
            var maxPossibleKid = generator.getInt(1, 100) * generator.getFloatInRange(0.1, 0.6);
            agentData.reproduction.kidQuantity.max = generator.getInt(1, maxPossibleKid);
            agentData.reproduction.kidQuantity.min =
                generator.getInt(1, agentData.reproduction.kidQuantity.max);

            var maxMutationRate = generator.getFloatInRange(0, 0.9);
            agentData.reproduction.mutationRate = generator.getFloatInRange(0, maxMutationRate);

            var maxFailingBirthRate = generator.getFloatInRange(0, 0.9);
            agentData.reproduction.failingBirthRate =
                generator.getFloatInRange(0, maxFailingBirthRate);

            agentData.reproduction.ageToReproduction =
                generator.getFloatInRange(0.2, 5);

            // TODO: When we run a few agent, we need to see how many cycle they live
            // in average. We want them to be able to reproduce at least once.
            // the max of this number should be 1.5 times their life expectancy.
            var maxWaitingTime = generator.getInt(2, 50);
            agentData.reproduction.waitingPeriod = generator.getInt(1, maxWaitingTime);
        };

        this.canReproduceWith = function(agent) {
            if (!agent.isAlive()) {
                return false;
            }
            if (agentData.reproduction.timeToNextKid > 0) {
                return false;
            }
            if (agent.getData().reproduction.timeToNextKid > 0) {
                return false;
            }

            // TODO
            return true;
        };

        var createChildWith = function(agent) {
            if (!myself.canReproduceWith(agent) || !agent.canReproduceWith(myself)) {
                return null;
            }
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
                var willMutate = generator.getFloat() < agentData.reproduction.mutationRate;
                var WillStop = i > (myDNALength + otherDNALength) / 2.0 * (0.5 + generator.getFloat());

                if (WillStop) {
                    break;
                }

                if (willMutate) {
                    newDNA += generator.getChar();
                } else {
                    if (myDNAAvailable && otherDNAAvailable) {
                        newDNA += generator.getFloat() <= 0.5
                            ? myDNA[i]
                            : otherDNA[i];
                    }

                    if (!myDNAAvailable && !otherDNAAvailable) {
                        newDNA += generator.getChar();
                    }

                    if (!myDNAAvailable && otherDNAAvailable) {
                        newDNA += otherDNA[i];
                    }

                    if (myDNAAvailable && !otherDNAAvailable) {
                        newDNA += myDNA[i];
                    }
                }
            }

            var newObjectDNA = new ObjectDNA(newDNA);
            var child = new Agent(newObjectDNA, newLocation);

            if (!_.isNil(containerWorld)) {
                containerWorld.addNewAgent(newLocation, child);
            }

            agentData.hadChild = agentData.hadChild + 1;

            if (generator.getFloat() < agentData.reproduction.failingBirthRate) {
                child.kill('born dead');
            }

            return child;
        };

        this.reproduceWith = function(agent) {
            if (!myself.canReproduceWith(agent) || !agent.canReproduceWith(myself)) {
                return [];
            }

            var kidQuantity = generator.getInt(
                agentData.reproduction.kidQuantity.min,
                agentData.reproduction.kidQuantity.max
            );
            var kids = [];

            _.times(kidQuantity, function() {
                kids.push(createChildWith(agent));
            });

            agentData.reproduction.timeToNextKid = agentData.reproduction.waitingPeriod;
            agent.getData().reproduction.timeToNextKid = agent.getData().reproduction.waitingPeriod;

            return kids;
        };
        ///////////////

        // Sleep
        agentData.energy = {};
        agentData.energy.tired = null;
        agentData.energy.deathByExhaustion = null;
        agentData.energy.exhaustionRate = null;
        agentData.energy.exhaustionMove = null;
        agentData.energy.recoverRate = null;
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
            agentData.energy.recoverRate = generator.getFloatInRange(
                agentData.energy.exhaustionRate,
                sleepMaxOriginal / 2.0);
        };

        var spendEnergy = function(energySpent) {
            agentData.energy.tired = agentData.energy.tired + energySpent;

            if (agentData.energy.tired >= agentData.energy.deathByExhaustion) {
                die('exhaustion');
            }
        };
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
        };

        var loseFun = function() {
            agentData.playful.curiosity =
                agentData.playful.curiosity * agentData.playful.looseCuriosityWithAgeCoef;
            agentData.playful.playful =
                agentData.playful.playful * agentData.playful.loosePlayfulWithAgeCoef;
        };
        /////////////

        // Brain
        this.decideGoal = function(closestOtherAgent = {}) {
            // TODO: Should build a system which for each "Goal" has 4 steps
            // intent / search / move / action
            var allGoals = _.cloneDeep(AgentGoals);

            if (!agentData.alive) {
                allGoals.dead.score = 1000;
                return allGoals.dead;
            } else {
                allGoals.dead.score = 0;
            }

            // Fun
            if (!myself.isPlant()) {
                allGoals.exploring.score = agentData.playful.curiosity;
            }
            allGoals.play.score = agentData.playful.playful;
            ////

            // going to get food
            var closeToDieFromHunger = agentData.food.deathByHunger - agentData.food.hungry;
            allGoals.food.score = 100.0 / closeToDieFromHunger;
            /////

            // going to sleep
            var closeToDieFromExhaustion =
                agentData.energy.deathByExhaustion - agentData.energy.tired;
            allGoals.sleeping.score = 100.0 / closeToDieFromExhaustion;
            //////

            // reproduce
            if (allGoals.food.score < 70
                && allGoals.sleeping.score < 70
                && agentData.age >= agentData.reproduction.ageToReproduction) {

                var closeToAbleToReproduce =
                    agentData.reproduction.timeToNextKid / agentData.reproduction.waitingPeriod;
                allGoals.reproduction.score = 100 - (closeToAbleToReproduce * 100.0);
            }
            /////

            var currentGoal = _.head(_.sortBy(allGoals, function(g) {
                if (_.isNil(g.score)) {
                    return 0;
                }
                return -g.score;
            }));

            return currentGoal;
        };

        this.decideTarget = function(closestAgents, currentGoal) {
            switch(currentGoal.name) {
                case 'sleep':
                    return {};
                case 'dead':
                case 'play':
                    return {
                        noAction: true,
                    }
                case 'food':
                    var target = _.find(closestAgents, (agentItem) => {
                        return myself.canEat(agentItem.agent);
                    });
                    if (_.isNil(target)) {
                        return myself.decideTarget(closestAgents, AgentGoals.exploring);
                    }
                    return {
                        agent: target.agent,
                        location: target.agent.getLocation(),
                    };
                case 'reproduction':
                    var mate = _.find(closestAgents, (agentItem) => {
                        return myself.canReproduceWith(agentItem.agent);
                    });
                    if (_.isNil(mate)) {
                        return myself.decideTarget(closestAgents, AgentGoals.exploring);
                    }
                    return {
                        agent: mate.agent,
                        location: mate.agent.getLocation(),
                    };
                default:
                    console.error('[decideTarget] Not parsed goal: ' + currentGoal.name);
                case 'exploring':
                    if (_.isNil(containerWorld)) {
                        var newLocation = new Location(
                            currentLocation.getX() + generator.getFloatInRange(-5, 5),
                            currentLocation.getY() + generator.getFloatInRange(-5, 5),
                        );
                    } else {
                        var newLocation = new Location(
                            Math.abs(currentLocation.getX() + generator.getFloatInRange(-5, 5))
                                % containerWorld.getWidth(),
                            Math.abs(currentLocation.getY() + generator.getFloatInRange(-5, 5))
                                % containerWorld.getHeight(),
                        );
                    }

                    return {
                        location: newLocation,
                        noAction: true,
                    };
            }
        };

        var act = function(currentGoal, currentTarget) {
            // TODO: Implement eat / attack / etc...
            switch (currentGoal.name) {
                case 'sleep':
                    agentData.energy.tired = agentData.energy.tired - agentData.energy.recoverRate;
                    break;
                // case 'play':
                // case 'exploring':
                //     break;
                case 'reproduction':
                    if (_.isNil(currentTarget.agent)) {
                        break;
                    }
                    myself.reproduceWith(currentTarget.agent);
                    break;
                case 'food':
                    if (_.isNil(currentTarget.agent)) {
                        break;
                    }
                    myself.eatTarget(currentTarget.agent);
                    break;
                default:
                    console.error('[act] Not parsed goal: ' + currentGoal.name);
                    break;
            }

            return true;
        }

        this.getCurrentGoal = function() {
            return intent.getCurrentGoal();
        };
        /////////////

        var moveTo = function(location, forced = false) {
            if (_.isNil(location)) {
                return;
            }

            previousLocations.push({
                location: currentLocation,
                goal: _.isNil(myself.getCurrentGoal())
                    ? 'null'
                    : myself.getCurrentGoal().name,
            });
            while(previousLocations.length > MAX_HISTORY_LENGTH) {
                previousLocations.shift();
            }

            if (myself.isPlant() && !forced) {
                location = currentLocation;
                distance = 0;
            }

            var distance = location.distance(currentLocation);

            if (distance === 0) {
                return;
            } else {
                // normal logic. when agent is part of a world and not forced to move
                if (!forced && !_.isNil(myself.getWorld())) {
                    var currentTile = myself.getWorld()
                        .getWorldStatus(currentLocation.getRoundedLocation());
                    var speed = myself.getSpeed(currentTile);
                    // if location target is too far away
                    if (distance > speed) {
                        location = currentLocation.getLocationAwayToward(speed, location);
                        distance = location.distance(currentLocation);
                    }
                }

                // if world exists, update location
                if(!_.isNil(myself.getWorld())) {
                    myself.getWorld().updateAgentPerLocation(
                        myself,
                        location,
                        currentLocation);
                }

                // Spend distance and update currentLocation.
                spendHunger(agentData.food.hungerMove * distance);
                spendWeight(agentData.food.weightLossMove * distance);
                spendEnergy(agentData.energy.exhaustionMove * distance);
                currentLocation = location;
            }
        };

        this.cycle = function(inputLocation = null, autonomous = false) {
            return intent.cycle(inputLocation)
            .then((newLocation) => {
                if (agentData.alive) {
                    moveTo(newLocation, !_.isNil(inputLocation) && !autonomous);
                    spendHunger(agentData.food.hungerRate);
                    spendEnergy(agentData.energy.exhaustionRate);
                    spendWeight(agentData.food.weightLossRate);

                    agentData.age += 0.1;
                    if (agentData.reproduction.timeToNextKid > 0) {
                        agentData.reproduction.timeToNextKid -= 1;
                    }
                    loseFun();

                    if (intent.canAct()) {
                        var result = act(intent.getCurrentGoal(), intent.getCurrentTarget());
                        if (result) {
                            intent.hasActed();
                        }
                    }
                }
                return Promise.resolve();
            });
        };

        this.kill = function(deathCaise) {
            die(deathCaise);
        };

        this.isAlive = function() {
            return agentData.alive;
        };

        // GET METHODS
        this.getRadiusVision = function() {
            return agentData.global.radiusVision;
        };

        this.getAttentionTargetSpan = function() {
            return agentData.global.attentionTargetSpan;
        }

        this.getActionDistance = function() {
            return agentData.global.actionDistance
        }

        this.getLocationHistory = function() {
            return previousLocations;
        }

        this.getLocation = function() {
            return currentLocation;
        };

        this.getAge = function() {
            return agentData.age;
        };

        this.getData = function() {
            return agentData;
        };

        this.getDNA = function() {
            return objectDNA.getDNA();
        };

        this.setID = function(newID) {
            if (!_.isNil(id) && newID !== id) {
                throw new `ID is already set. ID: ${id}`;
            }

            id = newID;
        };

        this.getID = function() {
            if (_.isNil(id)) {
                throw 'ID needs to be set for this agent.';
            }
            return id;
        };

        this.setWorld = function(world) {
            containerWorld = world;
            intent.setWorld(containerWorld);
        };

        this.getWorld = function() {
            return containerWorld;
        };

        this.getCauseOfDeath = function() {
            return causeOfDeath;
        }
        /////////////

        this.serialize = function() {
            return JSON.stringify(agentData);
        };

        this.toJson = function() {
            return {
                dna: objectDNA.toJson(),
                generatorGeneration: generator.getGeneration(),
                agentData: agentData,
                currentLocation: currentLocation.toJson(),
                previousLocations: _.map(previousLocations, (prevLoc) => {
                    return {
                        location: prevLoc.location.toJson(),
                        goal: prevLoc.goal,
                    };
                }),
                id: id,
            };
        }

        this.parseFromJson = function(json, newWorld = null) {
            agentData = json.agentData;

            objectDNA = ObjectDNA.parseFromJson(json.dna);
            generator = new Generator(objectDNA.getDNA());
            generator.advanceGeneration(json.generatorGeneration);

            currentLocation = Location.parseFromJson(json.currentLocation);

            previousLocations = _.map(json.previousLocations, (prevLoc) => {
                return {
                    location: Location.parseFromJson(prevLoc.location),
                    goal: prevLoc.goal,
                };
            });

            id = json.id;

            if (newWorld) {
                myself.setWorld(newWorld);
            }

            intent.setAgent(myself);
        }

        var initAll = function() {
            initializeGlobalFeature();
            initializeSpeeds();
            initializeHunger();
            initializeSleep();
            initializeExtraTraits();
            initializeReproductiveFunction();
            intent.setAgent(myself);
        };

        if (initialize) {
            initAll();
        }
    };

    Agent.parseFromJson = function(json) {
        var agent = new Agent(null, null, false);
        agent.parseFromJson(json);
        return agent;
    }

    Agent.createNewAgent = function(generator, location) {
        var dna = ObjectDNA.createNewDNA(generator);
        return new Agent(dna, location);
    }

    return Agent;
});
