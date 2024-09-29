const db = require("quick.db");
const { MessageEmbed } = require("discord.js");

module.exports = (client, member, voiceChannel) => {
  const color = db.get(`color_${member.guild.id}`) || client.config.color;
  const logChannelId = db.get(`logvc_${voiceChannel.guild.id}`);
  const logChannel = voiceChannel.guild.channels.cache.get(logChannelId);

  // Winterwayy
  if (logChannel) {
    const embed = new MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true }))
      .setColor(color)
      .setDescription(`**${member.user.tag}** ne partage plus son écran dans **${voiceChannel.name}**`)
      .setTimestamp();

    logChannel.send(embed)
      .catch(err => console.error('Error sending message:', err));
  }
};
