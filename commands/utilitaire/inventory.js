const Discord = require('discord.js')

module.exports = {

    name: 'inventory',
    description: 'Show your inventory | Afficher votre inventaire',
    // Optionnals :
    usage: 'inventory',
    category: 'coins',
    aliases: ['inv', 'bag'],
    clientPermissions: ['EMBED_LINKS'],
    cooldown: 4,
    coinsOnly: true,


    run: async (client, message, args) => {


        const guildData = client.managers.guildManager.getAndCreateIfNotExists(message.guild.id);
        const color = guildData.get('color')
        const userData = client.managers.userManager.getAndCreateIfNotExists(`${message.guild.id}-${message.author.id}`)
        const memberInvetory = userData.get('inventory')
        const formatedInventory = !memberInvetory ? `Inventaire vide` : memberInvetory.map((inv) => `**${inv.item}**  •  x\`${inv.amount}\``); // inv.item == itemName and inv.amount = number of 1 item
        const embed = new Discord.MessageEmbed()
            .setAuthor(`Inventory of ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
            .setDescription(formatedInventory)
            .setThumbnail(`https://media.discordapp.net/attachments/747028239884615751/821044567833968710/706473362813091931.gif`)
            .setColor(`${color}`)
            .setFooter(`© OneForAll Coins`)
        message.channel.send(`> **Viewing server inventory • [**  ${message.author.tag} **] •** `, {embeds: [embed]})

    }
}
