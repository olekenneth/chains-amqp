var rabbitmq     = require('amqp')
  , util         = require('util')
  , _            = require('lodash')
  , eventEmitter = require('events').EventEmitter;

var RabbitMQ = function(options) {
    options = _.defaults(options || {}, 
               { host: 'localhost', 
                 prefix: 'chains',
                 deviceName: 'unnamed-device',
                 defaultExchange: 'chains' });
    
    var self = this,
        connection = rabbitmq.createConnection({ host: options.host }, {defaultExchangeName: options.defaultExchange}),
        heartBeatInterval;

    connection.on('error', function(error) {
        self.emit('error', error);
        console.error('Error when connecting to amqp', error, 'With options: ', options);
    });

    connection.on('ready', function () {
        connection.queue(options.prefix + '.device-' + options.deviceName, {exclusive: true }, function(queue){
            // Binding all da.deviceName.* topic messages to 
            // be routed into chains.device-deviceName queue
            queue.bind(options.prefix, 'da.' + options.deviceName  + '.*');

            self.emit('ready', connection);

            // Sending heart beat every 5 sec
            clearInterval(heartBeatInterval);
            heartBeatInterval = setInterval(function() {
                connection.publish('dh.' + options.deviceName, JSON.stringify(2));
            }, 5000);

            queue.subscribe(function (message, headers, deliveryInfo, messageObject) {
                var routingKey  = deliveryInfo.routingKey.split('.')
                  , action      = routingKey[routingKey.length - 1]
                  , actionId    = deliveryInfo.correlationId;

                if (util.isArray(message) && message.length == 1) {
                    message = message[0];

                    var deviceId = parseInt(message, 10);
                    if (!isNaN(deviceId)) {
                        message = deviceId;
                    }
                }

                self.emit(action, message, actionId);
            });
        });
    });

    this.sendResponse = function(action, actionId, response) {
        if (!response) response = null;
        connection.publish('dr.' + options.deviceName + '.' + action, response, {correlationId: actionId});
    };

    this.sendEvent = function(event, data) {
        connection.publish('de.' + options.deviceName + '.' + event, {device: options.deviceName, data: data, key: event});
    };
};
util.inherits(RabbitMQ, eventEmitter);

exports.connect = function(options) { return new RabbitMQ(options); };