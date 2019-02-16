require('dotenv').config()

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var schedule = require('node-schedule');
var nodemailer = require('nodemailer');


var passport = require('passport');
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;

var axios = require('axios');

// Create a new Express application.
var app = express();

var accessTokenGlobal;

app.use(cookieParser());
app.use(bodyParser.json());

app.get('/',
  function(req, res) {
    res.send('Mailer is running!');
});

app.use(session({
  secret: "keyboard cat",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session({
  resave: false,
  saveUninitialized: true
}));

var fitbitStrategy = new FitbitStrategy({
  clientID: process.env['FITBIT_CONSUMER_KEY'],
  clientSecret: process.env['FITBIT_CONSUMER_SECRET'],
  scope: ['activity','heartrate','location','profile'],
  callbackURL: "http://localhost:3000/auth/fitbit/callback"
}, function(accessToken, refreshToken, profile, done) {

  accessTokenGlobal = accessToken;

  done(null, {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile
  });

});

passport.use(fitbitStrategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var fitbitAuthenticate = passport.authenticate('fitbit', {
  successRedirect: '/auth/fitbit/success',
  failureRedirect: '/auth/fitbit/failure'
});

app.get('/auth/fitbit', fitbitAuthenticate);
app.get('/auth/fitbit/callback', fitbitAuthenticate);

app.get('/auth/fitbit/success', function(req, res, next) {
  res.send("Sign in sucess!")
});

app.listen(3000);

/* 
    E-mailer
*/

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'grouppulsewatch@gmail.com',
      pass: process.env['GMAIL_PASSWORD']
  }
});

/*
    Scheduler
*/
 
var j = schedule.scheduleJob('* 29 * * * *', function(){
  var instance = axios.create({
    headers: {"Authorization" : `Bearer ${accessTokenGlobal}`}
  });
  instance.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json')
  .then(function (response) {
    var mailOptions = {
      from: 'grouppulsewatch@gmail.com',
      to: 'grouppulsewatch@gmail.com',
      subject: 'Daily Resting Heart Rate Email',
      text: 'Resting Heart Rate for today: ' + response.data['activities-heart'][0].value.restingHeartRate
    };
    transporter.sendMail(mailOptions)
  })
  .catch(function (error) {
    console.log(error);
  });
});
