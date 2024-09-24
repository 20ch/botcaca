const Discord = require('discord.js')

module.exports = {
    name: 'randomuser',
    description: "Tire un membre du serveur au hasard",

    run: async (client, message, args) => {

        let guildId = message.guild.id;
        const guild = await client.guilds.fetch(guildId);
        const members = await guild.members.fetch();
        const randomMember = members.random();

        message.channel.send({ content: `${randomMember}` });
    }
}
