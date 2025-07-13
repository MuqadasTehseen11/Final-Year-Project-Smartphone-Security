// const nodemailer = require('nodemailer');

// // Configure the email transport using Gmail SMTP settings
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'muqadastehseen17@gmail.com', // Aapka Gmail address
//        // pass: 'your-app-password', // Aapka Gmail app password
//     },
// });

// const sendEmailNotification = async (emailMessage) => {
//     const mailOptions = {
//         from: 'muqadastehseen17@gmail.com', // Sender's email
//         to: 'tehseenmuqadas375@gmail.com', // Recipient's email
//         subject: 'Security Alert: Unauthorized Access Attempt',
//         text: emailMessage,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// };

// module.exports = sendEmailNotification;