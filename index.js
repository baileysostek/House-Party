const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const channelManager = client.channels;

const prefix = "!";

client.on("message", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  if (command === "goto") {
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
  }

  if (command === "c") {
    console.log(channelManager.cache);
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