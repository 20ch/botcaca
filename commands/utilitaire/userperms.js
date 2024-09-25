const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "userperms",
  aliases: ["usrprms"],
  description: "Afficher les permissions d'un utilisateur sur le serveur.",

  run: async(client, message, [member = '']) => {
    if(!member.match(/\d{17,19}/)) {
        member = message.author.id;
    };
    member = await message.guild.members.fetch(member.match(/\d{17,19}/)[0]).catch(() => null);
    if(!member) {
        return message.channel.send(`\\❌ Utilisateur introuvable. Veuillez vérifier l'orthographe du nom d'utilisateur et réessayer.`);
    };
    const sp = member.permissions.serialize();
    const cp = message.channel.permissionsFor(member).serialize();
    return message.channel.send(new MessageEmbed().setColor(member.displayColor || 'color').setTitle(`${member.displayName}'s Permissions`).setFooter(`Permissions | \©️${new Date().getFullYear()} `).setDescription(['\\📊 - Ce serveur', '\\#️⃣ - Ce salon', '\`\`\`properties', '📊 | #️⃣ | Permission', '========================================', `${Object.keys(sp).map(perm => [
          sp[perm] ? '✔️ |' : '❌ |',
          cp[perm] ? '✔️ |' : '❌ |',
          perm.split('_').map(x => x[0] + x.slice(1).toLowerCase()).join(' ')
        ].join(' ')).join('\n')}`, '\`\`\`'].join('\n')));
   }
}
