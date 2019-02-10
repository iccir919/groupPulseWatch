var schedule = require('node-schedule');
var http = require('http');
 
var j = schedule.scheduleJob('5 * * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Group Pulse Watch is on!');
}).listen(8080);