const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configure the email transport using Mailtrap SMTP settings
const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 587,
    auth: {
        user: "your_mailtrap_username", // Replace with your Mailtrap username
        pass: "your_mailtrap_password"  // Replace with your Mailtrap password
    }
});

exports.sendEmailNotification = functions.https.onRequest((req, res) => {
    const mailOptions = {
        from: 'your-email@example.com', // Sender's email
        to: 'recipient-email@example.com', // Recipient's email
        subject: 'Email Notification from Firebase',
        text: 'This is a test email sent from Firebase Functions!'
    };

    transporter.sendMail(mailOptions)
        .then(() => {
            res.status(200).send('Email sent successfully');
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        });
});