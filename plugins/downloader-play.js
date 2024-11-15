import { Spotify } from '../components/spotify.js';

const helper = {
  command: ['play'],
  category: 'download',
  description: 'Search and play music from Spotify',
  operate: async (ctx, { text, prefix, command }) => {
    if (!text) {
      return await ctx.reply(`Please provide the song title you want to play. Example: ${prefix + command} [song title]`);
    }

    try {
      await ctx.reply("⏳ Searching for the song...");

      const spotify = new Spotify();
      const searchResult = await spotify.searchTrack(text);

      if (searchResult.error) {
        return await ctx.reply("Song not found. Please try another title.");
      }

      const songInfo = `🎶 *Title:* ${searchResult.trackName || "Unknown"}\n` +
                       `👤 *Artist:* ${searchResult.artistName || "Unknown"}\n` +
                       `🔗 *URL:* [Listen on Spotify](${searchResult.externalUrl})`;

      await ctx.reply(songInfo, { parse_mode: 'Markdown' });

      const trackData = await spotify.downloadTrack(searchResult.id);

      await ctx.replyWithAudio(
        { url: trackData.trackUrl },
        { title: searchResult.trackName, performer: searchResult.artistName }
      );
    } catch (error) {
      console.error("Error downloading song:", error.message);
      await ctx.reply("An error occurred while trying to download the song. Please try again later.");
    }
  },
  noPrefix: false,
  isOwner: false,
  isGroup: false,
  isPremium: false,
};

export default helper;
