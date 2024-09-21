const { MessageActionRow, MessageButton, MessageMenuOption, MessageMenu } = require('discord-buttons');
const db = require('quick.db');
const { MessageEmbed } = require('discord.js');
const usersWithOpenTickets = new Set();

module.exports = (client) => {

  client.on('ready', async () => {
  client.guilds.cache.forEach(async (guild) => {
    const ticketsalon = await db.get(`ticketsalon_${guild.id}`); // Ajoutez cette ligne pour récupérer l'ID du salon cible
    if (ticketsalon) {
      const targetChannel = guild.channels.cache.get(ticketsalon);
      if (targetChannel && targetChannel.type === 'text') {
        await targetChannel.messages.fetch().then(messages => {
          messages.forEach(message => {
              message.delete().catch(error => {
                  console.error(`Erreur lors de la suppression du message ${message.id}: ${error}`);
              });
          });
      });
        // Récupérer les autres informations de configuration spécifiques au serveur
        const description = await db.get(`ticketdescription_${guild.id}`);
        const titre = await db.get(`tickettitre_${guild.id}`);
        const color = await db.get(`ticketcolor_${guild.id}`);
        const ticketadminrole = await db.get(`ticketadminrole_${guild.id}`);
        const ticketmojibutton = await db.get(`ticketmojibutton_${guild.id}`);
        const ticketbuttonname = await db.get(`ticketbuttonname_${guild.id}`);
        const ticketbuttoncolour = await db.get(`ticketbuttoncolor_${guild.id}`);
        const categoriedeticket = await db.get(`categoriedeticket_${guild.id}`);

        if (ticketbuttonname) {
          const ticketembed = new MessageEmbed();

    // Ajoutez le titre si configuré
    if (titre) {
        ticketembed.setTitle(titre);
    }

    // Ajoutez la description si configurée
    if (description) {
        ticketembed.setDescription(description);
    }

    // Ajoutez la couleur si configurée
    if (color) {
        ticketembed.setColor(color);
    }
    const ticketbuttoncolor = ticketbuttoncolour || "blurple";
    const buttonName = ticketbuttonname || "Ouvrir Un ticket";
    const buttonEmoji = ticketmojibutton || "🎫";
    // Ajout du bouton bleu à l'intérieur de l'embed
    const createButton = new MessageButton()
        .setStyle(ticketbuttoncolor)
        .setLabel(buttonName)
        .setID('create_ticket')
        .setEmoji(buttonEmoji);

        const targetChannel = client.channels.cache.get(ticketsalon);
        const ticketsendsalon = targetChannel;
        const row = new MessageActionRow().addComponents(createButton);
        const embedMessage = await ticketsendsalon.send({ embed: ticketembed, components: [row] });
        const filter = () => true;
        const collector = embedMessage.createButtonCollector(filter);

collector.on('collect', async (button) => {
let botAvatar = client.user.displayAvatarURL();
const user = button.clicker.user; 
 if (usersWithOpenTickets.has(user.id)) {
    button.reply.send('\`❌\` Vous avez déjà un ticket ouvert. Vous ne pouvez pas en créer un autre !', true);
  } else {
    usersWithOpenTickets.add(user.id);

const ticketChannel = await  targetChannel.guild.channels.create(`ticket-${user.username}`, {
type: 'text',
parent: categoriedeticket,
permissionOverwrites: [

{
id: user.id,
allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
},
{
id: ticketadminrole,
allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
},
{
id: targetChannel.guild.roles.everyone,
deny: ['VIEW_CHANNEL'],
},
],
});
button.reply.send(`\`✅\`Le ticket a bien été créé dans <#${ticketChannel.id}>`, true);
const welcomeEmbed = new MessageEmbed()
.setColor(color)
.setTitle(`\`✅\` Ticket créé par ${user.tag}`)
.setThumbnail("https://cdn.discordapp.com/icons/1153726635028271247/a733cfdf4072921d7e5d3ca464b61309.png?size=1024")
.setDescription(`Salut ${user}, bienvenue dans votre ticket !`)
.addField(`Action : `, `Merci de nous fournir __la raison de la création de votre ticket__. Cela permettra aux modérateurs de vous __aider plus rapidement lorsque l'un d'entre eux arrivera__.`);


const closeButton = new MessageButton()
.setStyle('red')
.setLabel('Fermer le ticket')
.setEmoji("1182289686975229962")
.setID('close_ticket');

const claimButton = new MessageButton()
.setStyle('grey')
.setLabel('🧔 Claim')
.setID('claim_ticket');

const actionRow = new MessageActionRow().addComponents(closeButton, claimButton);

welcomeEmbed
.addField('Informations :', 'Merci de __ne pas mentionner Noxtro__, sauf en cas de __paiement de bot ou d\'achat__ à effectuer sur le serveur ! \Toute mention en dehors de cette conditions sera passible d\'__un mute__ voire d\'__un bannissement__ <:ban:1162498281197285426>')
.setTimestamp()
.setFooter(`${client.user.username}`, botAvatar);

const userMentionMessage = await ticketChannel.send(`<@${user.id}><@&${ticketadminrole}>`, { embed: welcomeEmbed, components: [actionRow] });

const closeFilter = () => true;
const closeCollector = userMentionMessage.createButtonCollector(closeFilter);

closeCollector.on('collect', async (closeButton) => {
if (closeButton.id === 'close_ticket') {
await closeButton.reply.defer();

const confirmationEmbed = new MessageEmbed()
.setColor(color)
.setDescription("```Êtes-vous sûr de vouloir fermer ce ticket ?```");

const confirmButton = new MessageButton()
.setStyle('green')
.setLabel('✅ Confirmer')
.setID('confirm_close_ticket');

const cancelButton = new MessageButton()
.setStyle('red')
.setLabel('❌ Annuler')
.setID('cancel_close_ticket');

const confirmationActionRow = new MessageActionRow().addComponents(confirmButton, cancelButton);

const confirmationMessage = await ticketChannel.send({ embed: confirmationEmbed, components: [confirmationActionRow] });

const confirmationFilter = () => true; // Ne pas filtrer les interactions
const confirmationCollector = confirmationMessage.createButtonCollector(confirmationFilter, { time: 15000 });

confirmationCollector.on('collect', async (confirmationButton) => {
if (confirmationButton.id === 'confirm_close_ticket') {
await confirmationButton.reply.defer();

const closeMessage = await ticketChannel.send('**<a:soon:1150222654092099695> Le ticket sera fermé dans 3 secondes...**');

setTimeout(async () => {
await ticketChannel.delete();
usersWithOpenTickets.delete(user.id);
}, 3000);
} else if (confirmationButton.id === 'cancel_close_ticket') {
await confirmationButton.reply.defer();
await confirmationMessage.delete();
}
});

confirmationCollector.on('end', () => {
confirmationMessage.delete();
});
}
});

const claimRole = targetChannel.guild.roles.cache.find(role => role.id === ticketadminrole,);

if (claimRole) {
const claimFilter = (button) => {
if (button.clicker.user.id === user.id) {
button.reply.send('\`❌\` Vous ne pouvez pas utiliser ce bouton pour votre propre ticket.', true);
return false;
}

if (!button.clicker.member.roles.cache.has(ticketadminrole)) {
button.reply.send('\`❌\` Vous n\'avez pas la permission de fermer ce ticket.', true);
return false;
}

if (!button.clicker.member.roles.cache.has(claimRole.id)) {
button.reply.send('\`❌\` Vous n\'avez pas la permission de claim ce ticket.', true);
return false;
}

return true;
};                  

const claimCollector = userMentionMessage.createButtonCollector(claimFilter);

claimCollector.on('collect', async (claimButton) => {
if (claimButton.id === 'claim_ticket') {
await claimButton.reply.defer();

const claimEmbed = new MessageEmbed()
.setColor(color)
.setDescription(`Ce ticket a été claim par ${claimButton.clicker.member}`)

await ticketChannel.send(claimEmbed);

welcomeEmbed
.setTitle(`Ticket créé par ${user.tag}`)
.setDescription(`Salut <@${user.id}>, bienvenue dans votre ticket !`)
.addField('Ce ticket a été claim par :', claimButton.clicker.member)
.setTimestamp()
.setFooter(`${client.user.username}`, botAvatar);

const inactiveClaimButton = new MessageButton()
.setStyle('grey')  
.setLabel('Claim')
.setID('claim_ticket')
.setDisabled(true);

const newActionRow = new MessageActionRow().addComponents(closeButton, inactiveClaimButton);
await userMentionMessage.edit({ embed: welcomeEmbed, components: [newActionRow] });
}
});                           

claimCollector.on('end', () => {
const creatorButton = actionRow.components.find(button => button.id === 'create_ticket');
if (creatorButton) {
creatorButton.setDisabled();
userMentionMessage.edit({ components: [actionRow] });
}
});
}
}
});
} else {
  targetChannel.channel.send("Vous n'avez pas encore rien configurer !");
}
}
}
});
})};
