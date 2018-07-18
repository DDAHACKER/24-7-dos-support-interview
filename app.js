const db = require('quick.db');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.on("ready", async() => {
  console.log("online");
  try{let link = await bot.generateInvite(["ADMINISTRATOR"]);console.log(link)}catch(e){console.log(e.stack);}
});
bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type !== 'text'){
    let active = await db.fetch(`support_${message.author.id}`);
    let guild = bot.guilds.get('369668806018072576');
    let channel, found = true;
    try{
      if(active) bot.channels.get(active.channelID).guild;
    }catch(e){
      found = false;
    }
    if(!active || !found){
      active = {};
      channel = await guild.channels.create(`${message.author.username}-${message.author.discriminator}`, {
        parent: '467899224927895553',
        topic: `<>complete to close the ticket | Support for ${message.author.tag} | ID: ${message.author.id}`
      });
      let author = message.author;
      const newChannel = new Discord.MessageEmbed()
      .setColor(0x36393e)
      .setFooter(`Support Ticket Created!`)
      .addField(`User:`, `<@${author.id}>\n**ID:**\n${author.id}`, true)
      await channel.send(newChannel);
      const newTicket = new Discord.MessageEmbed()
      .setColor(0x36393e)
      .setAuthor(`Hello, ${author.tag}`, author.displayAvatarURL())
      .setFooter(`Support Ticket Created`);
      await author.send(newTicket);
      active.channelID = channel.id;
      active.targetID = author.id;
    }
    channel = bot.channels.get(active.channelID);
    const dm = new Discord.MessageEmbed()
    .setColor(0x36393e)
    .setAuthor(`Thank You, ${message.author.tag}`, message.author.displayAvatarURL())
    .setFooter(`Your message has been sent --- A Head Admin will be in contact with you shortly!`);
    await message.author.send(dm);
    const embed = new Discord.MessageEmbed()
    .setColor(0x36393e)
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
    .setDescription(message.content)
    .setFooter(`Message Recieved --- ${message.author.tag}`);
    await channel.send(embed);
    db.set(`support_${message.author.id}`, active);
    db.set(`supportChannel_${channel.id}`, message.author.id);
    return;
  }
  let support = await db.fetch(`supportChannel_${message.channel.id}`);
  if(support){
    support = await db.fetch(`support_${support}`);
    let supportUser = bot.users.get(support.targetID);
    if(!supportUser) return message.channel.delete();
    if(message.content.toLowerCase() === '<>complete'){
      const complete = new Discord.MessageEmbed()
      .setColor(0x36393e)
      .setAuthor(`Hey, ${supportUser.tag}`, supportUser.displayAvatarURL())
      .setFooter(`Ticket Closed --- Department of Safety`)
      .setDescription(`*Your ticket has been marked as **complete**. If you wish to reopen this, or create a new one, please send a message to the bot*`);
      supportUser.send(complete);
      message.channel.delete();
      db.delete(`support_${support.targetID}`);
      return
    }
    const embed = new Discord.MessageEmbed()
    .setColor(0x36393e)
    .setAuthor('Department of Safety Admin')
    .setFooter(`Message Recieved --- Department of Safety`)
    .setDescription(message.content);
    bot.users.get(support.targetID).send(embed);
    message.delete({timeout: 1000});
    embed.setFooter(`Message Recieved --- ${supportUser.tag}`).setDescription(message.content);
    return message.channel.send(embed);

  }
});
bot.login(process.env.token);
