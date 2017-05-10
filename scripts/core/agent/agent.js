define(['../../localization/location.js'], function (Location) {
    var Agent = function(objectDNA, x, y) {
        this.objectDNA = objectDNA;
        this.serializedDNA = objectDNA.serialize();
        this.position = new Location(x, y);
    };

    return Agent;
}
