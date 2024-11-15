import fs from 'fs';
import { getPluginsByCategory } from '../lib/plugins.js';

const categories = {
  "info": "Information",
  "download": "Downloader",
  "groups": "Groups",
  "tools": "Tools"
};

const helper = {
  command: ['menu'],
  category: 'info',
  description: 'Display menu by category',
  operate: async (ctx) => {
    try {
      const plugins = await Promise.all(
        Object.keys(categories).map(async (key) => {
          const categoryPlugins = await getPluginsByCategory([key]);
          return {
            category: categories[key],
            plugins: categoryPlugins
          };
        })
      );

      const availableCategories = plugins.filter(cat => cat.plugins.length > 0);

      if (availableCategories.length > 0) {
        const menuMessage = [
          `Hello @${ctx.message.from.username}!\n let me introduce myself, I'm *Tohid Khan* a telegram bot assistant who can help your daily activities.\n`,
          ...availableCategories.map(cat => {
            return `*[ ${cat.category} ]*\n` +
              cat.plugins.map(plugin => {
                const uniqueCommands = [...new Set(plugin.command)];
                return uniqueCommands.map(cmd => `.${cmd}`).join('\n') +
                  `\n  - *Description:* ${plugin.description || 'No description available'}`;
              }).join('\n');
          })
        ].join('\n\n');

await ctx.replyWithPhoto({ source: fs.createReadStream('./components/image/thumbnail.jpg') }, { caption: menuMessage, parse_mode: 'Markdown' });
      } else {
        await ctx.reply(`There are no menus available for the specified categories.`);
      }
    } catch (error) {
      console.error(`Error fetching plugins by category: ${error.message}`);
      await ctx.reply('An error occurred while retrieving the menu. Please try again later.');
    }
  },
  noPrefix: false,
  isOwner: false,
  isGroup: false,
  isPremium: false,
};

export default helper;
