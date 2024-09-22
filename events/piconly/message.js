module.exports = {
    name: 'messageCreate',
    run: async (client, message) => {
        if (!message.guild || message.member && message.member.permissions.has("ADMINISTRATOR")) return;
        let guildData = client.managers.guildManager.getAndCreateIfNotExists(message.guild.id)
        const piconly = guildData.get('piconly');
        if (piconly.includes(message.channel.id) && message.attachments.size <= 0) {
            return message.delete().catch(() => {
            })
        }
    }
}
