var profiler = require('v8-profiler');
var io = require('socket.io').listen(3000);
var exec = require('child_process').exec;

// command to read process consumed memory and cpu time
var getCpuCommand = "ps -p " + process.pid + " -o %cpu,%mem | sed -n '2p'";

var users = 0;
var countReceived = 0;
var countSended = 0;
var offsetTotal = 0;

function roundNumber(num, precision) {
  return parseFloat(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
}

setInterval(function() {
  var auxReceived = roundNumber(countReceived / users, 1)
  var msuReceived = (users > 0 ? auxReceived : 0);

  var auxSended = roundNumber(countSended / users, 1)
  var msuSended = (users > 0 ? auxSended : 0);

  // call a system command (ps) to get current process resources utilization
  var child = exec(getCpuCommand, function(error, stdout, stderr) {
    var s = stdout.split(/\s+/);
    var cpu = s[1];
    var memory = s[2];

    var l = [
      'CUsers: ' + users,
      'MReceived/S: ' + countReceived,
      'MSended/S: ' + countSended,
      'MReceived/S/User: ' + msuReceived,
      'MSended/S/User: ' + msuSended,
      'Offset: ' + Math.round(offsetTotal/countReceived),
      'CPU: ' + cpu,
      'Mem: ' + memory
    ];

    console.log(l.join(',\t'));
    countReceived = 0;
    countSended = 0;
    offsetTotal = 0;
  });

}, 1000);

io.sockets.on('connection', function(socket) {

  users++;
  socket.on('message', function(message) {
    countReceived++;
    offsetTotal += (new Date()).getTime() - parseInt(message.split('-')[1], 10);

    socket.send(message);
    countSended++;
  });

  socket.on('broadcast', function(message) {
    countReceived++;

    io.sockets.emit('broadcast', message);
    countSended += users;

    socket.emit('broadcastOk');
  });

  socket.on('disconnect', function() {
    users--;
  })
});

