const nodemailer = require('nodemailer');

/*
  Mailer
*/

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'grouppulsewatch@gmail.com',
        pass: process.env['GMAIL_PASSWORD']
    }
});

const mailOptions = {
from: 'grouppulsewatch@gmail.com',
to: 'grouppulsewatch@gmail.com',
subject: 'Daily Resting Heart Rate Email',
text: 'This email is a test'
};


transporter.sendMail(mailOptions, function (err, info) {
    if(err)
        console.log(err)
    else
        console.log(info);
})