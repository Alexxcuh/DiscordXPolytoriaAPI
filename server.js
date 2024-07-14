const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents } = require('discord.js');
const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;
const DISCORD_CHANNEL_ID = process.env.ChannelID;
// go to .env and put ChannelID and TOKEN, in ChannelID you put the id of the channel where the polycord will send messages to, and change TOKEN to your token
const Version = "1.8.0";
const APIVersion = '2.1.0';

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

client.on('messageCreate', message => {
  if (message.channel.id === DISCORD_CHANNEL_ID && !message.author.bot) {
    const displayName = message.member ? message.member.displayName : message.author.username;
    let censoredContent = message.content;

    // Define an array of words to censor
    const censorList = [
      'n[i1]gg[aeiou]', 'f[ua]ck', 'f[ua]cking', 'f[ua]cker', 'f[ua]cks', 'sh[i1]t', 
      'v[aeiou]g[i1]n[aeiou]', 'p[a@]nt[i1][e3]s', 'b[i1]tch', 's[u0]ck[e3]r', 'c[h1]ld\\s*p[0o]rn',
      'p[0o]rn', 'p[3e£]n[il]s', 'bullsh[i1]t', 'r[3e]ctum', '[ck]unt',
      'f[a@]g', 'd[i1]ck', 'wh[o0]r[e3]', 'c[o0]ck', 't[i1]t', 'p[i1]mp', 's[l1]ut', 'p[umn][s$5][s$5]y',
      '[s5][e3£5][xcsg]', 'g[4@a][nmuy] [s5][e£35][xcsg]', 'r[e3S5£][tli][a@4]rd', '[ck][o0][ck][ck]', '[vy][il1]rg[il1][nm]',
      'c[unm][mun]', '[ck][o0][o0][ck][hnm][il][e3S5]'
    ];

    // Define an array of words to allow
    const allowList = [
      'is', 'bro', 'censored', 'works', 'what', 'time', 'i', "it's", 'its', "it", 'work', "doesn't", "does", "doesnt",
      'false', 'positives', 'no'
    ];

    // Function to check if a word is in the allow list
    function isAllowed(word) {
      return allowList.some(allowedWord => allowedWord.toLowerCase() === word.toLowerCase());
    }

    // Levenshtein distance function
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

    // Function to censor a word if it matches any pattern in the censor list
    function censorWord(word) {
      if (isAllowed(word)) {
        return word; // Return the word if it is in the allow list
      }
      for (const pattern of censorList) {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(word) || similarity(word, pattern.replace(/\\/g, '')) >= 0.75) {
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
