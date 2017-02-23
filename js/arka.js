
var scoreCounter = 0;
var game;
var util;

window.addEventListener('load', init);

function init() {
    game = new Arkaniod();
    util = new Utils();
    util.sendRequestLvl();
};







