module.exports = {

    name: 'piconly',
    description: 'Définir un salon où il est uniquement possible de mettre des images',
    usage: 'piconly <channel> [off pour enlever]',
    aliases: ['imageonly'],
    userPermissions: ['MANAGE_MESSAGES'],
    cooldown: 2,

    run: async (client, message, args) => {
        message.delete().catch(() => {
        })
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;
        const guildData = client.managers.guildManager.getAndCreateIfNotExists(message.guild.id);
        const piconlyChannel = guildData.get('piconly')
        const lang = guildData.lang
        if (args[1] === 'off') {
            guildData.set('piconly', piconlyChannel.filter(ch => ch !== channel.id)).save();
            return message.channel.send(lang.piconly.disable(channel));
        }
        if (!channel || channel && !channel.isText()) {
            return message.channel.send(lang.piconly.wrongType);
        }
        piconlyChannel.push(channel.id);
        guildData.set('piconly', piconlyChannel).save().then(() => {
            return message.channel.send(lang.piconly.success(channel)).then((mp) => {
                setTimeout(() => {
                    mp.delete();
                }, 2000)
            })
        })
    }
}
