const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const { MessageButton, MessageActionRow } = require('discord-buttons');

module.exports = {
  name: 'emoji-list',
  aliases: [],
  run: async (client, message, args, prefix, color) => {
    const guild = message.guild;

    let perm = false;
    message.member.roles.cache.forEach((role) => {
      if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
      if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
    });

    if (
      client.config.owner.includes(message.author.id) ||
      db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
      perm
    ) {
      const emojis = message.guild.emojis.cache.map((emoji) => emoji.toString());
      const chunkSize = 90; // Number of emojis to show per page

      if (emojis.length === 0) {
        return message.channel.send("Il n'y a aucun emoji sur ce serveur.");
      }

      const totalChunks = Math.ceil(emojis.length / chunkSize);
      let currentPage = 0;

      const generateEmbed = (page) => {
        const start = page * chunkSize;
        const end = start + chunkSize;
        const chunk = emojis.slice(start, end);

        const embed = new MessageEmbed()
          .setColor(color)
          .setTitle('Liste des emojis du serveur')
          .setDescription(chunk.join(' '));

        embed.setFooter(`Page ${page + 1} sur ${totalChunks}`);

        return embed;
      };

      const sentMessage = await message.channel.send({ embed: generateEmbed(currentPage), component: createButtons(currentPage, totalChunks) });

      const filter = (button) => button.clicker.user.id === message.author.id;
      const collector = sentMessage.createButtonCollector(filter, { time: 60000 });

      collector.on('collect', async (button) => {
        await button.reply.defer();

        if (button.id === 'previous' && currentPage > 0) {
          currentPage--;
        } else if (button.id === 'next' && currentPage < totalChunks - 1) {
          currentPage++;
        }

        const updatedEmbed = generateEmbed(currentPage);
        const updatedButtons = createButtons(currentPage, totalChunks);

        // Edit the original message to update the embed content and buttons
        sentMessage.edit({ embed: updatedEmbed, component: updatedButtons });
      });

      collector.on('end', () => {
        sentMessage.edit({ components: [] }).catch(console.error);
      });
    }
  },
};

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
