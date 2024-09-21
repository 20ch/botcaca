const { MessageEmbed } = require('discord.js');
const db = require("quick.db");

module.exports = {
    name: 'pool',
    description: 'Crée un sondage avec réactions pour voter.',
    usage: '<question>',
    run: async (client, message, args, prefix, color) => {
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
            // Vérifie que le contenu du sondage n'est pas vide
            const sondageContent = args.join(' ');
            if (!sondageContent) {
                return message.reply("Veuillez fournir le contenu du sondage.");
            }

            // Crée un nouvel embed pour afficher le sondage
            const sondageEmbed = new MessageEmbed()
                .setColor(color)
                .setTitle('Nouveau Sondage')
                .setDescription(`__**Question :**__ ${sondageContent}\n\nVous pouvez réagir avec les émojis ci-dessous pour donner votre avis`)
                .setFooter('Réagissez avec les émojis pour voter.');

            // Envoie l'embed dans le salon
            const sentEmbed = await message.channel.send(sondageEmbed);

            // Ajoute les réactions pour voter
            const thumbsupEmoji = '1140559009460539473'; // Remplacez par l'ID de l'emoji pouce vers le haut
            const thumbsdownEmoji = '1140559036509593670'; // Remplacez par l'ID de l'emoji pouce vers le bas
            await sentEmbed.react(thumbsupEmoji);
            await sentEmbed.react(thumbsdownEmoji);

            // Supprime le message de commande pour garder le salon propre
            message.delete();

            // Ajoute un événement pour gérer les votes
            const filter = (reaction, user) => [thumbsupEmoji, thumbsdownEmoji].includes(reaction.emoji.id) && !user.bot;
            const collector = sentEmbed.createReactionCollector(filter, { dispose: true });

            // Utilise un tableau pour enregistrer les utilisateurs ayant voté
            const voters = [];

            collector.on('collect', async (reaction, user) => {
                if (!voters.includes(user.id)) {
                    voters.push(user.id);

                    if (reaction.emoji.id === thumbsupEmoji) {
                        // Logique du vote positif
                        console.log(`${user.username} a voté pour : "${sondageContent}"`);
                    } else if (reaction.emoji.id === thumbsdownEmoji) {
                        // Logique du vote négatif
                        console.log(`${user.username} a voté contre : "${sondageContent}"`);
                    }

                    // Envoie un DM à l'utilisateur pour le remercier de son vote
                    const voteEmbed = new MessageEmbed()
                        .setColor(color)
                        .setTitle('Merci pour votre vote !')
                        .setDescription(reaction.emoji.id === thumbsupEmoji ? 'Vous avez voté pour 👍' : 'Vous avez voté pour 👎')
                        .addField('Sondage', sondageContent);

                    try {
                        const userDM = await user.createDM();
                        userDM.send({ embeds: [voteEmbed] });
                    } catch (error) {
                        console.error(`Impossible d'envoyer un message en DM à ${user.username}.`);
                    }
                }
            });

            collector.on('remove', (reaction, user) => {
                // Retire l'utilisateur du tableau des votants lorsqu'il retire sa réaction
                const userIndex = voters.indexOf(user.id);
                if (userIndex !== -1) {
                    voters.splice(userIndex, 1);
                }
                console.log(`${user.username} a retiré son vote pour : "${sondageContent}"`);
            });
        } 
    }
};
