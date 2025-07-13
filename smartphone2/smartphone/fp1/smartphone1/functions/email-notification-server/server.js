// const express = require('express');
// const sendEmailNotification = require('./sendEmail');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(bodyParser.json());

// app.post('/send-notification', async (req, res) => {
//     const { message } = req.body;
//     await sendEmailNotification(message);
//     res.status(200).send('Notification sent');
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });