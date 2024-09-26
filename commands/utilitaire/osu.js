const discord = require("discord.js");
const axios = require('axios');
const db = require('quick.db');

module.exports = {
  name: 'osu',
  description: "Envoie les informations du profil osu! d'un joueur.",

  usage: "osu <@user/id>",

  run: async (client, message, args) => {
    if (!args.length) {
      return message.reply('Veuillez fournir le nom d\'utilisateur osu!');
    }


    let perm = "";
    message.member.roles.cache.forEach(role => {
      if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
    });

    if (
      client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
      perm ||
      db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true
    ) {
      const username = args.join(' ');

      try {
        const response = await axios.get(`https://osu.ppy.sh/api/get_user?k=35b2e1806edeed1011fc4b63f001a441e088cdee&u=${encodeURIComponent(username)}`);
        if (response.data.length === 0 || !response.data) return message.reply('Veuillez fournir un nom d\'utilisateur valide');

        const userData = response.data[0];
        const date = new Date(userData.join_date).getTime();

        const embed = new discord.MessageEmbed()
          .setTitle(`${userData.username}'s osu Profile`)
          .setColor('color')
          .addField('User ID', `${userData.user_id}`)
          .addField('Total Score', `${userData.total_score || "Aucun Score"}`)
          .addField('PP Rank', `${userData.pp_rank || "Aucun Score"}`)
          .addField('Région', `${userData.country || "Aucune Région"}`)
          .addField('Level', `${userData.level || "Aucun level"}`)
          .addField('Création du compte', `<t:${Math.floor(date / 1000)}:F> (<t:${Math.floor(date / 1000)}:R>)`);

        message.channel.send(embed);

      } catch (error) {
        console.error(error);
        message.reply('Une erreur s\'est produite.');
      }
    }
  }
};
