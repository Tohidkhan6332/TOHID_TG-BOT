const helper = {
  command: ['kick'],
  category: 'groups',
  description: 'Forcibly expelling group members',
  operate: async (ctx) => {
    if (!ctx.message.reply_to_message) {
      return await ctx.reply("Please reply to the user you want to kick.");
    }
    
    const userId = ctx.message.reply_to_message.from.id;
    
    try {
      await ctx.kickChatMember(userId);
      await ctx.reply(`Successfully kicked user ${ctx.message.from.username} from the group.`);
    } catch (error) {
      console.error(error);
      await ctx.reply("Failed to kick the user. Make sure I have the required admin privileges.");
    }
  },
  noPrefix: false,
  isOwner: true,
  isGroup: true,
  isPremium: false,
};

export default helper;
