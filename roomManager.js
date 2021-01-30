// The module exports here are what this file exposes to the world when this method is improted. We can improt this model by doing:
// const party = require("./party.json");
var PARTY_STARTED = false;

/*  NOTE these are some useful flags that can be put on channels to limit what actions users can do
  ADMINISTRATOR (implicitly has all permissions, and bypasses all channel overwrites)
  CREATE_INSTANT_INVITE (create invitations to the guild)
  KICK_MEMBERS
  BAN_MEMBERS
  MANAGE_CHANNELS (edit and reorder channels)
  MANAGE_GUILD (edit the guild information, region, etc.)
  ADD_REACTIONS (add new reactions to messages)
  VIEW_AUDIT_LOG
  PRIORITY_SPEAKER
  STREAM
  VIEW_CHANNEL
  SEND_MESSAGES
  SEND_TTS_MESSAGES
  MANAGE_MESSAGES (delete messages and reactions)
  EMBED_LINKS (links posted will have a preview embedded)
  ATTACH_FILES
  READ_MESSAGE_HISTORY (view messages that were posted prior to opening Discord)
  MENTION_EVERYONE
  USE_EXTERNAL_EMOJIS (use emojis from different guilds)
  VIEW_GUILD_INSIGHTS
  CONNECT (connect to a voice channel)
  SPEAK (speak in a voice channel)
  MUTE_MEMBERS (mute members across all voice channels)
  DEAFEN_MEMBERS (deafen members across all voice channels)
  MOVE_MEMBERS (move members between voice channels)
  USE_VAD (use voice activity detection)
  CHANGE_NICKNAME
  MANAGE_NICKNAMES (change other members' nicknames)
  MANAGE_ROLES
  MANAGE_WEBHOOKS
  MANAGE_EMOJIS
*/

module.exports = {
  letsGetThisPartyStarted : function(client, file){
    // If the party is already started, dont restart the party. This is a fake Singleton.
    if(PARTY_STARTED){
      //Do not re-initialize the server.
      return;
    }
    //Load the Rooms
    let rooms = file.rooms;

    //Wait for the bot to come online.
    client.on('ready', () => {
      let promises = [];
      //When the bot comes online, it returns all of the servers that it is connected to. For each of those...
      for(server of client.guilds.cache){
        // For each room in the rooms array we are loading from JSON...
        for(room in rooms){
          console.log("Creating:", room);
          promises.push(this.createRoom(server[1], room, rooms[room]));
        }
      }

      Promise.all(promises).then(() => {
        console.log("All Rooms Generated.");
        PARTY_STARTED = true;
        console.log("Welcome to " + file.description);
      }).catch((err) => {
        console.log(err);
      });
     });
  },

  //This function creates a new room in our House (a new vouce channel);
  createRoom : function(client, roomName, roomData){
    let outPromise = new Promise((resolve, reject) => {

      let serverOptions = {
        type: 'voice' 
      };

      if(roomData['nsfw']){
        serverOptions['nsfw'] = roomData['nsfw'];
      }

      if(roomData['user_limit']){
        serverOptions['userLimit'] = roomData['user_limit'];
      }

      client.channels.create(roomName, serverOptions).then((channel) => {
        channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
        if(roomData['hidden']){
          channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: roomData['hidden'] });
        }
        return resolve();
      }).catch((err) => {
        return reject(err);
      });
    });
    return outPromise;
  },

  //If you are making a new function make sure to add a comma to the end of the function above this ^^
}