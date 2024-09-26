const Discord = require('discord.js')
const db = require('quick.db');

module.exports = {
    name: '8ball',
    description: "Pose une question à la boule de cristal magique !",

    run: async (client, message, args) => {

        let perm = ""
        message.member.roles.cache.forEach(role => {
            if(db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true
            if(db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
            if(db.get(`admin_${message.guild.id}_${role.id}`)) perm = true
        })
        if(client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true ) {

            const responses = [
                "C'est certain.",
                "C'est décidément ainsi.",
                "Sans aucun doute.",
                "Oui, absolument.",
                "Tu peux compter dessus.",
                "Comme je le vois, oui.",
                "Probablement.",
                "Oui.",
                "Les signes pointent vers le oui.",
                "Mieux vaut ne pas te le dire maintenant.",
                "Je ne peux pas prédire maintenant.",
                "Ne compte pas là-dessus.",
                "Ma réponse est non.",
                "Mes sources disent non.",
                "D'après le wiki de google, non.",
                "Très douteux.",
                "Je te conseille de lancer une pièce. 🪙",
                "L'avenir est incertain, comme une pizza. Tu ne sais jamais ce qu'il y aura à l'intérieur !"
            ];
            const question= args.join(" ")
            if (!question) {
                return message.reply("> Pose-moi une question pour que je puisse consulter ma boule de cristal ! ");
            }

            const randomIndex = Math.floor(Math.random() * responses.length);
            const response = responses[randomIndex];
            message.reply(`${response}`);
        }
    }
}
