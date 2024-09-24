const { exec } = require('child_process');

module.exports = {
  name: 'restartbot',
  description: 'Restarts the bot using PM2',

  execute(client, message, args, prefix) {
    if (message.author.id !== '1063868133737234492') {
      return message.reply('You do not have permission to restart the bot.');
    }

    try {

      message.reply('Je vais redemarrer');

      // Execute PM2 restart command
      exec('pm2 restart atomic', (error, stdout, stderr) => {
        if (error) {
          console.error('Error restarting bot:', error);
          return message.reply('An error occurred while restarting the bot.');
        }
        message.reply('Bot restarted successfully!');
      });
    } catch (error) {
      console.error('Error executing restart:', error);
      message.reply('An error occurred while trying to restart the bot.');
    }
  }
};
