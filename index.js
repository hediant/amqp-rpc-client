var amqp = require('amqplib/callback_api');
var uuid = require('node-uuid');

/*
    Request RPC call through amqp message queue
    @url - amqp url string, e.g. amqp://localhost
    @rpc_queue - string, queue name that rpc server consume at
*/
function AmqpRpcClient(url, rpc_queue){
    /*
        Do request
        @msg - string, message send to rpc server
        @timeout - number, default to 1000ms
        return 
        @Promise
        if success, resolve(response:string)
        else reject(Error(...))
    */
    this.request = function (msg, timeout){
        timeout = timeout || 1000;
        return new Promise((resolve, reject) => {
            amqp.connect(url, function (err, conn){
                if (err)
                    return reject(err);
                conn.createChannel(function (err, ch){
                    if (err){
                        conn.close();
                        return reject(err);
                    }
                    ch.assertQueue('', {exclusive:true}, function (err, q){
                        if (err){
                            conn.close();
                            return reject(err);
                        }
                        var corr = uuid();
                        var is_timeout = false;
                        // set timeout
                        setTimeout(function (){
                            is_timeout = true;
                            conn.close();
                            reject(Error("Timeout"));
                        }, timeout);
                        // handle result
                        ch.consume(q.queue, function (response){
                            if (!is_timeout && response.properties.correlationId == corr){
                                conn.close();
                                resolve(response.content.toString());
                            }
                        },{
                            noAck:true
                        });
                        // send request
                        ch.sendToQueue(rpc_queue, 
                            new Buffer(msg),
                            {
                                correlationId: corr,
                                replyTo: q.queue
                            }
                        );
                    })
                })
            })
        })
    }
}

module.exports = AmqpRpcClient;