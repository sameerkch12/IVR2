require('dotenv').config();
const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioNumber = process.env.TWILIO_NUMBER;
const toNumber = '+918109543070'; // Fixed number for outgoing calls

app.post('/makeCall', (req, res) => {
  client.calls.create({
    to: toNumber,
    from: twilioNumber,
    twiml: `<Response>
             <Play>https://sa-5550.twil.io/audio.mp3</Play>
             <Gather action="https://602c-2401-4900-1c33-da80-69f0-84b4-3d42-e541.ngrok-free.app/handleGather" method="POST">
               <Say>Please press 1 to receive the interview link.</Say>
             </Gather>
           </Response>`,
  })
  .then(call => res.send(`Call initiated: ${call.sid}`))
  .catch(err => res.status(500).send(err.message));
});

app.post('/handleGather', (req, res) => {

  
    const { Digits } = req.body;
    console.log('Received request with headers:', req.headers);
    console.log('Received request body:', req.body);
    console.log(Digits);

  if (Digits === '1') {

    client.messages.create({
        body: 'Your interview link is https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test',
        from: twilioNumber,
        to: toNumber
      })
      .then(message => console.log(`SMS sent: ${message.sid}`))
      .catch(err => console.error('Error sending SMS:', err));

      
    res.send(`<Response>
               <Say>Thank you for your interest. Here is your interview link: http://example.com/interview</Say>
             </Response>`);
  } else {
    res.send(`<Response>
               <Say>Invalid option. Please try again.</Say>
               <Redirect>/makeCall</Redirect>
             </Response>`);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
