const StreamChat = require("stream-chat").StreamChat;

const serverClient = StreamChat.getInstance(
  process.env.STREAMCHAT_CLIENT_ID,
  process.env.STREAMCHAT_API_KEY
);
module.exports = {
  chat: serverClient,
};
