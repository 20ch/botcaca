const Discord = require("discord.js");
const disbut = require("discord-buttons")
const db = require("quick.db")

module.exports = (client) => {
    console.log(`- Connecté à ${client.user.username}`)

    const logVoiceJoin = require('../logs/voiceChannelJoin');
    const logVoiceLeave = require('../logs/voiceChannelLeave');
    const logVoiceSwitch = require('../logs/voiceChannelSwitch');

    const startStreaming = require('../logs/voiceStreamingStart');
    const stopStreaming = require('../logs/voiceStreamingStop');

    client.on('voiceStateUpdate', (oldState, newState) => {
        const member = newState.member;
        const voiceChannel = newState.channel;

        logVoiceLeave(client, oldState, newState);
        logVoiceJoin(client, oldState, newState);
        logVoiceSwitch(client, oldState, newState);

        if (!oldState.streaming && newState.streaming) {
            startStreaming(client, member, voiceChannel);
        }

        if (oldState.streaming && !newState.streaming) {
            stopStreaming(client, member, voiceChannel);
        }
    });

    client.on('message', async (message) => {
        if (message.author.bot) return;

        let motsInterdits = db.get('motsInterdits') || [];

        const messageContent = message.content.toLowerCase();
        for (const mot of motsInterdits) {
            if (messageContent.includes(mot)) {
                await message.delete();

                const warningEmbed = new Discord.MessageEmbed()
                    .setColor('#FF0000')
                    .setDescription(`Votre message a été supprimé car il contenait un mot interdit : "${mot}".`);
                message.author.send({ embed: warningEmbed }).catch(err => console.error('Could not send message to user:', err));

                break;
            }
        }
    });

    client.guilds.cache.map(async guild => {
        await guild.members.fetch().catch(e => { })
    })
}
