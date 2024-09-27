const Discord = require('discord.js')
const db = require('quick.db')
const {
	MessageActionRow,
	MessageButton,
	MessageMenuOption,
	MessageMenu
} = require('discord-buttons');
const axios = require('axios')

module.exports = {
	name: 'serverinfo',
	aliases: ['si'],

	run: async (client, message, args, prefix, color) => {

// Winterway

		let perm = ""
		message.member.roles.cache.forEach(role => {
			if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true
			if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
			if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true
		})
		if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
			
			const guild = client.guilds.cache.get(args[0]) || message.guild

			let boosters = message.guild.members.cache.filter(m => m.premiumSince)?.map(function(m) {return `<@${m.id}> Boost Depuis : <t:${parseInt(m.premiumSinceTimestamp / 1000)}:f>`}).join("\n");
			if(!boosters || boosters.length < 1) boosters = "__**Personne n'est en train de booster le serveur**__";

			const verificationLevels = {
				NONE: '0',
				LOW: 'Faible',
				MEDIUM: 'Moyen',
				HIGH: 'Elevé',
				VERY_HIGH: 'Très élevé',
			};

			let NoRoles = 0;
			guild.members.cache.forEach((m) => {
				if (m.roles.cache.size == 0) i++;
			})
			//console.log(NoRoles)
			const ServerInfo = new Discord.MessageEmbed()
				.setTitle(`${guild.name} `)
				.setURL("https://discord.gg/xNmW5MWDT3")
				.addField(`Identifiant Serveur:`, `__**${guild.id}**__`, true)
				.addField(`Niveau de vérification:`, `__**${verificationLevels[message.guild.verificationLevel]}**__`, true)
				.addField(`Nombre de membre(s):`, `__**${guild.memberCount}**__`, true)
				.addField(`Nombre de membre(s) Actif(s):`, `__**${guild.members.cache.filter(m => m.presence?.status === 'online' || m.presence?.status === 'dnd' || m.presence?.status === 'streaming' || m.presence?.status === 'idle').size}**__`, true)
				.addField(`Nombre d'humain(s):`, `__**${guild.members.cache.filter((m) => !m.user.bot).size}**__`, true)
				.addField(`Nombre de bot(s):`, `__**${guild.members.cache.filter((m) => m.user.bot).size}**__`, true)
				.addField(`Nombre d'utilisateur(s) en vocal:`, `__**${guild.members.cache.filter(m => m.voice.channel).size}**__`, true)
				.addField(`Nombre d'utilisateur(s) sans rôle:`, `__**${NoRoles}**__`, true)
				.addField(`Nombre de boost(s):`, `__**${guild.premiumSubscriptionCount}**__`, true)
				//.addField(`Nombre de booster(s):`, `__**${boosters}**__`, true)
				.addField(`Nombre de rôle(s):`, `__**${guild.roles.cache.size}**__`, true)
				.addField(`Nombre de salon(s):`, `__**${guild.channels.cache.size}**__`, true)
				.addField(`Nombre d'émoji(s) total:`, `__**${guild.emojis.cache.size}**__`, true)
				.setImage(message.guild.bannerURL({size: 1024}))
				.setFooter("La création du serveur remonte au")
				.setTimestamp(guild.createdAt)

				.setThumbnail(guild.iconURL({
					dynamic: true
				}))
				.setColor(color)

			if (guild.icon) ServerInfo.setURL(guild.iconURL({
				dynamic: true
			}))

			message.channel.send(ServerInfo)
		}
	}
}
