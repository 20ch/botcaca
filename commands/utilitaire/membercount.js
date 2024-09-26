const discord = require("discord.js");
const db = require('quick.db');

module.exports = {
  name: "membercount",
  aliases: [],
  description: "Affiche le nombre total de membres sur le serveur.",

  run: async (client, message, args) => {
    const calcembed = new discord.MessageEmbed()
      .setDescription('Veuillez patienter, les données sont en cours de chargement... ✨')
      .setColor('color');

    const msg = await message.channel.send(calcembed);

    let perm = "";
    message.member.roles.cache.forEach(role => {
      if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
    });

    if (
      client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
      perm ||
      db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true
    ) {
      let embed = new discord.MessageEmbed()
        .setDescription(
          `
❯ Nombre total de membres - ${message.guild.memberCount}
❯ Humains - ${message.guild.members.cache.filter(m => !m.user.bot).size}
❯ Robots - ${message.guild.members.cache.filter(m => m.user.bot).size}`
        )
        .setColor("color")
        .setTimestamp(message.timestamp = Date.now());

      msg.delete();
      message.channel.send(embed);
    }
  }
};
