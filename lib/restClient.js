
var request = require('request'),
    saToken = require('./saToken.js'),
    serviceBusUriSuffix = '?timeout=60&api-version=2014-01';

/**
 * Creates a new EventHub, with no creation options yet.  WORK IN PROGRESS.
 *
 * @param {string} namespace    The ServiceBus Namespace to use.
 * @param {string} hubName      The EventHub name.
 * @param {string} saName       The Shared Access Policy name.
 * @param {string} saKey        The Shared Access Policy key.
 * @param {function} success    The callback for success, takes a single boolean - true if hub was created by the call, false if it already existed.
 * @param {function} [error]    The callback for failure.  Takes an "error" and a response status code.
 */
function createHubIfNotExists(namespace, hubName, saName, saKey, success, error) {
    var token = saToken.create(namespace, hubName, saName, saKey);
    var uri = 'https://' + namespace + '.servicebus.windows.net/' +
        hubName + serviceBusUriSuffix;
    var body = '' + 
'<entry xmlns="http://www.w3.org/2005/Atom">'+
'  <content type="application/xml">'+
'    <EventHubDescription xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/netservices/2010/10/servicebus/connect">'+
'    </EventHubDescription>'+
'  </content>'+
'</entry>';
    request({ 
        'uri': uri, 
        'method': 'PUT',
        'headers': {
            'Content-Type' : 'application/atom+xml;type=entry;charset=utf-8',
            'Authorization' : token
        },
        'body': body
    }, function (err, response, body) {
        if (!err && response.statusCode === 201) {
            success(true);
        } else {
            if (response.statusCode === 409) {
                success(false);
            } else {
                if (error) {
                    error(err, response.statusCode);
                }
            }
        }
    });
}

module.exports.createHubIfNotExists = createHubIfNotExists;

function postAMessage(namespace, hubName, saName, saKey) {
    var token = createSasToken(namespace, hubName, saName, saKey);
    var uri = 'https://' + namespace + '.servicebus.windows.net/' +
        hubName + '/messages' + serviceBusUriSuffix;
    var body = '{ "DeviceId": "laptop", "Message": "Paging Dr. Feelgood" }';
    request({
        'uri': uri,
        'method': 'POST',
        'headers': {
            'Content-Type' : 'application/atom+xml;type=entry;charset=utf-8',
            'Authorization' : token
        },
        'body': body
    }, function (error, response, body) {
        if (!error && response.statusCode === 201) {
            console.log('Successfully posted message to hub ' + hubName);
        } else {
            console.log('Failed to post message to hub '+hubName+': '+error+', Status: '+response.statusCode+', Body: '+body);
        }
    });
}

module.exports.send = postAMessage;
//postAMessage({ 'namespace': namespace, 'hubName': hubName, 'sasName': sasName, 'sasKey': sasKey });
