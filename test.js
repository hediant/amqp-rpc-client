var AmqpRpcClient = require('./');
var co = require('co');

function sendEcho(rpc_client)
{
    return co(function *(){
        try {
            var req = {
                "cmd" : "ECHO",
                "params" : [
                    "Hello World"
                ]
            }

            console.log("REQUEST:");
            console.dir(req);
            console.time("COST");
            var res = yield rpc_client.request(JSON.stringify(req));
            console.log("RESPONSE:");
            console.dir(JSON.parse(res));
            console.timeEnd("COST");
        }
        catch (err){
            console.error(err);
        }
    });  
}

function sendUnKnownCmd(rpc_client)
{
    return co(function *(){
        try {
            var req = {
                "cmd" : "UNKNOWN",
                "params" : []
            }

            console.log("REQUEST:");
            console.dir(req);
            console.time("COST");
            var res = yield rpc_client.request(JSON.stringify(req));
            console.log("RESPONSE:");
            console.dir(JSON.parse(res));
            console.timeEnd("COST");
        }
        catch (err){
            console.error(err);
        }
    });  
}

var doTest = function ()
{
    var url = "amqp://localhost";
    var rpc_queue = "test_1.RECV";

    co(function *(){
        var rpc_client = new AmqpRpcClient(url, rpc_queue);

        console.log("=======================================");
        yield sendEcho(rpc_client);
        console.log("=======================================");
        yield sendUnKnownCmd(rpc_client);
        console.log();
    })    

    setTimeout(doTest, 5000);
}


doTest();
