const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents } = require('discord.js');

const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;
const DISCORD_CHANNEL_ID = '1114552169002188895';

app.use(bodyParser.json());

let latestMessage = '';

client.on('messageCreate', message => {
  if (message.channel.id === DISCORD_CHANNEL_ID) {
    const displayName = message.member ? message.member.displayName : message.author.username;
    latestMessage = `[DISCORD] ${displayName}: ${message.content}`;
  }
});

app.get('/message', (req, res) => {
  res.json({ message: latestMessage });
});

app.post('/sendmsg', (req, res) => {
  console.log('request sent')
  const user = req.query.user;
  const messageContent = req.query.message;
  console.log(req.query)

  if (!user || !messageContent) {
    return res.status(400).send('Missing user or message parameter');
  }

  const formattedMessage = `[POLYTORIA] ${user}: ${messageContent}`;
  
  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
  if (channel) {
    channel.send(formattedMessage)
      .then(() => {
        res.status(200).send('Message sent');
      })
      .catch(error => {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
      });
  } else {
    res.status(500).send('Channel not found');
  }
});

client.login(process.env.TOKEN);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
