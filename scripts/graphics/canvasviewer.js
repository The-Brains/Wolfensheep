function CanvasViewer(canvas, model) {
    var ctx = canvas.getContext('2d');

    function displayCreature(id, creature, time) {
        var position = creature.getPosition(time);
        if (!creature.color) {
            creature.color = '#'+Math.floor(Math.random()*0xFFFFFF).toString(16);
        }
        ctx.fillStyle = creature.color;
        ctx.beginPath();
        ctx.arc(position[0],position[1],10,0,2*Math.PI);
        ctx.fill();
    }

    function updateView(model, time) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        model.forEach(displayCreature, time);
    }

    var stopped = false;
    function refreshScreen() {
        if (!stopped) {
            var time = Date.now();
            updateView(model, time);
            requestAnimationFrame(refreshScreen);
        }
    }

    function start() {
        stopped = false;
        refreshScreen();
    }

    function stop() {
        stopped = true;
    }

    this.start = start;
    this.stop = stop;
}