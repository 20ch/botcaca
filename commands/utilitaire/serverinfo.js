const { Client, Message, MessageEmbed } = require('discord.js');
const moment = require('moment');
const db = require('quick.db');

module.exports = {
  name: 'serverinfo',
  description: "Envoie les informations détaillées sur le serveur",

  run: async (client, message, args) => {
    // Winterway
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

      const guild = message.guild;
      let embed = new MessageEmbed()
        .setTitle(`à propos ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL())
        .setColor("color")
        .addField("ℹ️ Informations générales", [
          `ID: ${guild.id}`,
          `Nom: ${guild.name}`,
          `Propriétaire: ${guild.owner}`,
          ``,
        ])
        .addField('Comptes', [
          `Rôles: ${guild.roles.cache.size}`,
          `Salons: ${guild.channels.cache.size}`,
          `Emojis: ${guild.emojis.cache.size} (Standard: ${guild.emojis.cache.filter((e) => !e.animated).size}, Animés: ${guild.emojis.cache.filter((e) => e.animated).size})`,
        ])
        .addField("Informations supplémentaires", [
          `Créé: ${moment(guild.createdTimestamp).format('LT')} ${moment(guild.createdTimestamp).format('LL')} | ${moment(guild.createdTimestamp).fromNow()}`,
          `Région: ${guild.region}`,
          `Niveau de boost: ${guild.premiumTier ? `Tière: ${guild.premiumTier}` : 'Aucun'}`,
        ]);

      message.reply(embed);
    }
  },
};
