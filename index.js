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
      names = names.substring(0, names.lenght -2);

      message.reply("Sorry that room does not exist in this house. The only rooms in this house are: [" + names + "]");
    }
  }

  if (command === "c") {
    console.log(channelManager.cache);
  }
});

searchForChannel = (name, channels) => {
  for(test of channels){
    let channel = test[1];
    if(channel.type === 'voice'){
      if(channel.name === name){
        return channel.id;
      }
    }
  }

  return false;
}

client.login(config.BOT_TOKEN);