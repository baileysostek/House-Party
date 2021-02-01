const fs                   = require('fs');
const TextToSpeechV1       = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { v4: uuidv4 }       = require('uuid');
//Import dotEnv
require('dotenv').config();


const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.IBM_API_KEY,
  }),
  serviceUrl: process.env.IBM_URL,
});

module.exports = {
  generateAnnouncement: function(text){
    return new Promise((resolve, reject) => {
      const soundID = uuidv4();

      const synthesizeParams = {
        text: text,
        accept: 'audio/wav',
        voice: 'en-US_AllisonV3Voice',
      };
      
      textToSpeech.synthesize(synthesizeParams).then(response => {
        // only necessary for wav formats,
        // otherwise `response.result` can be directly piped to a file
        return textToSpeech.repairWavHeaderStream(response.result);
      }).then(buffer => {
        const filePath = './sounds/' + soundID + '.wav';
        fs.writeFileSync(filePath, buffer);
        resolve(filePath);
      }).catch((err) => {
        reject(err);
      });
    });
  }  
}