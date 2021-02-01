
let CLIENT;

const commandChannels = ['perform-action'];

module.exports = {
  initialize : function(client){
    this.CLIENT = client;
  },

  replyToLastMessageFromUser: function(userID, reply){
    let replyMessageID = this.CLIENT.guilds.cache.get('793673031292682272').members.cache.get(userID).user.lastMessageID;
    for(let channel of this.CLIENT.channels.cache){
      if(channel[1].type === 'text'){
        // let find = channel[1].messages.find(replyMessageID);
        // console.log("found2:", channel[1].messages);
        channel[1].messages.fetch(replyMessageID).then((message) => {
          message.reply(reply);
        }).catch((error) => {
          //This channel did not contain the message you looked for.
        });
      }
    }
  }
}