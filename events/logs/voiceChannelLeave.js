const db = require("quick.db");
const { MessageEmbed } = require("discord.js");

module.exports = (client, oldState, newState) => {
    if (oldState.channel && !newState.channel) {
        const member = oldState.member;
        const guild = member.guild;
        const color = db.get(`color_${guild.id}`) || client.config.color;
        const logChannelId = db.get(`logvc_${guild.id}`);
        const logChannel = guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const embed = new MessageEmbed()
                .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
                .setColor(color)
                .setDescription(`**${member.user.tag}** a quitté le salon **${oldState.channel.name}**`)
                .setTimestamp();

            logChannel.send(embed)
                .catch(err => console.error('Error sending message:', err));
        } else {
            console.log('Log channel not found.');
        }
    }
};
