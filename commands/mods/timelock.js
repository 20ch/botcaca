const Discord = require('discord.js');
const ms = require('ms'); // Pour convertir les durées en millisecondes

module.exports = {
    name: 'timelock',
    description: 'Verrouille un canal pendant une durée spécifiée.',
    usage: 'timelock <durée>',

    async execute(message, args) {
        // Récupérer la durée du verrouillage
        const duration = args.join(' ');
        if (!duration) return message.reply('Veuillez spécifier une durée (ex: 5m, 2h)');

        // Vérifier les permissions de l'utilisateur et du bot
        if (!message.member.hasPermission('MANAGE_CHANNELS')) {
            return message.reply("Vous n'avez pas la permission de gérer les canaux.");
        }
        if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) {
            return message.reply("Je n'ai pas la permission de gérer les canaux.");
        }

        // Verrouiller le canal
        await message.channel.overwritePermissions([
            {
                id: message.guild.id,
                deny: ['SEND_MESSAGES'],
            },
        ]);

        // Envoyer un message d'information
        const embed = new Discord.MessageEmbed()
            .setTitle('Canal verrouillé')
            .setDescription(`Le canal ${message.channel} est verrouillé pendant ${duration}.`)
            .setColor('color');
        await message.channel.send(embed);

        // Déverrouiller le canal après la durée spécifiée
        setTimeout(() => {
            message.channel.overwritePermissions([
                {
                    id: message.guild.id,
                    allow: ['SEND_MESSAGES'],
                },
            ]);

            const embed = new Discord.MessageEmbed()
                .setTitle('Canal déverrouillé')
                .setDescription(`Le canal ${message.channel} est à nouveau accessible.`)
                .setColor('color');
            message.channel.send(embed);
        }, ms(duration));
    },
};
