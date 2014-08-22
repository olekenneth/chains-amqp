Chains AMQP
===========

## SUMMARY

This package is an abstract class for Chains NodeJS-devices. It requires `node-amqp`. The class connects to RabbitMQ and emits events based on actions being trigged in Chains. It also handles heart beats.

## INSTALLING

    npm install chains-amqp

Or put this in your `package.json`

```javascript
"dependencies": {
    "chains-amqp": "*"
}
```

## USAGE

If you are going to create a new Chains-device. You can do it like this:

### Example one

```javascript
    var amqp = require('chains-amqp').connect({deviceName: 'xcomfort'});

    amqp.on('on', function(deviceId, actionId) {
        var light = lights.findWhere({serial: deviceId});
    
        if (light) {
            light.set('isOn', true);
    
            amqp.sendResponse('on', actionId);
        }
    });
```
### Example two

```javascript
    var amqp = require('chains-amqp').connect({deviceName: 'xcomfort'});

    amqp.on('describe', function(deviceId, actionId) {
        var events = [
            [ 'xcomfort-on', {
                'key': ['str', null, 'Event trigger'],
                'value': ['int', null, 'Light ID']
            }, 'Action to turn on a single device. Needs value to be a ID of a device']
        ];
    
        var actions = [
            [ 'action_on', {
                'key': ['str', null, 'device Id'],
                'value': ['int', null, 'Light ID']
            }, 'Action to turn on a single device. Needs value to be a ID of a device'],
            [ 'action_off', {
                'key': ['str', null, 'device Id'],
                'value': ['int', null, 'Light ID']
            }, 'Action to turn on a single device. Needs value to be a ID of a device']
        ];
    
        amqp.sendResponse('describe', actionId, {
            'info': 'Controll XComfort-devices. Lights etc',
            'actions': actions,
            'events': events
        });
    });
```

## LICENSE

MIT, see the LICENSE file