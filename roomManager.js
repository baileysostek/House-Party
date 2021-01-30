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

//Define the functions that will be accessable outside of this module(container)
module.exports = {
  // This is our initialization function that sets up our house party.
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
      //Create a container to hold all of our promises.
      let promises = [];
      //When the bot comes online, it returns all of the servers that it is connected to. For each of those...
      for(server of client.guilds.cache){
        // For each room in the rooms array we are loading from JSON...
        for(room in rooms){
          //Make sure this room does not already exist.
          if(!this.searchForChannel(room, client.channels.cache)){
            //Print out the room that we are creating
            console.log("Creating:", room);
            //Add a promise to our promises array that generates this specific room.
            promises.push(this.createRoom(server[1], room, rooms[room]));
          }else{
            console.log("Room:", room, " already exists in this party house!");
          }
        }
      }

      //Now that all our promises have been made, lets execute them all async and wait for them all to finish.
      Promise.all(promises).then(() => {
        //When all promises finish this code will run.
        console.log("All Rooms Generated.");
        PARTY_STARTED = true;
        console.log("Welcome to " + file.description);
      }).catch((err) => {
        //If any errors were thrown this code will run.
        console.log(err);
      });
     });
  },

  //This function creates a new room in our House (a new vouce channel);
  createRoom : function(client, roomName, roomData){
    //Start by creating a promise that we return at the end of our function.
    let outPromise = new Promise((resolve, reject) => {
      //Server configuration options here!
      let serverOptions = {
        type: 'voice'  //Each room is a voice server Room.
      };

      //Look in the config for a param called NSFW if it exists, mark this as an NSFW room.
      if(roomData['nsfw']){
        serverOptions['nsfw'] = roomData['nsfw'];
      }

      //Look in the config file for a param called user_limit if it exists, dont let more than that many people in this channel.
      if(roomData['user_limit']){
        serverOptions['userLimit'] = roomData['user_limit'];
      }

      //Execute code to create this channel. Pass the server options as the second parameter
      client.channels.create(roomName, serverOptions).then((channel) => {
        //Set some properties of the channel, make no-one can directly connect to a channel
        channel.updateOverwrite(channel.guild.roles.everyone, { CONNECT: false });
        
        //Set some properties of the channel, make sure everyone can view the channel unless it is hidden
        if(roomData['hidden']){
          //Hidden rooms can exist, they can be navigated to if someone knows the secret name of the channel.
          channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: roomData['hidden'] });
        }else{
          channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: true });
        }
        
        //Resolve our promise
        return resolve();
      }).catch((err) => {
        //IF there was an error reject our promise.
        return reject(err);
      });
    });
    return outPromise;
  },

  // A function that detetmines if a user can enter a room or not, This reads the entrypermissions of a room and is a constraint solver.
  canEnterRoom: function(client, roomName, roomData){

  },

  /*
    Pass this a string Name and a list of the channels. This returns the unique Channel ID to connect to or false.
  */
  searchForChannel: function(name, channels, type = "voice"){
    // Loop through each channel
    for(test of channels){
      // Get a handle to the Channel object. Index 0 is the ID of the channel, index 1 is the actual channel object with properties
      let channel = test[1];
      // Check if this is a voice channel
      if(channel.type === type){
        //Hold onto name, lets send it to lowercase to be case-insensative for people switching channels
        let channelName = channel.name.toLowerCase();

        // Check if the name matches the name property of the channel
        if(channelName === name.toLowerCase()){
          // Bots send people to channels based off of channel ID, not name. return the channel ID if we found a channel matching what was requested of us.
          return channel.id;
        }
      }
    }
    //IF we found nothing return false
    return false;
  }

  //If you are making a new function make sure to add a comma to the end of the function above this ^^
}