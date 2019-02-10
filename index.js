var schedule = require('node-schedule');
var nodemailer = require('nodemailer');
var http = require('http');
var passport = require('passport')
var FitbitStrategy = require('passport-fitbit').Strategy;


/*
    Authentication
*/

passport.use(new FitbitStrategy({
    consumerKey: "22DC2M",
    consumerSecret: "20809cf52f6d7e8f67084ce41bc13ed0",
    callbackURL: "http://localhost/auth/fitbit/callback"
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }
));

/*
    Server
*/

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send("The Fitbit data mailer is running!")
})

app.get('/auth/fitbit', (req, res) => {
    passport.authenticate('fitbit')
})

app.get('/auth/fitbit/callback', (req, res) => {
    passport.authenticate('fitbit', { failureRedirect: '/' });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


/* 
    E-mailer
*/

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

/*
    Scheduler
*/
 
var j = schedule.scheduleJob('5 * * * * *', function(){
    http.get('http://localhost:3000', (resp) => {
        let data = '';
      
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log(JSON.parse(data));
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
});

