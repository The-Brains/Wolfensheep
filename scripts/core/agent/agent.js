define(['../../localization/location.js'], function (Location) {
    var Agent = function(objectDNA, x, y) {
        this.objectDNA = objectDNA;
        this.serializedDNA = objectDNA.serialize();
        this.position = new Location(x, y);
        this.tired = 0;
        this.weight = 0;
        this.threat = 0;
        this.hungry = 0;

        this.getSpeed = function(worldStatus) {

        }
    };

    return Agent;
});
