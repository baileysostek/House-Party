// Import the discord.js library. 
// Documentation :
// https://discord.js.org/#/docs/main/stable/general/welcome
const Discord = require("discord.js");

// Config file, this is where our private environment variables are stored.
const config = require("./config.json");

// Get a handle to the client
const client = new Discord.Client();

// Get a handle to all of the channels in this server.
const channelManager = client.channels;

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
addCommand("goto", (args, message) => {
  const room = args[0];

  let channels = message.guild.channels.cache;
  
  let channelID = searchForChannel(room, channels);
  if(channelID){
    message.reply("Sending user to room:" + room);
    message.guild.member(message.author.id).voice.setChannel(channelID);
  }else{
    let names = "";

    for(test of channels){
      let channel = test[1];
      names += channel.name + " ,"
    }
    names = names.substring(0, names.length -2);

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




/*
  Pass this a string Name and a list of the channels. This returns the unique Channel ID to connect to or false.
*/
searchForChannel = (name, channels) => {
  // Loop through each channel
  for(test of channels){
    // Get a handle to the Channel object. Index 0 is the ID of the channel, index 1 is the actual channel object with properties
    let channel = test[1];
    // Check if this is a voice channel
    if(channel.type === 'voice'){
      // Check if the name matches the name property of the channel
      if(channel.name === name){
        // Bots send people to channels based off of channel ID, not name. return the channel ID if we found a channel matching what was requested of us.
        return channel.id;
      }
    }
  }
  //IF we found nothing return false
  return false;
}

//This is the entrypoint specifically. When this line is hit the bot will go online and start running our code!
client.login(config.BOT_TOKEN);