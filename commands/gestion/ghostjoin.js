const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'ghostjoin',
    aliases: ['gj'],
    run: async (client, message, args) => {
        if (args.length === 0) {
            return message.channel.send('Veuillez saisir une commande valide : `+gj #nom-du-salon`, `+gj remove #nom-du-salon`, ou `+gj active`.');
        }

        const command = args[0];
        const channelMention = message.mentions.channels.first();
        const activeChannels = db.get(`ghostjoin_channels_${message.guild.id}`) || [];

        if (command === 'remove') {
            if (!channelMention) {
                return message.channel.send('Veuillez indiquer un salon de texte ghostping valide à supprimer.');
            }

            if (!activeChannels.includes(channelMention.id)) {
                return message.channel.send(`Le canal ${channelMention} n'est pas configuré comme un canal de ghostping`);
            }

            const updatedChannels = activeChannels.filter(id => id !== channelMention.id);
            db.set(`ghostjoin_channels_${message.guild.id}`, updatedChannels);
            return message.channel.send(`Removed ghost ping channel: ${channelMention}`);
        }

        if (command === 'active') {
            if (activeChannels.length === 0) {
                return message.channel.send('Aucun canal de ghostping est actuellement configuré.');
            }

            const activeChannelNames = activeChannels.map(id => `<#${id}>`).join(', ');
            return message.channel.send(`Canaux de ghostping actifs : ${activeChannelNames}`);
        }

        if (channelMention) {
            if (!activeChannels.includes(channelMention.id)) {
                activeChannels.push(channelMention.id);
                db.set(`ghostjoin_channels_${message.guild.id}`, activeChannels);
                return message.channel.send(`Le canal de ghostping suivant a été ajouté : ${channelMention}`);
            } else {
                return message.channel.send(`Le canal ${channelMention} est déjà configuré comme un canal de ghostping.`);
            }
        } else {
            return message.channel.send('Veuillez indiquer un salon de texte valide.');
        }
    }
};
