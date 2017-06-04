define(['dobuki',],
    function(DOK) {
        function getImageFromTile(tile) {
            if(tile.getParameter('ground')==='water') {
                return tile.getParameter('temperature')==='freezing'
                    ? DOK.SpriteSheet.spritesheet.tiles.ice
                    : DOK.SpriteSheet.spritesheet.tiles.water;
            } else {
                return DOK.SpriteSheet.spritesheet.tiles[tile.getParameter('ground')];
            }
        }


        var images = {
            tiles: {
                water: require.toUrl("dok/images/water.gif"),
                ice: require.toUrl("dok/images/ice.png"),
                dirt: require.toUrl("dok/images/dirt.png"),
                mud: require.toUrl("dok/images/mud.png"),
                rock: require.toUrl("dok/images/rock.png"),
                sand: require.toUrl("dok/images/sand.png"),
            },
        };
        DOK.SpriteSheet.preLoad(images);

        return {
            getImageFromTile: getImageFromTile,
        };
});