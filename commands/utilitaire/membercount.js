const discord = require("discord.js");

module.exports = {
  name: "membercount",
  aliases: [],
  description: "Affiche le nombre total de membres sur le serveur.",


  run: async (client, message, args) => {
    const calcembed = new discord.MessageEmbed()
    .setDescription('Veuillez patienter, les données sont en cours de chargement... ✨')
    .setColor('color')

    const msg = await message.channel.send(calcembed)
    
    let embed = new discord.MessageEmbed()
    .setDescription(
    `
❯ Nombre total de membres - ${message.guild.memberCount}
❯ Humains - ${message.guild.members.cache.filter(m => !m.user.bot).size}
❯ Robots - ${message.guild.members.cache.filter(m => m.user.bot).size}`)
    .setColor("color")
    .setTimestamp(message.timestamp = Date.now())

    msg.delete()
    message.channel.send(embed);
  }
}
