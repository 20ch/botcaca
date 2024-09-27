const Discord = require('discord.js');
const db = require('quick.db');

module.exports = {
  name: 'anti-insulte',
  aliases: ["badword"],
  run: async (client, message, args, prefix, color) => {
    let perm = ""
    message.member.roles.cache.forEach(role => {
    if(db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
    })
    if(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {  
    // Liste des mots interdits
    let motsInterdits = db.get('motsInterdits') || []; // Récupérer la liste des mots interdits depuis la base de données

    if (
      client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
      perm ||
      db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true
    ) {
      // Vérifier si un choix a été fait dans le menu déroulant
      if (args[0]) {
        const choix = args[0].toLowerCase();

        if (choix === "ajouter") {
          // Ajouter le mot interdit à la liste
          const motInterdit = args[1]?.toLowerCase();

          if (!motInterdit) {
            const errorEmbed = new Discord.MessageEmbed()
              .setColor(color)
              .setDescription(`Veuillez fournir un mot à ajouter à la liste des mots interdits.`);
            return message.channel.send({ embed: errorEmbed });
          }

          if (motsInterdits.includes(motInterdit)) {
            const errorEmbed = new Discord.MessageEmbed()
              .setColor(color)
              .setDescription(`Ce mot est déjà dans la liste des mots interdits.`);
            return message.channel.send({ embed: errorEmbed });
          }

          motsInterdits.push(motInterdit);
          db.set('motsInterdits', motsInterdits);
          const successEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setDescription(`Le mot "${motInterdit}" a été ajouté à la liste des mots interdits.`);
          return message.channel.send({ embed: successEmbed });
        } else if (choix === "supprimer") {
          // Supprimer le mot interdit de la liste
          const motInterdit = args[1]?.toLowerCase();

          if (!motInterdit) {
            const errorEmbed = new Discord.MessageEmbed()
              .setColor(color)
              .setDescription(`${message.author}, veuillez fournir un mot à supprimer de la liste des mots interdits.`);
            return message.channel.send({ embed: errorEmbed });
          }

          if (!motsInterdits.includes(motInterdit)) {
            const errorEmbed = new Discord.MessageEmbed()
              .setColor(color)
              .setDescription(`${message.author}, ce mot n'est pas dans la liste des mots interdits.`);
            return message.channel.send({ embed: errorEmbed });
          }

          motsInterdits = motsInterdits.filter((mot) => mot !== motInterdit);
          db.set('motsInterdits', motsInterdits);
          const successEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setDescription(`Le mot "${motInterdit}" a été supprimé de la liste des mots interdits.`);
          return message.channel.send({ embed: successEmbed });
        } else if (choix === "liste") {
          // Afficher la liste des mots interdits
          const embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle("Liste des mots interdits")
            .setDescription(motsInterdits.join(", "));
          return message.channel.send({ embed: embed });
        }}

      // Créer le menu déroulant avec les options
      const menuEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle("Menu anti-insultes")
        .setDescription(
          "Que souhaitez-vous faire avec le filtre anti-insultes ?\n" +
          `\`${client.config.prefix}anti-insulte ajouter <mot>\` : Ajouter un mot à la liste des mots interdits\n` +
          `\`${client.config.prefix}anti-insulte supprimer <mot>\` : Supprimer un mot de la liste des mots interdits\n` +
          `\`${client.config.prefix}anti-insulte liste\` : Afficher la liste des mots interdits\n`
        );

      // Envoyer le menu déroulant
      return message.channel.send({ embed: menuEmbed });
    }
  }},
};
