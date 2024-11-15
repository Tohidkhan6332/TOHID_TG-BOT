import { plugins, owner, prefixRegex, isPremiumUser } from '../lib/plugins.js';
import chalk from 'chalk';

function handler(bot) {
  bot.on('text', async (ctx) => {
    const messageText = ctx.message.text;
    const isGroupChat = ctx.message.chat.type.includes('group');
    const prefixMatch = messageText.match(prefixRegex);
    const hasPrefix = !!prefixMatch;
    const commandText = prefixMatch ? messageText.slice(prefixMatch[0].length).split(' ')[0] : messageText.split(' ')[0];
    const prefix = hasPrefix ? prefixMatch[0] : '';
    const plugin = plugins.get(commandText);

    if (plugin && ((hasPrefix && !plugin.noPrefix) || (!hasPrefix && plugin.noPrefix))) {
      const isOwner = owner.includes(ctx.message.from.username);
      const isPremium = isPremiumUser(ctx.message.from.username);
      
      // Check if the command is owner-only
      if (plugin.isOwner && !isOwner) {
        return await ctx.reply('🚩 This command can only be executed by the bot owner.');
      }

      // Check if the command is group-only
      if (plugin.isGroup && !isGroupChat) {
        return await ctx.reply('🚩 This command can only be used in groups.');
      }

      // Check if the command is premium-only
      if (plugin.isPremium && !isPremium) {
        return await ctx.reply('🚩 This command is for premium users only.');
      }

      // Check if command is no-prefix
      if (plugin.noPrefix && prefixMatch) {
        return;
      }

      const text = messageText.slice(commandText.length + (prefixMatch ? prefixMatch[0].length : 0)).trim();

      await plugin.operate(ctx, { text, prefix, command: commandText, bot });
      
      // Command Logs
      const user = ctx.message.from.username || ctx.message.from.first_name || 'Unknown';
      const chatType = isGroupChat ? 'Groups' : 'Private Chat';
      const chatName = isGroupChat ? ctx.message.chat.title : user;
      console.log(chalk.green(`[ COMMAND ]`) + chalk.blue(` ${commandText}`) + 
                  chalk.yellow(` From @${user}`) + chalk.cyan(` In ${chatType}: ${chatName}`));

    }
  });
}

export default handler;
