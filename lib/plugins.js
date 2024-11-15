import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { isPremiumUser } from './database.js';

const pluginsDir = path.resolve('./plugins');
let plugins = new Map();
const prefixRegex = /^[°•π÷×¶∆£¢€¥®™+✓_=|/~!?@#%^&.©^]/i;
const owner = process.env.OWNER;

async function loadPlugin(file) {
  try {
    const pluginPath = `file://${path.resolve(pluginsDir, file)}?${Date.now()}`;
    const { default: helper } = await import(pluginPath);
    helper.file = file;
    plugins.set(helper.command[0], helper);
  } catch (error) {
    console.log(chalk.red(`Failed to load plugin ${file}: ${error.message}`));
  }
}

async function loadPlugins() {
  plugins.clear();
  const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
  for (const file of files) {
    await loadPlugin(file);
  }
  console.log(chalk.blue('Total plugins loaded:'), chalk.yellow(plugins.size));
}

async function getPluginsByCategory(categories) {
  const matchingPlugins = [];
  for (const plugin of plugins.values()) {
    if (categories.includes(plugin.category)) {
      matchingPlugins.push(plugin);
    }
  }
  return matchingPlugins;
}

async function cmdLoader(bot) {
  await loadPlugins();

  fs.watch(pluginsDir, async (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
      const filePath = path.resolve(pluginsDir, filename);
      const pluginKey = filename.replace('.js', '');

      if (eventType === 'change' || eventType === 'rename') {
        if (plugins.has(pluginKey)) {
          await loadPlugin(filename);
          console.log(chalk.magenta(`Plugin updated: ${filename}`));
        } else {
          await loadPlugin(filename);
          console.log(chalk.green(`Plugin added: ${filename}`));
        }
      } else if (eventType === 'unlink') {
        plugins.delete(pluginKey);
        console.log(chalk.red(`Plugin deleted: ${filename}`));
      }
    }
  });
}

export { loadPlugins, cmdLoader, getPluginsByCategory, plugins, owner, prefixRegex, isPremiumUser };
