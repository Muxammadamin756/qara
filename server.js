const express = require('express');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

const client = new textToSpeech.TextToSpeechClient(); // GOOGLE_APPLICATION_CREDENTIALS o'rnatilgan bo'lishi kerak

app.post('/synthesize', async (req, res) => {
    try {
        const { text, languageCode = 'ar-XA' } = req.body; // arabcha matn
        const request = {
            input: { text },
            voice: { languageCode, name: 'ar-XA-Wavenet-A', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await client.synthesizeSpeech(request);
        const buffer = Buffer.from(response.audioContent, 'base64');

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache',
        });
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Synthesis failed' });
    }
});

app.listen(3000, () => console.log('Server 3000-da ishlayapti'));

// Example request body for testing
const exampleRequestBody = {
  "text": "كِتَابٌ",
  "languageCode": "ar-XA"
};