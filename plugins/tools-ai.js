import axios from 'axios';

const helper = {
  command: ['ai'],
  category: 'tools',
  description: 'Ask a question to the AI',
  operate: async (ctx) => {
    if (!ctx.message.text) {
      return ctx.reply("Enter the message you want to ask.");
    }

    try {
      await ctx.replyWithChatAction("typing");

      const customPrompt = `I'm Tohid Khan, created by a developer named Mr Tohid. I can save your name ${ctx.from.first_name}, Say speak Hindi, I'm a fun and cool bot assistant.`;

      const response = await axios.post(
        "https://bagoodex.io/front-api/chat",
        {
          prompt: customPrompt,
          messages: [
            {
              content: "Hi, this is chatgpt using model gpt-4o, I was created by someone named Tohid, let's talk",
              role: "assistant",
            },
            { content: ctx.message.text, role: "user" },
          ],
          input: ctx.message.text,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
          },
        }
      );

      if (!response.data || response.data.errors) {
        console.error("Error:", response.data.errors);
        return ctx.reply("An error occurred while getting the answer.");
      }

      await ctx.reply(response.data);
    } catch (error) {
      console.error("Error:", error.message);
      ctx.reply("An error occurred while trying to get an answer.");
    }
  },
  noPrefix: false,
  isOwner: false,
  isGroup: false,
  isPremium: false,
};

export default helper;
