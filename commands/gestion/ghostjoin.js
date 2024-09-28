const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'ghostjoin',
    aliases: ['gj'],
    run: async (client, message, args) => {
        if (args.length === 0) {
            return message.channel.send('Please provide a command: `+gj #channel-name`, `+gj remove #channel-name`, or `+gj active`.');
        }

        const command = args[0];
        const channelMention = message.mentions.channels.first();
        const activeChannels = db.get(`ghostjoin_channels_${message.guild.id}`) || [];

        if (command === 'remove') {
            if (!channelMention) {
                return message.channel.send('Please mention a valid text channel to remove.');
            }

            if (!activeChannels.includes(channelMention.id)) {
                return message.channel.send(`The channel ${channelMention} is not set as a ghost ping channel.`);
            }

            const updatedChannels = activeChannels.filter(id => id !== channelMention.id);
            db.set(`ghostjoin_channels_${message.guild.id}`, updatedChannels);
            return message.channel.send(`Removed ghost ping channel: ${channelMention}`);
        }

        if (command === 'active') {
            if (activeChannels.length === 0) {
                return message.channel.send('No ghost ping channels are currently set.');
            }

            const activeChannelNames = activeChannels.map(id => `<#${id}>`).join(', ');
            return message.channel.send(`Active ghost ping channels: ${activeChannelNames}`);
        }

        if (channelMention) {
            if (!activeChannels.includes(channelMention.id)) {
                activeChannels.push(channelMention.id);
                db.set(`ghostjoin_channels_${message.guild.id}`, activeChannels);
                return message.channel.send(`Ghost ping channel added: ${channelMention}.`);
            } else {
                return message.channel.send(`The channel ${channelMention} is already set as a ghost ping channel.`);
            }
        } else {
            return message.channel.send('Please mention a valid text channel.');
        }
    }
};
