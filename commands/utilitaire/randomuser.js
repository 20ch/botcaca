const Discord = require('discord.js');
const db = require('quick.db'); 
module.exports = {
  name: 'randomuser',
  description: "Tire un membre du serveur au hasard (nécessite la permission `randomuser`)",

  run: async (client, message, args) => {
    // Winterway 
    let perm = "";
    message.member.roles.cache.forEach(role => {
      if (db.get(`randomuser_${message.guild.id}_${role.id}`)) perm = true;
    });

    if ( // Conditional statement for permission check
      client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
      perm
    ) {
      let guildId = message.guild.id;
      const guild = await client.guilds.fetch(guildId);
      const members = await guild.members.fetch();
      const randomMember = members.random();

      message.channel.send({ content: `${randomMember}` });
    }
  }
};
