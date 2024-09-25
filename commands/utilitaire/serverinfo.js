const { Client, Message, MessageEmbed } = require('discord.js');
const moment = require('moment')

module.exports = {
	name: 'serverinfo',
	description: "Envoie les informations détaillées sur le serveur",


	run: async(client, message, args) => {

    const guild = message.guild;
    let embed = new MessageEmbed()
    .setTitle(`About ${message.guild.name}`)
    .setThumbnail(message.guild.iconURL())
    .setColor("color")
    .addField("ℹ️ Informations générales", [
    `ID: ${guild.id}`,
    `Nom: ${guild.name}`,
    `Propriétaire: ${guild.owner}`,
    ``
    ])
    .addField('Comptes', [
      `Rôles: ${guild.roles.cache.size}`,
      `Salons: ${guild.channels.cache.size}`,
      `Emojis: ${guild.emojis.cache.size} (Standard: ${guild.emojis.cache.filter((e) => !e.animated).size}, Animés: ${guild.emojis.cache.filter((e) => e.animated).size})`
    ])
    .addField("Informations supplémentaires", [
      `Créé: ${moment(guild.createdTimestamp).format('LT')} ${moment(guild.createdTimestamp).format('LL')} | ${moment(guild.createdTimestamp).fromNow()}`,
      `Région: ${guild.region}`,
      `Niveau de boost: ${guild.premiumTier ? `Tier: ${guild.premiumTier}`: `None`}`
    ]);
    message.reply(embed)
	}
}
