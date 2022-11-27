const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const helpers = require('./helpers');

const app = express();
const port = process.env.PORT || 5001 ;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
  next();
});

app.get('/', (req, res) => {
  res.send({ body: "Body of server" });
})

app.post('/send_SMS', async (req, res) => {
  const data = req.body;
  if (!helpers.validateData(data)) {
    console.log("invalid data")
    return res.json({ status: 'Bad', body: "Phone number or message are invalid" });
  }
  const twilioClient = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
  twilioClient.messages.create({
    body: data.body,
    messagingServiceSid: 'MG99ec2352f6c01b8682ac970b595c84cd',
    to: data.phoneNumber
  })
    .then((message) => {
      helpers.addNewMessage(data);
      res.send({ status: 'ok', body: "message sent to client" })
    })
    .catch(err => {
      console.log(`error when trying to send message to client: ${err}`);
      res.send({ status: 'bad', body: 'We had an issue to send the message please try again and validate phone and message' })
    });
})

app.get('/messages_history', async (req, res) => {
  const history = await helpers.getAllMessageHistory(); 
  console.log(history);
  res.send(history);
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})