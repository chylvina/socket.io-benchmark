var exec = require('child_process').exec;

var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ port: 3000 });

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
    var s = stdout.trim().split(/\s+/);
    var cpu = s[0];
    var memory = s[1];

    var l = [
      'CUsers: ' + users,
      'MR/S: ' + countReceived,
      'MS/S: ' + countSended,
      'MR/S/U: ' + msuReceived,
      'MS/S/U: ' + msuSended,
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

wss.on('connection', function connection(ws) {

  users++;

  ws.on('message', function incoming(message) {
    countReceived++;
    offsetTotal += (new Date()).getTime() - parseInt(message.split('-')[1], 10);

    ws.send(message);
    countSended++;
  });

  ws.send('something');
});

