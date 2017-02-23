function Utils() {
    this.app = new PIXI.Application(800, 600, {backgroundColor: 0xFFFFFF});
    this.lvlList = [];
    this.sendRequestLvl = this.sendRequestLvl.bind(this);
    this.request = this.request.bind(this);

    this.style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#ffbf00'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 500
    });
}

Utils.prototype.request = function (url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("get", url, true);
    //отправляем запрос
    xmlhttp.send(null);
    //подписываемся на событие изменения состояния запроса
    xmlhttp.addEventListener("readystatechange", function () {
        //если запрос завершен
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            //и ответ от сервера нормальный (с 400-го это все ошибки)
            if (xmlhttp.status < 400) {
                if (callback) {
                    callback(xmlhttp.responseText);
                }
            }
        }
    });
}
;

Utils.prototype.createSelector = function () {
    var welcomeText = new PIXI.Text('Select level, by clicking on it', this.style);
    welcomeText.x = 100;
    welcomeText.y = 5;
    this.app.stage.addChild(welcomeText);

    for (var i = 0; i < this.lvlList.length; i++) {
        var lvl = new PIXI.Sprite.fromImage('./assets/lvl/' + this.lvlList[i] + '.png');
        lvl.height = 240;
        lvl.width = 320;
        lvl.position.set((100 + i * 340), 80);
        lvl.interactive = true;
        lvl.val = this.lvlList[i];
        this.app.stage.addChild(lvl);
        lvl.on('click', this.getLvl.bind(this));
    }
};

Utils.prototype.sendRequestLvl = function () {
    document.body.appendChild(this.app.view);
    this.request("http://dentist-kiev.com/test/arka/levelout.php", function (data) {
        this.lvlList = JSON.parse(data);
        // console.log(this);
        this.createSelector();
    }.bind(this));

};

Utils.prototype.getLvl = function (e) {
    this.app.destroy(true);
    var lv = e.target.val;
    this.request("http://dentist-kiev.com/test/arka/getlvl.php?level=" + lv, function (data) {
        game.lvl = data.split("\n");
        // console.log(game.lvl);
        game.loadLvl();
        game.startLvl();
        game.app.ticker.start();
    });
};
