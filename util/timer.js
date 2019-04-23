let player = require('../bo/player');
let commonDao = require('../dao/commonDao');
var timer = module.exports;
var time = [];
timer.interval = function(uid){
    var s = setInterval(function(){
        commonDao.findOneData("playerModel", {uid: uid}, function (err, result) {
            var updateData = {};
            updateData.vitality = result.vitality+1;
            if(updateData.vitality <= player.vitality){
                commonDao.updateData("playerModel",{uid: uid},updateData,function (err) {});
            }
        });
    }.bind(this),player.recoveryTime);
    time[uid] = s;
}

timer.clear = function(uid){
    clearInterval(time[uid]);
}