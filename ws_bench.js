var WebSocket = require('ws');

var message = "o bispo de constantinopla nao quer se desconstantinopolizar";

var argvIndex = 2;
var transport = 'websocket';
var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 1000;
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1] : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1] : '3000';

function user(transport, shouldBroadcast, host, port, index) {
  // bug: https://github.com/websockets/ws/pull/608
  var ws = new WebSocket('ws://localhost:3000', { perMessageDeflate: false });

  ws.on('open', function open() {
    if (shouldBroadcast) {
      ws.emit('broadcast', message);
    }
    else {
      ws.send('abc' + '-' + (new Date()).getTime());
    }

    ws.on('message', function (message) {
      ws.send('abc' + '-' + (new Date()).getTime());
    });

  });

};

for (var i = 0; i < users; i++) {
  setTimeout(function () {
    user(transport, shouldBroadcast, host, port, i);
  }, i * newUserTimeout);
};
