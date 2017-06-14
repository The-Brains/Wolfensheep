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

        function getImageFromAgent(agent, move) {
            var type = agent.getDNA().charCodeAt(0)%2;

            var time = DOK.Loop.time;
            if(type===0) {
                return move.dist>.01
                    ? DOK.SpriteSheet.spritesheet.creatures.blob.move
                    : DOK.SpriteSheet.spritesheet.creatures.blob.still;
            } else {
                var animation = DOK.SpriteSheet.spritesheet.creatures.squid;
                return animation[Math.floor(time/100) % animation.length];
            }
        }


        var images = {
            tiles: {
                water: "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/water.gif",
                ice: "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/ice.png",
                dirt: "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/dirt.png",
                mud: "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/mud.png",
                rock: "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/rock.png",
                sand: "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/sand.png",
            },
            creatures: {
                blob: {
                    still: 'https://the-brains.github.io/Wolfensheep/assets/blob.gif',
                    move: 'https://the-brains.github.io/Wolfensheep/assets/blob_move.gif',
                },
                squid: [
                    "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/squid.png" + '|0,0,32,32',
                    "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/squid.png" + '|32,0,32,32',
                    "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/squid.png" + '|0,32,32,32',
                    "https://the-brains.github.io/Wolfensheep/scripts/lib/dok/images/squid.png" + '|32,32,32,32',
                ],
            },
        };
        DOK.SpriteSheet.preLoad(images);

        return {
            getImageFromTile: getImageFromTile,
            getImageFromAgent: getImageFromAgent,
        };
});
