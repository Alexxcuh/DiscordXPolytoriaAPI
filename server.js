const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents } = require('discord.js');
const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;
const DISCORD_CHANNEL_ID = process.env.ChannelID;

const Version = "1.7.0";
const APIVersion = '2.0.0';

const cr = "Z2lnbFBSUA==";

function scr(scqe) {
  if (scqe == null) {
    return null
  }
  return atob(scqe);
}

app.use(bodyParser.json());

let latestMessage = ''; // do not change

let PlayersOnline = 0; // do not change

const levenshtein = (a, b) => {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Function to calculate similarity ratio
const similarity = (a, b) => {
  const distance = levenshtein(a, b);
  return (1 - distance / Math.max(a.length, b.length));
};

client.on('messageCreate', message => {
  if (message.channel.id === DISCORD_CHANNEL_ID && !message.author.bot) {
    const displayName = message.member ? message.member.displayName : message.author.username;
    let censoredContent = message.content;

    // Define an array of words to censor
    const censorList = [
      'n[i1]gg[aeiou]', 'f[ua]ck', 'mf', 'sh[i1]t', 'v[aeiou]g[i1]n[aeiou]',
      'p[a@]nt[i1][e3]s?', 'b[i1]tc?h?', 's[u0]ck[e3]r', 'c[h1]ld\\s*por[n]?',
      'porn', 'penis', 'bullsh[i1]t', 'r[3e]ctum', 'bbc', 'wbc', 'bbd', 'wbd',
      'daisies\\s*destruction', 'p0rn', 'nlgger', 'nigg3r', 's[3e][xggs]'
    ];

    // Function to censor a word if it matches any pattern with at least 75% similarity
    function censorWord(word) {
      for (const pattern of censorList) {
        const regex = new RegExp(pattern, 'gi');
        const similarityRatio = similarity(word, pattern);
        if (regex.test(word) || similarityRatio >= 0.75) {
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

app.get('/version', (req, res) => {
  res.json({ ScriptVer: Version, APIVer: APIVersion, Credit: scr(cr) });
});

app.get('/sendNotice', (req, res) => {
  const user = req.query.user;
  const after = req.query.after;
  const players = req.query.players;
  console.log(players)
  console.log(after)
  if (!after || !user || !players) {
    return res.status(400).send('Missing user or message parameter');
  }
  let formattedMessage = 'nah';
  if (after == ' Has joined the game! 👋 Hello!' || after == "join") {
    formattedMessage = `**${user}** Has joined the game! 👋 Hello!`;
  } else if (after == ' Has left the game! 😢 Bye!' || after == "leave") {
    formattedMessage = `**${user}** Has left the game! 😢 Bye!`;
  }
  PlayersOnline = players
  if (PlayersOnline == 1) {
    client.user.setPresence({
      activities: [{ name: `${PlayersOnline} Player Online!`, type: 'WATCHING' }],
      status: 'online'
    });
  } else {
    client.user.setPresence({
      activities: [{ name: `${PlayersOnline} Players Online!`, type: 'WATCHING' }],
      status: 'online'
    });
  }


  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
  if (channel || scr(cr) != null) {
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
