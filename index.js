const express = require('express')
const path = require('path')
const passport = require('passport');
const { Pool } = require('pg');
const FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;;

const PORT = process.env.PORT || 5000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

passport.use(new FitbitStrategy({
    clientID:     process.env["FITBIT_CLIENT_ID"],
    clientSecret: process.env["FITBIT_CLIENT_SECRET"],
    callbackURL: "http://localhost:5000/auth/fitbit/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const text = 'INSERT INTO user_table(id, display_name, access_token, refresh_token) VALUES($1, $2, $3, $4)';
      const values = [profile.id, profile.displayName, accessToken, refreshToken]
      const client = await pool.connect()

      const res = await client.query(text, values)
      client.release();
      return done(null, profile)

    } catch (err) {
      console.error(err);
      return done(err)
    }   
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

express()
  .use(require('serve-static')(__dirname + '/public'))
  .use(require('cookie-parser')())
  .use(require('body-parser').urlencoded({ extended: true }))
  .use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))
  .use(passport.initialize())
  .use(passport.session())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/auth/fitbit', passport.authenticate('fitbit', { scope: ['activity','heartrate','location','profile']}))
  .get('/auth/fitbit/callback',
    passport.authenticate('fitbit', { successRedirect: '/',
                                      failureRedirect: '/' }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))