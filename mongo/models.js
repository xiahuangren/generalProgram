//引入mongoose模块
var mongoose = require('mongoose');
//引入mongoose-auto-increment
var autoIncrement = require("mongoose-auto-increment");
//拿到Schema 一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力 
//model 由Schema发布生成的模型，具有抽象属性和行为的数据库操作对
var Schema = mongoose.Schema;
//引入util模块
var Util = require('util');
//获取配置文件
var dbConfig = require('./mongo.json');
//格式化
var formatStr = 'mongodb://%s:%s/%s';
//MongoDB地址
var MongoDbAddress;
if (dbConfig.mongo.user !== null && dbConfig.mongo.password !== null){
    formatStr = 'mongodb://%s:%s@%s:%s/%s';
    MongoDbAddress = 'mongodb://127.0.0.1:27017/game';
} else {
    formatStr = 'mongodb://%s:%s/%s';
    MongoDbAddress = Util.format(formatStr, dbConfig.mongo.host, dbConfig.mongo.port, dbConfig.mongo.database);
}

//连接数据库
var db = mongoose.createConnection(MongoDbAddress);
//id自增插件初始化
autoIncrement.initialize(db);

// 玩家
var playerSchema = new Schema({
    platformID: {type: String, platformID: ""},
    chapter: {type: String, default: ""},
    prop: {type: String, default: ""},
    vitality: {type: Number, default: 0},
    lastRecoveryTime: {type: Number, default: 0},
    invitation: {type: Number, default: 0}
});
//下面用自增插件，实现id的自增功能
playerSchema.plugin(autoIncrement.plugin, {
    model: 'player',
    field: 'uid',
    startAt: 100000,
    incrementBy: 1
});

db.model('player', playerSchema);
exports.playerModel = db.model('player');
