const express = require('express');
const bodyParser = require('body-parser');
const Discord = require('discord.js');

const app = express();
const client = new Discord.Client();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let latestMessage = '';

client.on('message', message => {
  if (message.channel.id === '1114552169002188895') {
    latestMessage = `[DISCORD] ${message.author.username}: ${message.content}`;
  }
});

app.get('/message', (req, res) => {
  res.json({ message: latestMessage });
});

client.login(process.env.TOKEN);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
