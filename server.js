const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents } = require('discord.js');
const stringSimilarity = require('string-similarity');
const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;
const DISCORD_CHANNEL_ID = '1261730538906062848';

app.use(bodyParser.json());

let latestMessage = '';

let PlayersOnline = 0;

client.on('messageCreate', message => {
  if (message.channel.id === DISCORD_CHANNEL_ID && !message.author.bot) {
    const displayName = message.member ? message.member.displayName : message.author.username;
    let censoredContent = message.content;

    // Define an array of words to censor
    const censorList = [
      'n[i1]gg[aeiou]', 'f[ua]ck', 'mf', 'sh[i1]t', 'v[aeiou]g[i1]n[aeiou]',
      'p[a@]nt[i1][e3]s?', 'b[i1]tc?h?', 's[u0]ck[e3]r', 'c[h1]ld\\s*por[n]?',
      'porn', 'penis', 'bullsh[i1]t', 'rectum', 'bbc', 'wbc', 'bbd', 'wbd',
      'daisies\\s*destruction', 'p0rn', 'nlgger', 'nigg3r', 'sex'
    ];

    // Function to censor a word if it matches any pattern with at least 75% similarity
    function censorWord(word) {
      for (const pattern of censorList) {
        const regex = new RegExp(pattern, 'gi');
        const similarity = stringSimilarity.compareTwoStrings(word, pattern);
        if (regex.test(word) || similarity >= 0.75) {
          return '*'.repeat(word.length);
        }
      }
      return word;
    }

    // Split the message into words and censor each word if needed
    const words = censoredContent.split(/\s+/);
    const censoredWords = words.map(word => censorWord(word));
    censoredContent = censoredWords.join(' ');

    latestMessage = `[DISCORD] ${displayName}: ${censoredContent}`;
  }
});




app.get('/message', (req, res) => {
  res.json({ message: latestMessage });
});

app.get('/sendnotice', (req, res) => {
  const user = req.query.user;
  const after = req.query.message;
  if (!after || !user) {
    return res.status(400).send('Missing user or message parameter');
  }
  let formattedMessage = `nah`
  if (after == "join") {
    formattedMessage = `**${user}** Has joined the game! 👋 Hello!`;
    PlayersOnline += 1
  } else if (after == "leave") {
    formattedMessage = `**${user}** Has left the game! 😢 Bye!`
    PlayersOnline -= 1
  }

  // Change the bot status to show the number of players online
  client.user.setPresence({
    activities: [{ name: `${PlayersOnline} Players Online!` }],
    status: 'online'
  });

  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
  if (channel && formattedMessage != "nah") {
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


app.get('/sendmsg', (req, res) => {
  const user = req.query.user;
  const messageContent = req.query.message;
  console.log(req.query)
  if (!user || !messageContent) {
    return res.status(400).send('Missing user or message parameter');
  }

  const formattedMessage = `**${user}**: ${messageContent}`;
  
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
