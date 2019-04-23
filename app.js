var express = require('express');
var bodyParser = require('body-parser');
const controller = require('./controllers/control');
var app = express();
// 启动mongo数据库
global.mongoClient = require('./mongo/models');
/* 跨域设置 */
app.all('*', function(req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式 
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
    else
        next();
});
//支持JSON编码体
app.use(bodyParser.json());
//support encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
//加载接口
app.use(controller);
module.exports = app;
