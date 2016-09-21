var Ringpop = require('ringpop');
var TChannel = require('TChannel');
var express = require('express');

var host = '127.0.0.1'; // not recommended for production
var httpPort = process.env.PORT || 8080;
var port = httpPort - 5080;
var bootstrapNodes = ['127.0.0.1:3000'];

var tchannel = new TChannel();
var subChannel = tchannel.makeSubChannel({
    serviceName: 'ringpop',
    trace: false
});
var ringpop = new Ringpop({
    app: 'yourapp',
    hostPort: host + ':' + port,
    channel: subChannel
});
ringpop.setupChannel();
ringpop.channel.listen(port, host, function onListen() {
    console.log('TChannel is listening on ' + port);
    ringpop.bootstrap(bootstrapNodes,
        function onBootstrap(err) {
            if (err) {
                console.log('Error: Could not bootstrap ' + ringpop.whoami());
                process.exit(1);
            }

            console.log('Ringpop ' + ringpop.whoami() + ' has bootstrapped!');
        });

    // This is how you wire up a handler for forwarded requests
    ringpop.on('request', onForwardedReq);
});

var server = express();
server.get('/drivers/:id', onReq);

server.listen(httpPort, function onListen() {
	console.log('Server is listening on ' + httpPort);
});

function onReq(req, res) {
		var key = req.params.id;
		if (ringpop.handleOrProxy(key, req, res)) {
				res.end(ringpop.whoami() + ' served your query');
		}
	}
	
function onForwardedReq(req, res) {
	res.end(ringpop.whoami() + ' served your query');
}
