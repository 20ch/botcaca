const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const { MessageButton, MessageActionRow } = require('discord-buttons');

module.exports = {
  name: 'booster-list',
  aliases: ['boosters', 'list-boosters'],
  run: async (client, message, args, prefix, color) => {

    let perm = "";
    message.member.roles.cache.forEach(role => {
        if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
        if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
    });

    if(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true ) { 
    const guild = message.guild;

    const boosters = guild.members.cache.filter(member => member.premiumSince !== null && !member.user.bot);
    const chunkSize = 10; // Number of boosters to show per page
    const boosterArray = boosters.array();
    const boosterChunks = [];

    for (let i = 0; i < boosterArray.length; i += chunkSize) {
      boosterChunks.push(boosterArray.slice(i, i + chunkSize));
    }

    if (!boosterChunks || boosterChunks.length === 0) {
      return message.channel.send("Il n'y a aucun booster sur ce serveur.");
    }

    let currentPage = 0;

    const generateEmbed = (page) => {
      const chunk = boosterChunks[page].map((member, index) => {
        const premiumSince = member.premiumSince;
        const premiumSinceFormatted = premiumSince ? `${formatDate(premiumSince)} à ${formatTime(premiumSince)}` : 'Inconnu';
        return `**➔ Booster ${index + 1} :**\n> **Ping du booster:** ${member}\n> **ID du booster:** \`${member.user.id}\`\n> **Date du boost:** \`${premiumSinceFormatted}\``;
      }).join('\n\n');

      const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(`<a:Booster:1141164893064671334> Liste des boosters du serveur (${boosters.size} boosters)`)
        .setDescription(chunk);

      embed.setFooter(`Page ${page + 1} sur ${boosterChunks.length}`);

      return embed;
    };

    const sentMessage = await message.channel.send({ embed: generateEmbed(currentPage), component: createButtons(currentPage, boosterChunks.length) });

    const filter = (button) => button.clicker.user.id === message.author.id;
    const collector = sentMessage.createButtonCollector(filter, { time: 60000 });

    collector.on('collect', async (button) => {
      await button.reply.defer();

      if (button.id === 'previous' && currentPage > 0) {
        currentPage--;
      } else if (button.id === 'next' && currentPage < boosterChunks.length - 1) {
        currentPage++;
      }

      const updatedEmbed = generateEmbed(currentPage);
      const updatedButtons = createButtons(currentPage, boosterChunks.length);

      // Edit the original message to update the embed content and buttons
      sentMessage.edit({ embed: updatedEmbed, component: updatedButtons });
    });

    collector.on('end', () => {
      sentMessage.edit({ components: [] }).catch(console.error);
    });
    }
}};

function createButtons(page, totalChunks) {
  const previousButton = new MessageButton()
    .setStyle('blurple')
    .setLabel('Précédent')
    .setID('previous')
    .setDisabled(page === 0);

  const nextButton = new MessageButton()
    .setStyle('blurple')
    .setLabel('Suivant')
    .setID('next')
    .setDisabled(page === totalChunks - 1);

  const row = new MessageActionRow()
    .addComponent(previousButton)
    .addComponent(nextButton);

  return row;
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
}

function formatTime(date) {
  const options = { hour: 'numeric', minute: 'numeric' };
  return date.toLocaleTimeString('fr-FR', options);
}
