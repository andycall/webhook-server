Github 自动项目更新工具
====================


## Usage (单一用作Github自动更新工具)

将main.js , handler.js , package.json 以及这个README文件copy到项目的根目录，

先运行

```
npm install
```

```
node main.js
```

如果是想在Linux上长期挂着的话， 可以使用screen命令

具体内容就百度搜吧。 很容易的→_→

更新的所有细节都会写入到项目目录下的log文件夹内。

## 作为Node 中间件

内置的hander.js 可以作为处理Webhook的中间件， 它暴露于一个接口， 同时也需要传进一个参数

    var createHandler = require('./hander');
    var handler = createHandler({ path : "/webhook" , 'secret' : "Enter your secret key here"});

## API

+ ***path*** : 为Github上发送的地址的路由，若设置为`webhook`, 即地址为`http://example.com/webhook`
+ ***secret*** : 为Github上设置的安全秘钥， 如果出现错误， 则会返回ERROR

返回的handler 为一个函数， 它接受request, response, callback 三个参数。
提供一个简单的例子：

    http.createServer(function(request, response){
        handler(request, response, function(err){
            res.statusCode = 404;
            res.end("ERROR");
        });
    }).listen(4000);

回调函数为发生错误的时候触发。

