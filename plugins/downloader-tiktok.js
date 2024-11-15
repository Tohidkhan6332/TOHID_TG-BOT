import { tiktok } from "../components/tiktok.js";

const helper = {
  command: ["tiktok"],
  category: "download",
  description: "Download TikTok video or image slides",
  operate: async (ctx, { bot, text }) => {
    if (!/tiktok.com/.test(text))
      return await ctx.reply("Please provide a valid TikTok URL.");

    try {
      const result = await tiktok(text);
      const caption = `Caption: ${result.caption}`;

      if (result.type === "video") {
        await ctx.replyWithVideo(result.video.server2, {
          caption: caption,
        });
      } else if (result.type === "image") {
        if (result.images.length > 0) {
          for (const img of result.images) {
            await ctx.replyWithPhoto(img, { caption });
          }
        } else {
          await ctx.reply("No images found.");
        }
      }
    } catch (error) {
      console.error("Error fetching TikTok data:", error);
      await ctx.reply(
        "An error occurred while trying to fetch TikTok data. Please try again later.",
      );
    }
  },
  noPrefix: false,
  isOwner: false,
  isGroup: false,
  isPremium: false,
};

export default helper;
