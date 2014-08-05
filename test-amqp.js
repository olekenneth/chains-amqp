var amqp = require('./amqp').connect({deviceName: 'xcomfort-test'});

amqp.on('on', function(deviceId, actionId) {
    amqp.sendResponse('on', actionId);
});
