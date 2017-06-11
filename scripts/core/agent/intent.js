define([
    'lodash',
    '../../util/agent-goals.js',
    '../random.js',
], function (_, AgentGoals, Generator) {
    var Intent = function() {
        var agent = null;
        var world = null;
        var needToEvaluateEnvironment = true;
        var needToDecideGoal = true;
        var needToChooseTarget = true;
        var needToMoveToTarget = true;
        var needToAct = false;

        var currentGoal = null;
        var closestAgents = null;
        var currentTarget = null;

        this.setAgent = function(newAgent) {
            agent = newAgent;
        };

        this.setWorld = function(newWorld) {
            world = newWorld;
        };

        this.getCurrentGoal = () => {
            return currentGoal;
        };

        this.getCurrentTarget = () => {
            return currentTarget;
        }

        var evaluateEnvironment = () => {
            if (needToEvaluateEnvironment) {
                if (_.isNil(world)) {
                    return Promise.resolve({
                        agent: agent,
                        location: agent.getLocation(),
                        distance: 0,
                    });
                }

                return world.getClosestAgents(
                    agent,
                    agent.getRadiusVision(),
                    agent.getAttentionTargetSpan()
                )
                .then((newClosestAgents) => {
                    closestAgents = newClosestAgents;
                    needToEvaluateEnvironment = false;
                    return Promise.resolve(closestAgents);
                });
            } else {
                return Promise.resolve(closestAgents);
            }
        };

        this.canAct = () => {
            return !needToEvaluateEnvironment
                && !needToDecideGoal
                && !needToChooseTarget
                && !needToMoveToTarget
                && needToAct;
        }

        this.hasActed = () => {
            needToEvaluateEnvironment = true;
            needToDecideGoal = true;
            needToChooseTarget = true;
            needToMoveToTarget = true;
            needToAct = false;
        }

        this.cycle = (newLocation = null) => {
            if (currentGoal && currentGoal.name === 'dead') {
                return Promise.resolve(agent.getLocation());
            }
            if (!_.isNil(newLocation)) {
                currentGoal = agent.decideGoal(closestAgents);
                return Promise.resolve(newLocation);
            }

            return evaluateEnvironment()
            .then((closestAgents) => {
                if (_.isNil(currentGoal)) {
                    currentGoal = agent.decideGoal(closestAgents);
                    needToDecideGoal = false;
                }

                if (needToChooseTarget) {
                    currentTarget = agent.decideTarget(closestAgents, currentGoal);
                    needToChooseTarget = false;
                }

                if (_.isNil(currentTarget)
                    || agent.getLocation().distance(currentTarget.location)
                        < agent.getActionDistance()) {
                    needToMoveToTarget = false;
                    needToAct = true;
                }

                return Promise.resolve(needToMoveToTarget
                    ? currentTarget.location
                    : agent.getLocation());
            });
        };
    };

    return Intent;
});
