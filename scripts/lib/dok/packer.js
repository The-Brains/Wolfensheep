define([
    'dok/utils',
], function(Utils) {

     'use strict';
    
    var MAX_TEXTURES = 16;
    var SPRITE_SHEET_SIZE = 2048;
    var CHUNKSIZES = 8;
    
    var chunks = [];

    /**
     *  FUNCTION DEFINITIONS
     */   
     
    function doesFit(tex,x,y,width,height) {
        if(x+width>SPRITE_SHEET_SIZE || y+height>SPRITE_SHEET_SIZE) return false;
    
        if(chunks[tex]) {
            for(var xi=0;xi<width;xi++) {
                if(chunks[tex][x+xi]) {
                    for(var yi=0;yi<height;yi++) {
                        if(chunks[tex][x+xi][y+yi]) {
                            return false;
                        }
                    }                
                }
            }
        }
        
        return true;
    }    
     
    function findSlot(canvas) {
        if(canvas.width <= 1 && canvas.height <= 1) {
            return null;
        }
        if(canvas.width>SPRITE_SHEET_SIZE||canvas.height>SPRITE_SHEET_SIZE) {
            return null;
        }
        var chunkWidth = Math.ceil(canvas.width/CHUNKSIZES);
        var chunkHeight = Math.ceil(canvas.height/CHUNKSIZES);
    
        for(var tex=0;tex<MAX_TEXTURES;tex++) {
            for(var x=0;x<SPRITE_SHEET_SIZE/CHUNKSIZES-chunkWidth;x++) {
                for(var y=0;y<SPRITE_SHEET_SIZE/CHUNKSIZES-chunkHeight;y++) {
                    if(doesFit(tex,x,y,chunkWidth,chunkHeight)) {
                        return {tex:tex,x:x*CHUNKSIZES,y:y*CHUNKSIZES};
                    }
                }                
            }
        }    
        return null;
    }
    
    function fillSlot(tex,x,y,canvas) {
        if(!chunks[tex]) chunks[tex] = [];
        var chunkWidth = Math.ceil((canvas.width+1)/CHUNKSIZES);
        var chunkHeight = Math.ceil((canvas.height+1)/CHUNKSIZES);
    
        for(var xi=0;xi<chunkWidth;xi++) {
            if(!chunks[tex][x/CHUNKSIZES+xi]) chunks[tex][x/CHUNKSIZES+xi] = [];
            for(var yi=0;yi<chunkHeight;yi++) {
                chunks[tex][x/CHUNKSIZES+xi][y/CHUNKSIZES+yi] = canvas;
            }                
        }
    }    
    
    function getSlot(canvas) {
        var slot = findSlot(canvas);
        if(slot) {
            fillSlot(slot.tex,slot.x,slot.y,canvas);
        }
        return slot;
    }
     
    function destroyEverything() {
        chunks.length = 0;
    }
   
    /**
     *  PUBLIC DECLARATIONS
     */
    function Packer() {
    }

    Packer.getSlot = getSlot;

    Utils.onDestroy(destroyEverything);

    /**
     *   PROCESSES
     */

    return Packer;
 });