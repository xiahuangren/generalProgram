var player = module.exports;

player.vitality = 20;//体力值
player.recoveryTime = 60*60*1000;//恢复体力时间

player.playerInfo = function(value){
    var playerInfo = {};
    playerInfo.uid = value.uid;
    playerInfo.platformID = value.platformID;
    playerInfo.logoutTime = value.logoutTime;
    playerInfo.vitality = value.vitality;
    playerInfo.prop = value.prop;
    playerInfo.chapter = value.chapter;
    playerInfo.remainingTime = value.remainingTime;
    playerInfo.invitation = value.invitation;
    return playerInfo;
}