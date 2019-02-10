var schedule = require('node-schedule');
var http = require('http');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'grouppulsewatch@gmail.com',
        pass: 'h3artRat3!'
    }
});

var mailOptions = {
    from: 'grouppulsewatch@gmail.com',
    to: 'grouppulsewatch@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
 
var j = schedule.scheduleJob('5 * * * * *', function(){
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
});

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Group Pulse Watch is on!');
}).listen(8080);