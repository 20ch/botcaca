const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: 'findusers',
    aliases: ['fu', 'find'],
    description: 'Trouve un utilisateur en vocal en le mentionnant.',
    run: async (client, message, args) => {
        let perm = '';
        message.member.roles.cache.forEach(role => {
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true;
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true;
        });

        if (
            client.config.owner.includes(message.author.id) ||
            db.get(`ownermd_${client.user.id}_${message.author.id}`) === true ||
            perm ||
            db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true
        ) {
            // Vérifier si la commande a été utilisée correctement avec une mention
            if (!message.mentions.members.size) {
                return message.channel.send('Veuillez mentionner un utilisateur à trouver.')
                    .then(msg => msg.delete({ timeout: 5000 }))
                    .catch(console.error);
            }

            // Obtenir le premier utilisateur mentionné
            const user = message.mentions.members.first();

            // Vérifier si l'utilisateur est dans un salon vocal
            if (!user.voice.channel) {
                return message.channel.send('L\'utilisateur mentionné n\'est pas dans un salon vocal.')
                    .then(msg => msg.delete({ timeout: 5000 }))
                    .catch(console.error);
            }

            // Obtenir le nom et l'ID du salon vocal
            const voiceChannelName = user.voice.channel.name;
            const voiceChannelID = user.voice.channel.id;
            let botAvatar = client.user.displayAvatarURL();
            // Créer et envoyer l'embed avec des informations sur le salon vocal de l'utilisateur
            const embed = new MessageEmbed()
                .setColor('#0000FF')
                .setTitle(`Salon vocal de ${user.displayName}`)
                .addField('Utilisateur', user.toString(), true)
                .addField('Salon Vocal', voiceChannelName, true)
                .setFooter(`${client.user.username}`, botAvatar)
                .setTimestamp()
                .addField('ID du Salon Vocal', `<#${voiceChannelID}>`, true);

            message.channel.send(embed);
        } else {
            // Afficher un message d'erreur si l'utilisateur n'a pas les permissions nécessaires
            return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
                .then(msg => msg.delete({ timeout: 5000 }))
                .catch(console.error);
        }
    }
};
