const Discord = require('discord.js');

module.exports = {
  name: 'ratio',
  description: 'Ratio un membre',

  run: async (client, message, args) => {
    await message.react('✅');
    await message.react('❌');

    // Winterway
    let perm = "";
    message.member.roles.cache.forEach(role => {
      if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
    });

    if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
    }
  }
};
