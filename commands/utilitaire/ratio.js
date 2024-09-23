const Discord = require('discord.js')

module.exports = {
    name: 'ratio',
    description: 'Ratio un membre',

    run: async (client, message, args) => {

       message.react('✅') 
       message.react('❌')
    }
}
