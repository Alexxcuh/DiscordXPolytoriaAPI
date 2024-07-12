const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents } = require('discord.js');

const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let latestMessage = '';

client.on('messageCreate', message => {
  if (message.channel.id === '1114552169002188895') {
    const displayName = message.member ? message.member.displayName : message.author.username;
    latestMessage = `[DISCORD] ${displayName}: ${message.content}`;
  }
});

app.get('/message', (req, res) => {
  res.json({ message: latestMessage });
});

client.login(process.env.TOKEN);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
