// The module exports here are what this file exposes to the world when this method is improted. We can improt this model by doing:
// const party = require("./party.json");
var PARTY_STARTED = false;

//Imports
const messageSender = require('./messageSender');
const usernames     = require("./usernames");
const roleManager   = require("./roleManager");

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
  ROOMS:{},
  CHANNEL_ID_TO_ROOM_NAME_MAP:{},
  CLIENT:null,

  //Try Enter Buffer. NOTE a user can only try to go into one place at a time. 
  ENTRY_REPLY_BUFFER:{},

  // This is our initialization function that sets up our house party.
  letsGetThisPartyStarted : function(client, file){
    // If the party is already started, dont restart the party. This is a fake Singleton.
    if(PARTY_STARTED){
      //Do not re-initialize the server.
      return;
    }

    //Store a reference to the Client 
    this.CLIENT = client;

    //Print out some info!
    console.log("Getting this party Started!");
    console.log("Building the house.");

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
          let channelID = this.searchForChannel(room, client.channels.cache);
          if(!channelID){
            //Print out the room that we are creating
            console.log("Creating:", room);
            //Add a promise to our promises array that generates this specific room.
            promises.push(this.createRoom(server[1], room, rooms[room]));
          }else{
            console.log("Room:", room, " already exists in this party house!");
            this.CHANNEL_ID_TO_ROOM_NAME_MAP[channelID] = room;
          }

          //Lets add this room to the list of rooms. We will use this ROOM object as a way to track people and objects as they move around.
          this.ROOMS[room] = rooms[room];
          this.ROOMS[room]['occupants'] = new Map();
        }
      }

      //Now that all our promises have been made, lets execute them all async and wait for them all to finish.
      Promise.all(promises).then(() => {
        //When all promises finish this code will run.
        console.log("All Rooms Generated.");
        PARTY_STARTED = true;
        console.log("Welcome to " + file.description);

        //For debug lets print out the rooms
        console.log(this.ROOMS);
        console.log(this.CHANNEL_ID_TO_ROOM_NAME_MAP);
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
        
        let permissions = { CONNECT: false, VIEW_CHANNEL: true };

        //Set some properties of the channel, make sure everyone can view the channel unless it is hidden
        if(roomData['hidden']){
          //Hidden rooms can exist, they can be navigated to if someone knows the secret name of the channel.
          permissions.VIEW_CHANNEL = roomData['hidden'];
        }

        //Set some properties of the channel, make no-one can directly connect to a channel
        channel.updateOverwrite(channel.guild.roles.everyone, permissions);

        //Add this channel ID to our hashMap
        this.CHANNEL_ID_TO_ROOM_NAME_MAP[channel.id] = roomName;
        
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
  canEnterRoomByID: function(userID, roomID){
    //Lets see if we have an entry for the room that these clients are trying to enter.
    if(this.CHANNEL_ID_TO_ROOM_NAME_MAP[roomID]){
      //Lets get the stored room name for this room ID.
      let roomName = this.CHANNEL_ID_TO_ROOM_NAME_MAP[roomID];

      //Look through our Room construction file to get data about this room
      if(this.ROOMS[roomName]){
        //Get Room Meta Data.
        let roomData = this.ROOMS[roomName];
        
        //If this Room has entry permissions.
        if(roomData['entry_permission']){

          //Get the permissions
          let permissions = roomData['entry_permission'];
          
          //Store the rule CONSTANT as a capital enumerative type.
          let rule = permissions.rule.toUpperCase();

          //Look to see if we have a rule for this entry_permission type.
          switch(rule) {
            case "OWNER":
              text = "Banana is good!";
              break;
            case "HOLDING":
              text = "I am not a fan of orange.";
              break;
            /*
              IF a room is set to FIRST_OCCUPANT, when you are in a room and someone else would like to enter, you will be prompted to allow them in. 
              They will not be able to enter until you allow them in with "!allow @username"
            */
            case "FIRST_OCCUPANT":{
              //Grab the meta-data
              let meta = permissions.meta;
              //Lets see if this room has any occupants first
              if(roomData.occupants.size >= 1){
                //We return false because we are not allowing immidate entry.

                let otherUser = usernames.getUsernameFromID(userID);
                let firstOccupantInRoom = roomData.occupants.keys().next().value;
                
                //Make sure we are not trying to enter the room we are in. It dosent make sence to give ourselves permission to enter when we are already inside.
                if(!(userID === firstOccupantInRoom) || true){
                  //Print the user is trying to enter the room
                  messageSender.replyToLastMessageFromUser(firstOccupantInRoom, meta.try_entry_message + " @" + otherUser + " is requesting entry to the room you are in. To allow them to enter reply \"!allow @"+otherUser+"\" otherwise ignore them.");
                  messageSender.replyToLastMessageFromUser(userID, meta.try_entry_message + " @" + otherUser + " is requesting entry to the room you are in. To allow them to enter reply \"!allow @"+otherUser+"\" otherwise ignore them.");
                  
                  // messageSender.replyToLastMessageFromUser(userID, meta.try_entry_message);

                  //Create an entry in our REPLY_BUFFER that is mapped to a function to move the user into this room and send a message that we allowed them to enter.
                  this.ENTRY_REPLY_BUFFER[userID] = (allowerID) => {
                    //Make sure the user who is allowing this request is the person who this request was issued to.
                    if(allowerID === firstOccupantInRoom){
                      console.log("The person trying to allow this action is who we expet it to be.");
                      //Send message
                      messageSender.replyToLastMessageFromUser(userID, "@" + usernames.getUsernameFromID(firstOccupantInRoom) + " " + meta.entry_message);
                      messageSender.replyToLastMessageFromUser(firstOccupantInRoom, "@" + usernames.getUsernameFromID(firstOccupantInRoom) + " " + meta.entry_message);
                      //After sending the message Move the person into this private room.
                      this.moveUserToChannel(userID, roomID).then(() => {
                        //Log 
                        console.log("@" + usernames.getUsernameFromID(firstOccupantInRoom) + " " + meta.entry_message);

                        //Now delete the entry from the buffer.
                        delete this.ENTRY_REPLY_BUFFER[userID];

                      }).catch((err) => {
                        console.log(err);
                      });
                    }
                  }
                }
                return false;
              }else{
                //There is no-one inside so we can go right in.
                return true;
              }
            }
            case "ALL_OCCUPANTS":
              text = "How you like them apples?";
              break;
            case "HAS_ROLE":{
              //Grab the meta-data
              let meta = permissions.meta;

              if(meta.role){
                let role = meta.role.toUpperCase();

                if(roleManager.userHasRole(userID, role)){
                  messageSender.replyToLastMessageFromUser(userID, meta.entry_message);
                  return true;
                }else{
                  messageSender.replyToLastMessageFromUser(userID, meta.denied_message);
                }
              }

              return false;
            }
            case "TIME":
              text = "How you like them apples?";
              break;
            default:
              console.log("The room entry condition of :" + rule + " is not handled by our permission checker yet.");
              return true;
          }
        }
      }
    }else{
      console.error("Client:" , userID , " tried to travel to a room outside of our partys domain:", roomID);
    }
    return true;
  },

  allowUserToEnter: function(userID, otherUserID){
    if(otherUserID){
      if(this.ENTRY_REPLY_BUFFER[otherUserID]){
        this.ENTRY_REPLY_BUFFER[otherUserID](userID);
        return true;
      }
    }

    return false;
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
  },

  //This function moves a user from one channel to another
  moveUserToChannel: function(clientID, channelID){
    return new Promise(async (resolve, reject) => {
      let clientVoice = this.CLIENT.guilds.cache.get('793673031292682272').members.cache.get(clientID).voice;
      let lastChannel = clientVoice.channelID;

      //Check if we are tying to go the channel that we are in
      if(channelID == lastChannel){
        messageSender.replyToLastMessageFromUser(clientID, "You are already in the room you are trying to travel to.");
        return;
      }

      await clientVoice.setChannel(channelID).then(async () => {

        const connection = await clientVoice.channel.join();
        // Create a dispatcher
        const dispatcher = connection.play('sounds/2bfd6ef8-87cb-4a95-9ee6-d348e1fba4f1.wav');
  
        dispatcher.on('start', () => {
          //IF the discord API was able to perform our action
          let lastRoomOccupants       = this.ROOMS[this.CHANNEL_ID_TO_ROOM_NAME_MAP[lastChannel]];
          if(lastRoomOccupants){
            let occupatns = lastRoomOccupants.occupants;
            if(occupatns.has(clientID)){
              occupatns.delete(clientID);
            }
          }
    
          let transitionRoomOccupants = this.ROOMS[this.CHANNEL_ID_TO_ROOM_NAME_MAP[channelID]];
          if(transitionRoomOccupants){
            let occupatns = transitionRoomOccupants.occupants;
            if(!occupatns.has(clientID)){
              occupatns.set(clientID, {});
            }      
          }
        
          return resolve();
        });
  
        dispatcher.on('finish', () => {
          connection.disconnect();
        });

      }).catch((err) => {
        return reject(err);
      });
    });
  },

  //If you are making a new function make sure to add a comma to the end of the function above this ^^
}