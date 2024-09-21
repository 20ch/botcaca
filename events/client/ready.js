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

        if (!oldState.streaming && newState.streaming){
            startStreaming(client, member, voiceChannel);
        }

        if (oldState.streaming && !newState.streaming){
            stopStreaming(client, member, voiceChannel);
        }
    });

    client.guilds.cache.map(async guild => {
        await guild.members.fetch().catch(e => { })
    })
}
