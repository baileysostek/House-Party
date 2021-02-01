const fs                   = require('fs');
const TextToSpeechV1       = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { v4: uuidv4 }       = require('uuid');

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: 'WITzOJSXTcG5S0pTLL_I7HoLo9XjPMXxZfmeXwFVjY0M',
  }),
  serviceUrl: 'https://api.us-east.text-to-speech.watson.cloud.ibm.com/instances/368a32c9-a896-4b54-8e20-a5618ea35463',
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