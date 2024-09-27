/**
 * @author larry & 20ch
 */

const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
	name: 'bringall',
	aliases: [],
	run: async (client, message, args, prefix, color) => {
		const userVoiceChannel = message.member.voice.channel;
		if (!userVoiceChannel) {
			return message.channel.send("Vous devez être dans un salon vocal pour exécuter cette commande.");
		}

		let perm = "";
		message.member.roles.cache.forEach(role => {
			if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = null;
			if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = null;
			if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = null;
		});

		if (!client.config.owner.includes(message.author.id) &&
			!db.get(`ownermd_${client.user.id}_${message.author.id}`) &&
			!perm) {
			return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
		}

		if (!message.guild.me.hasPermission("MOVE_MEMBERS")) {
			return message.channel.send("Je n'ai pas la permission de déplacer des membres.");
		}

		const voiceChannels = message.guild.channels.cache.filter(channel => channel.type === 'voice');

		if (!voiceChannels.size) {
			return message.channel.send("Il n'y a aucun salon vocal sur ce serveur.");
		}

		let membersToMove = [];
		voiceChannels.forEach(vc => {
			if (vc.id !== userVoiceChannel.id) {
				vc.members.forEach(member => {
					if (!member.user.bot) {
						membersToMove.push(member);
					}
				});
			}
		});

		if (membersToMove.length === 0) {
			return message.channel.send("Il n'y a aucun membre à déplacer depuis les autres salons vocaux.");
		}

		Promise.all(membersToMove.map(member => 
			member.voice.setChannel(userVoiceChannel.id)
				.catch(() => {
					message.channel.send(`Je n'ai pas pu déplacer ${member.user.tag}.`);
				})
		)).then(() => {
			message.channel.send(`${membersToMove.length} membre(s) déplacé(s) vers le salon vocal **${userVoiceChannel.name}**.`);
		});
	}
};
