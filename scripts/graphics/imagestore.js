define(['dobuki'],
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

        function getImageFromAgent(agent) {
            var time = DOK.Loop.time;
            var animation = DOK.SpriteSheet.spritesheet.creatures.squid;
            return animation[Math.floor(time/100) % animation.length];
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
            creatures: {
                squid: [
                    require.toUrl("dok/images/squid.png") + '|0,0,32,32',
                    require.toUrl("dok/images/squid.png") + '|32,0,32,32',
                    require.toUrl("dok/images/squid.png") + '|0,32,32,32',
                    require.toUrl("dok/images/squid.png") + '|32,32,32,32',
                ],
            },
        };
        DOK.SpriteSheet.preLoad(images);

        return {
            getImageFromTile: getImageFromTile,
            getImageFromAgent: getImageFromAgent,
        };
});