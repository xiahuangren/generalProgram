var express = require('express');
let commonDao = require('../dao/commonDao');
let code = require('../constant/code');
let player = require('../bo/player');
var request = require('request');
var router = express.Router();

//玩家进入游戏
router.post('/login' ,function(req,res){
    var platformID = req.body.platformID;
    if(platformID == "" || platformID == null){
        res.send({code: code.REQUEST_DATA_ERROR});
        return;
    }
    commonDao.findOneData("playerModel", {platformID: platformID}, function (err, result) {
        if (!!err){
            res.send({code: err});
        }else{
            if (!result){
                var saveData = {};
                saveData.chapter = '';
                saveData.prop = '';
                saveData.platformID = req.body.platformID;
                saveData.vitality = player.vitality;
                commonDao.createData("playerModel", saveData, function (err, result) {
                    var playerInfo = player.playerInfo(result._doc)
                    res.send({code: code.OK, msg: {playerInfo}});
                });
            }else{
                if(result.lastRecoveryTime != 0 && result.vitality < player.vitality){
                    var date = new Date().getTime();
                    //恢复的体力
                    var vitality = null;
                    vitality = parseInt((date-result.lastRecoveryTime)/player.recoveryTime);
                    //剩余恢复时间
                    var remainingTime = player.recoveryTime-((date-result.lastRecoveryTime)-(vitality*player.recoveryTime));
                    if(vitality != 0){
                        var updateData = {};
                        vitality = result.vitality+vitality;
                        updateData.lastRecoveryTime = 0;
                        if(vitality > player.vitality){
                            vitality = player.vitality;
                        }else{
                            updateData.lastRecoveryTime = new Date().getTime();
                        }
                        updateData.vitality = vitality;
                        commonDao.updateData("playerModel",{uid: result.uid}, updateData,function (err) {});
                        result._doc.vitality = vitality;
                    }
                    if(result._doc.vitality != player.vitality){
                        result._doc.remainingTime = remainingTime;
                    }
                }
                var playerInfo = player.playerInfo(result._doc)
                res.send({code: code.OK, msg: {playerInfo}});
            }
        }
    });
});

//修改玩家信息
router.post('/modify' ,function(req,res){
    var uid = req.body.uid;
    if(uid == null || uid == ""){
        res.send({code: code.REQUEST_DATA_ERROR});
        return;
    }
    var chapter = req.body.chapter;
    var prop = req.body.prop;
    var vitality = req.body.vitality;
    var updateData = {};
    if(chapter != null && chapter != ''){
        updateData.chapter = chapter;
    }
    if(prop != null && prop != ''){
        updateData.prop = prop;
    }
    if(vitality != null && vitality != ''){
        updateData.vitality = vitality;
        if(updateData.vitality != player.vitality){
            updateData.lastRecoveryTime = new Date().getTime();
        }
    }
    commonDao.updateData("playerModel",{uid: uid}, updateData,function (err) {
        res.send({code: !!err?err:code.OK});
    });
});

//自然恢复体力
router.post('/recoveryVitality' ,function(req,res){
    var uid = req.body.uid;
    if(uid == null || uid == ""){
        res.send({code: code.REQUEST_DATA_ERROR});
        return;
    }
    var type = req.body.type;
    var vitality = req.body.vitality;
    var updateData = {};
    commonDao.findOneData("playerModel", {uid: uid}, function (err, result) {
        if(type == 0){//自然恢复
            if(result._doc.vitality >= player.vitality){   
                res.send({code: code.FULL_OF_VITALITY});
                return;
            }
            updateData.vitality = vitality;
            updateData.lastRecoveryTime = 0;
            //记录上次体力恢复时间
            if(updateData.vitality < player.vitality){
                updateData.lastRecoveryTime = new Date().getTime();
            }
        }else{//额外获得
            updateData.vitality = vitality;
        }
        commonDao.updateData("playerModel",{uid: uid}, updateData,function (err) {
            res.send({code: !!err?err:code.OK,msg: {vitality: updateData.vitality}});
        });
    });
});

//增加邀请数
router.post('/addInvitation' ,function(req,res){
    var uid = req.body.uid;
    if(uid == null || uid == ""){
        res.send({code: code.REQUEST_DATA_ERROR});
        return;
    }
    commonDao.findOneData("playerModel", {uid: uid}, function (err, result) {
        var updateData = {};
        updateData.invitation = result.invitation+1;
        commonDao.updateData("playerModel",{uid: uid}, updateData,function (err) {
            res.send({code: !!err?err:code.OK,msg: {invitation: updateData.invitation}});
        });
    });
});

//修改体力
router.post('/modifyVitality' ,function(req,res){
    var uid = req.body.uid;
    if(uid == null || uid == ""){
        res.send({code: code.REQUEST_DATA_ERROR});
        return;
    }
    var type = req.body.type;
    var updateData = {};
    commonDao.findOneData("playerModel", {uid: uid}, function (err, result) {
        if(type == 0){//看广告增加体力
            updateData.vitality = result.vitality+1;
        }else{//减少体力
            updateData.vitality = result.vitality-1;
            //记录开始恢复体力时间
            if(updateData.vitality == player.vitality-1){
                updateData.lastRecoveryTime = new Date().getTime();
            }
        }
        commonDao.updateData("playerModel",{uid: uid}, updateData,function (err) {
            res.send({code: !!err?err:code.OK,msg: {vitality: updateData.vitality}});
        });
    });
});

router.post('/getOpenId',async function(req,res){
    let codeId = req.body.code;
    let client_id = 'yWKQHCZU0WbIf7IOGaGEKwbjzoDu5FYb';
    let sk = 'XUUP4ddKVIc7XhxMifqDq8tTPsVCi2Qd';
    let url = 'https://spapi.baidu.com/oauth/jscode2sessionkey';
    let requestData = {
        code:codeId,
        client_id:client_id,
        sk:sk
    };
    let option = {
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: requestData
    };
    request(option, function (error, response, body) {
        if(!error && response.statusCode == 200){
            res.send({code: code.OK,msg: body});
        }else{
            res.send({code: code.FAIL});
        }
    });
});

module.exports = router;