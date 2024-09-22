const { Message, Client } = require('discord.js');

module.exports = {
  name: 'restartbot',
  description: 'Restarts the bot using PM2',
  execute(message, args) {
    if (message.content.startsWith('!restartbot') && message.author.id === '1063868133737234492') {
      try {
        require('child_process').execSync('pm2 restart atomic', { stdio: 'inherit' });
        message.reply('Bot restarted successfully!');
      } catch (error) {
        console.error('Error restarting bot:', error);
        message.reply('An error occurred while restarting the bot.');
      }
    } else {
      message.reply('You do not have permission to restart the bot.');
    }
  },
};
