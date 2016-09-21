var Ringpop = require('ringpop');
var TChannel = require('TChannel');
var express = require('express');
var NodeCache = require('node-cache');
var cache = new NodeCache();

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
    ringpop.on('request', handleReq);
});

var server = express();
server.get('/*', onReq);

server.listen(httpPort, function onListen() {
	console.log('Server is listening on ' + httpPort);
});

function extractKey(req) {
    var urlParts = req.url.split('/');
    if (urlParts.length < 3) return ''; // URL does not have 2 parts...
	return urlParts[1];
}
function onReq(req, res) {
    var key = extractKey(req);
    if (ringpop.handleOrProxy(key, req, res)) {
        handleReq(req, res);
    }
}
function handleReq(req, res) {
    cache.get(req.url, function(err, value) {
		if (value == undefined) {
			var key = extractKey(req);
			var result = host + ':' + port + ' is responsible for ' + key;
			cache.set(req.url, result, function(err, success) {
					if (!err && success) {
						res.end(result + ' NOT CACHED');
					}

			});
		} else {
			res.end(value + ' CACHED');
		}
    });
}
