const db = require("quick.db");
const { MessageEmbed } = require("discord.js");

module.exports = (client, oldState, newState) => {
  if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
    const member = newState.member;
    const guild = member.guild;
    const color = db.get(`color_${guild.id}`) || client.config.color;
    const logChannelId = db.get(`logvc_${guild.id}`);
    const logChannel = guild.channels.cache.get(logChannelId);

    // Winterwayy
    if (logChannel) {
      const embed = new MessageEmbed()
        .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
        .setColor(color)
        .setDescription(`**${member.user.tag}** a changé de salon vocal, a quitté **${oldState.channel.name}** et a rejoint **${newState.channel.name}**`)
        .setTimestamp();

      logChannel.send(embed)
        .catch(err => console.error('Error sending message:', err));
    }
  }
};
