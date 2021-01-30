// Import the discord.js library. 
// Documentation :
// https://discord.js.org/#/docs/main/stable/general/welcome
const Discord = require("discord.js");

//Import our other classes here
const roomManager = require("./roomManager");

// Config file, this is where our private environment variables are stored.
const config = require("./config.json");

// Get a handle to the client
const client = new Discord.Client();

//This is the entrypoint specifically. When this line is hit the bot will go online and start running our code!
client.login(config.BOT_TOKEN);

// This is our Party file, It defines the environment that we are moving around in
const party = require("./party.json");
roomManager.letsGetThisPartyStarted(client, party); //Uncomment this when room duplication is turned off.

// Get a handle to all of the channels in this server.
const channelManager = client.channels;

//This is the command prefix, it is how we denote a command.
const prefix = "!";

// This is where we define our list of commands. This object is used as a hashmap where each key is a command name mapped to a callback function to execute when the command is entered.
// Example "goto":(args) => { console.log(args[1]) }
// You can access a commands callback function by typing COMMANDS[commandName] eg. COMMANDS["goto"]
let COMMANDS = {};

/*
  Add a command
*/
addCommand = (commandName, commandCallback) => {
  //Add a new Command to the COMMANDS array with the key of "commandName"
  COMMANDS[commandName] = commandCallback;
}


//------------------------------------------------------------------------
//                   Register Command Handlers Here
//------------------------------------------------------------------------
addCommand("goto", async (args, message) => {
  //The params that someone passes is the room they are going to.
  let room = "";
  for(let arg of args){
    room+=arg+" ";
  }
  if(room.length >= 1 && args.length >= 1){
    room = room.substring(0, room.length - 1);
  }

  //Lets get a handle to the channels/rooms available to us on this server.
  let channels = channelManager.cache;

  // Lets lookup a channel by name and return its channel ID.
  let channelID = roomManager.searchForChannel(room, channels);

  //If we have a channel ID.
  if(channelID){
    //Try to send this user to a different voice channel
    try{
      await message.guild.member(message.author.id).voice.setChannel(channelID).then(() => {
        //IF the discord API was able to perform our action
        
      }).catch((err) => {
        //IF there was an error.
        
      });

      message.reply("Sending user to room:" + room);
    }catch(err){
      console.log(err);
      message.reply("You haven't Entered this party yet so you can't move around. Please go to the Front Door.");
    }
  }else{
    //IF no channel by that name was found.
    let names = "";

    //For each voice channel get the name and add it onto our "names" variable.
    for(test of channels){
      let channel = test[1];
      if(channel.type === 'voice'){
        names += channel.name + " ,";
      }
    }

    //Do some cleanup so we dont end the array representation with ' ,'
    if(names.length >= 2){
      names = names.substring(0, names.length -2);
    }

    //Send a message that this room does not exist.
    message.reply("Sorry that room does not exist in this house. The only rooms in this house are: [" + names + "]");
  }
});
//------------------------------------------------------------------------


// Here is where we start processing hooks. Any time a message is sent it will hit this hook, and the content of message will be passed as the "message" paramiter of the following function.
// (message) => {} is a first class object of type function. This is a way to pass a function as a paramiter.
client.on("message", (message) => {
  //If the author of the message was the bot. Dont process the message just return.
  if (message.author.bot) return;
  //If this message does not start with our prefix, "!" return
  if (!message.content.startsWith(prefix)) return;

  //Parse the body, remove the prefix
  const commandBody = message.content.slice(prefix.length);
  //Each command argument is separated by a space. args will be an array.
  const args = commandBody.split(' ');
  //Command is args[0].toLowerCase
  const command = args.shift().toLowerCase();

  //See if we have an entry for this Command
  //This sees if there is a Key on COMMANDS named command, returns true if the key exists.
  if(COMMANDS[command]){
    //adding parens at the end of dereferencing the array evalues the function stored in the COMMANDS array at "command" with the parameters args.
    COMMANDS[command](args, message);
  }

});