const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents } = require('discord.js');

const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;
const DISCORD_CHANNEL_ID = '1261730538906062848';

app.use(bodyParser.json());

let latestMessage = '';

client.on('messageCreate', message => {
  if (message.channel.id === DISCORD_CHANNEL_ID && !message.author.bot) {
    const displayName = message.member ? message.member.displayName : message.author.username;
    let censoredContent = message.content;

    // Define an object of words to censor mapped to their replacements
    const censorMap = {
      // Words to censor and their replacements
      'n[i1]gg[aeiou]': '******',              // nigga, n1gga, n!gga, etc.
      'f[ua]ck': '****',                       // fuck, fack, fuk
      'mf': '**',                              // mf
      'sh[i1]t': '****',                       // shit, sh1t, etc.
      'v[aeiou]g[i1]n[aeiou]': '*****',        // vagina, v@gina, etc.
      'p[a@]nt[i1][e3]s?': '****',             // panti, panties, panty, pantie
      'b[i1]tc?h?': '****',                    // bitch, b1tch, b1tch, etc.
      's[u0]ck[e3]r': '******',                // sucker, sukker, etc.
      'c[h1]ld\\s*por[n]?': '*****',           // child porn, cp, child pornography
      'porn': '****',                          // porn
      'penis': '*****',                        // penis
      'bullsh[i1]t': '*******',                // bullshit, bullsh1t, etc.
      'rectum': '******',                      // rectum
      'bbc': '***',                            // bbc
      'wbc': '***',                            // wbc
      'bbd': '***',                            // bbd
      'wbd': '***',                            // wbd
      'daisies\\s*destruction': '****************', // daisies destruction
      'p0rn': '****',                          // p0rn
      'nlgger': '******',                      // nlgger
      'nigg3r': '******'                       // nigg3r
    };

    // Replace censored words with asterisks of the same length as the original word
    for (const [pattern, replacement] of Object.entries(censorMap)) {
      const regex = new RegExp(pattern, 'gi');
      censoredContent = censoredContent.replace(regex, replacement);
    }

    latestMessage = `[DISCORD] ${displayName}: ${censoredContent}`;
  }
});



app.get('/message', (req, res) => {
  res.json({ message: latestMessage });
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
