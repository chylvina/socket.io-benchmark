var profile = require('v8-profiler');
var io = require('socket.io-client');

var message = "o bispo de constantinopla nao quer se desconstantinopolizar";

var argvIndex = 2;
var transport = 'polling';
var users = parseInt(process.argv[argvIndex++]);
var rampUpTime = parseInt(process.argv[argvIndex++]) * 1000;
var newUserTimeout = rampUpTime / users;
var shouldBroadcast = process.argv[argvIndex++] === 'broadcast' ? true : false;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1]  : '3000';

function user(transport, shouldBroadcast, host, port) {
  var socket = io.connect('http://' + host + ':' + port, {'forceNew': true, transports: [transport]});

  socket.on('connect', function() {
    if (shouldBroadcast) {
      socket.emit('broadcast', message);
    } else {
      socket.send(message);
    }

    socket.on('message', function(message) {
      socket.send(message);
    });

    socket.on('broadcastOk', function() {
      socket.emit('broadcast', message);
    });

    socket.once('disconnect', function() {
      socket.connect();
    });
  });
};

for(var i=0; i<users; i++) {
  setTimeout(function() { user(transport, shouldBroadcast, host, port); }, i * newUserTimeout);
};
