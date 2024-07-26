const express = require('express');
const bodyParser = require('body-parser');
const { Client, Intents, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const app = express();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PORT = process.env.PORT || 3000;
const DISCORD_CHANNEL_ID = process.env.ChannelID;
const MODERATOR_CHANNEL_ID = process.env.ModeratorChannelID;
const Version = "1.9.0";
const APIVersion = '2.2.2';

const author = 'Polycord Team';
const cr = "Z2lnbFBSUA==";

function scr(scqe) {
  if (scqe == null) {
    return null;
  }
  return Buffer.from(scqe, 'base64').toString('utf-8');
}

app.use(bodyParser.json());

let latestMessage = ''; // do not change
let PlayersOnline = 0; // do not change
let playerList = {}; // New player list

function processMessage(input) {
  let username2 = '';
  let message2 = '';
  let i = 0;

  // Step through each character until we hit the colon (:)
  while (i < input.length && input[i] !== ':') {
    username2 += input[i];
    i++;
  }

  // If we found a colon, skip it and proceed to capture the message
  if (i < input.length && input[i] === ':') {
    i++; // Skip the colon

    // Remove any leading and trailing whitespace from the username
    username2 = username2.trim();

    // Remove the leading and trailing * from the username if present
    if (username2.startsWith('**') && username2.endsWith('**')) {
      username2 = username2.slice(2, -2);
    } else if (username2.startsWith('**')) {
      username2 = username2.slice(2);
    } else if (username2.endsWith('**')) {
      username2 = username2.slice(0, -2);
    }
    username2 = username2.replace("*", "")
    // Extract the message part after the colon
    message2 = input.slice(i).trim();
  }
  return { username2, message2 };
}

const BANLIST_FILE_PATH = path.join(__dirname, 'banlist.json');

// Initialize banList
let banList = {};

// Read the ban list from the file if it exists
try {
  if (fs.existsSync(BANLIST_FILE_PATH)) {
    const banListContent = fs.readFileSync(BANLIST_FILE_PATH, 'utf-8');
    banList = JSON.parse(banListContent);
    
    // Ensure banList is an object
    if (typeof banList !== 'object' || Array.isArray(banList)) {
      console.error('Error: banList is not an object.');
      banList = {}; // Reinitialize to an empty object
    }
  }
} catch (readError) {
  if (readError.code !== 'ENOENT') {
    console.error('Error reading banlist.json:', readError);
  }
}

// Function to ban a user
function banUser(user, reason) {
  if (!user || !reason) {
    console.error('Usage: banUser <user> <reason>');
    return;
  }

  // Check if the user is already banned
  if (banList[user]) {
    console.log(`${user} is already banned!`);
    return;
  }

  // Update banList
  banList[user] = reason;

  // Debugging information
  console.log('Ban list before stringifying:', banList);

  try {
    const updatedBanList = JSON.stringify(banList, null, 2);
    // Debug: Log updatedBanList
    console.log('Updated ban list JSON:', updatedBanList);

    // Write to file
    fs.writeFileSync(BANLIST_FILE_PATH, updatedBanList);

    // Verify file write
    const fileContent = fs.readFileSync(BANLIST_FILE_PATH, 'utf-8');
    console.log('File content after write:', fileContent);

    // Ensure the file content is parsed correctly
    const fileBanList = JSON.parse(fileContent);
    console.log('Ban list after writing to file:', fileBanList);
  } catch (error) {
    console.error('Error writing to banlist.json:', error);
  }
}


// Default configuration settings
let config = {
  mainColor: '#E33727',
  listTitle: '**Polycord Player List**',
  noPlayersDescription: '**No players online atm :cry:**',
  listDescription: '${playerList}',
  polytoriaColor: '#5964F0',
  helpTitle: '**Polycord Help**',
  banTitle: '**Successfully Banned User**',
  unbanTitle: '**Successfully Unbanned User**',
};

// Load config.json if it exists
if (fs.existsSync('config.json')) {
  try {
    config = JSON.parse(fs.readFileSync('config.json'));
  } catch (error) {
    console.error('Error reading config.json:', error);
  }
}

client.on('messageCreate', async message => {
  if (message.channel.id === DISCORD_CHANNEL_ID && !message.author.bot) {
    const displayName = message.member ? message.member.displayName : message.author.username;
    let censoredContent = message.content;

    // Define an array of words to censor
    const censorList = [
      'n[i1]gg[aeiou]','n[e3]g[a4@]', 'f[ua][ck][ck]?', 'f[ua][ck][ck]ing', 'f[ua][ck][ck]?e?r', 'f[ua][ck][ck]s', 'sh[i1]t',
      'v[aeiou]g[i1]n[aeiou]', 'p[a@]nt[i1][e3]s', 'b[il1]tch', 's[u0]ck[e3]r', 'c[h1]ld\\s*p[0o]rn',
      'p[0o]rn', 'p[3e£]n[il]s', 'bullsh[i1]t', 'r[3e]ctum', '[ck]unt',
      'f[a@]g', 'd[i1]ck', 'c[o0][nm]d[o0]m', 'wh[o0]r[e3]', 'c[o0][ck][ck]', 't[i1]t', 'p[i1]mp', 's[l1]ut', 'p[umn][s$5][s$5]y',
      '[s5][e3£5]x', 'r[e3S5£][tli][a@4]rd', '[ck][o0][ck][ck]', '[e3]r[il1]t[s5]', '[vy][il1]rg[il1][nm]',
      'c[unm][mun]', '[ck][o0][o0][ck][hnm][il][e3S5]', 'sh[il]t?', '[@a4][5s$][5s$]', '.c[o0][mn]', 'P[il]zd?[a@4]?', '.xyz', 'h[til][tli]p[s5]?', 'br[il]ck-h[il][li][li]', 'br[il]ckh[il][li][li]', 'bh', 'br[il]ck\\h[il][li][li]',
      'h[il]t[li][e3]r', 'h[e3]nt[a4@][il]', 'discord.gg', 'h[o0]m[o0]', 'kys', 'd[il][li]d[o0]',
      ':3', '[uo]w[uo]', 'd[o0]xx?', 'm[a4@][s$5]tur[b3][a4@]t[e3]?', '[s5][e3]gg[s5]', 'dr[unm]g', 'g[o0][o0]n', 'm[e3]th', 'gl[a@4]z[e3]', '[s5]u[i1l]c[i1l]d[e3]'
    ];

    // Define an array of words to allow
    const allowList = [
      'is', 'bro', 'censored', 'works', 'what', 'time', 'i', "it's", 'its', "it", 'work', "doesn't", "does", "doesnt",
      'false', 'polytoria.com', 'picasso', 'webhook', '.config', 'income', 'assets', 'cdn.discordapp.com', 'config', 'github.com/BStarsAlex', 'fact', 'facts', 'facs', 'cucumber', 'documentation', 'polytoria', 'multitasking', 'help', 'positives', 'no', 'grass', '', '-', 'sec', 'discord.gg/9GUJ8NWbKu', "discord.gg/polytoria", 'giggle', ' ', 'become', 'eggman', 'egg'
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
    let flagged = []
    // Function to censor a word if it matches any pattern in the censor list
    function censorWord(word) {
      if (isAllowed(word)) {
        return word; // Return the word if it is in the allow list
      }
      for (const pattern of censorList) {
        const regex = new RegExp(pattern, 'gi');
        if (regex.test(word) || similarity(word, pattern.replace(/\\/g, '')) >= 0.75) {
          flagged.push(word);
          console.log(word);
          return '*'.repeat(word.length); // Replace the word with asterisks of the same length
        }
      }
      return word;
    }
    
    // Split the message into words and censor each word if needed
    const words = censoredContent.split(/\s+/);
    flagged = []
    let repliedContent = '';
    let repliedDisplayName = "";
    let repcensoredContent = "";
    const censoredWords = words.map(word => censorWord(word));
    censoredContent = censoredWords.join(' ');
    latestMessage = `<color=${config.polytoriaColor}>[DISCORD] ${displayName}:</color> ${censoredContent}`;
    if (message.reference) {
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId)
        repliedContent = repliedMessage.content;
        repliedDisplayName = repliedMessage.member ? repliedMessage.member.displayName : repliedMessage.author.username;
        const repliedwords = repliedContent.split(/\s+/);
        const repcensoredWords = repliedwords.map(word => censorWord(word));
        repliedContent = repcensoredWords.join(' ');
        if (repliedDisplayName == "Polycord") {
          let { username2, message2 } = processMessage(repliedContent);
          latestMessage = `<color=#bfbfbf> v---> </color> ${username2}: <color=#bfbfbf>${message2}</color> \n<color=${config.polytoriaColor}>[DISCORD] ${displayName}:</color> ${censoredContent}`;
          console.log(latestMessage)
        }
      } catch (error) {
        console.error('Error fetching replied message:', error);
      }
    }
    if (repliedContent != "") {
      latestMessage = `<color=#bfbfbf> v---> </color><color=${config.polytoriaColor}>${repliedDisplayName}:</color><color=#bfbfbf> ${repliedContent}</color> \n<color=${config.polytoriaColor}>[DISCORD] ${displayName}:</color> ${censoredContent}`;
    }
    
    if (message.content != censoredContent) {
      const embed = new MessageEmbed()
      .setTitle('**Message Filtered!**')
      .setDescription(
        "Your message has been detected by our censor list.\n" +
        "`"+ flagged +"`\n" +
        "Don't worry, the message still got sent, but censored!"
      )
      .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
      .setColor(config.mainColor); // Use config color
    
    message.channel.send({ embeds: [embed] });
    }
    const channel = client.channels.cache.get(MODERATOR_CHANNEL_ID);
    if (channel && message.content != censoredContent) {
      const embed = new MessageEmbed()
      .setTitle('**Filter Violated!**')
      .setDescription(
        "Message sent by `"+ message.author.username + " / "+ displayName +"`\n" +
        "`"+ message.content +"` Had flagged word(s) `"+ flagged +"`\n" +
        "Filtered Message: `"+ censoredContent +"`"
      )
      .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
      .setColor(config.mainColor); // Use config color
      channel.send({ embeds: [embed] })
    }
  }
});

// Command handler for .list
client.on('messageCreate', message => {
  
  if (message.content === '.list' && message.channel.id === DISCORD_CHANNEL_ID) {
    let description = '';
    if (PlayersOnline > 0) {
      description = Object.keys(playerList).join('\n');
    } else {
      description = config.noPlayersDescription;
    }
    
    const embed = new MessageEmbed()
      .setTitle(config.listTitle)
      .setDescription(description)
      .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
      .setColor(config.mainColor); // Use config color
    
    message.channel.send({ embeds: [embed] });
  }

  if (message.content === '.help' && message.channel.id === DISCORD_CHANNEL_ID) {
    const embed = new MessageEmbed()
      .setTitle(config.helpTitle)
      .setDescription(
        "`.list` shows the players currently online\n" +
        "`.help` displays this help message\n" +
        "`.ban <user> <reason>` bans a user with a reason - Admin command\n" +
        "`.unban <user>` unbans a user - Admin command\n" +
        "`.config` displays current configuration settings - Admin command\n" +
        "`.config <setting> <value>` changes a configuration setting - Admin command\n"
      )
      .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
      .setColor(config.mainColor); // Use config color
    
    message.channel.send({ embeds: [embed] });
  }
  
  if (message.content.startsWith('.ban') && message.channel.id === DISCORD_CHANNEL_ID) {
    if (!message.member.roles.cache.has('1261731700766150698')) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const [command, user, ...reasonArr] = message.content.split(' ');
    const reason = reasonArr.join(' ');

    if (!user || !reason) {
      return message.channel.send('Usage: .ban <user> <reason>');
    }

    // Ensure banList is an object
    if (typeof banList !== 'object' || Array.isArray(banList)) {
      return message.channel.send('Ban list is not in the correct format.');
    }

    if (banList[user]) {
      return message.channel.send(`${user} is already banned!`);
    }
    
    banUser(user, reason);

    const embed = new MessageEmbed()
      .setTitle(config.banTitle)
      .setDescription("`" + user + "` got banned! Reason: `" + reason + "`")
      .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
      .setColor(config.mainColor); // Use config color

    message.channel.send({ embeds: [embed] });
  }
  
  if (message.content.startsWith('.unban') && message.channel.id === DISCORD_CHANNEL_ID) {
    if (!message.member.roles.cache.has('1261731700766150698')) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const [command, user] = message.content.split(' ');

    if (!user) {
      return message.channel.send('Usage: .unban <user>');
    }

    if (banList[user]) {
      delete banList[user];

      console.log('Ban list before writing to file:', banList); // Debug: Log ban list before writing

      try {
        const updatedBanList = JSON.stringify(banList, null, 2);
        fs.writeFileSync('banlist.json', updatedBanList);
        console.log('Ban list after writing to file:', JSON.parse(fs.readFileSync('banlist.json'))); // Debug: Log ban list after writing
      } catch (error) {
        console.error('Error writing to banlist.json:', error);
      }

      const embed = new MessageEmbed()
        .setTitle(config.unbanTitle)
        .setDescription("`"+ user +"` has been unbanned.")
        .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
        .setColor(config.mainColor); // Use config color

      message.channel.send({ embeds: [embed] });
    } else {
      message.channel.send(`${user} is not banned.`);
    }
  }

  if (message.content.startsWith('.config') && message.channel.id === DISCORD_CHANNEL_ID) {
    if (!message.member.roles.cache.has('1261731700766150698')) {
      return message.channel.send('You do not have permission to use this command.');
    }

    const args = message.content.split(' ');
    const setting = args[1];
    const value = args.slice(2).join(' ');

    if (!setting || !value) {
      const configEmbed = new MessageEmbed()
        .setTitle('**Current Configuration**')
        .setDescription(
          "**maincolor :** `"+ config.mainColor +"`\n" +
          "**listtitle :** `"+ config.listTitle +"`\n" +
          "**noplayersdescription :** `"+ config.noPlayersDescription +"`\n" +
          "**listdescription :** `"+ config.listDescription +"`\n" +
          "**discordcolor :** `"+ config.polytoriaColor +"`\n" +
          "**helptitle :** `"+ config.helpTitle +"`\n" +
          "**bantitle :** `"+ config.banTitle +"`\n" +
          "**unbantitle :** `"+ config.unbanTitle +"`\n"
        )
        .setFooter({ text: `Created By ${author} | Players online: ${PlayersOnline}` })
        .setColor(config.mainColor); // Use config color
      
      return message.channel.send({ embeds: [configEmbed] });
    }

    switch (setting.toLowerCase()) {
      case 'maincolor':
        config.mainColor = value;
        break;
      case 'listtitle':
        config.listTitle = value;
        break;
      case 'noplayersdescription':
        config.noPlayersDescription = value;
        break;
      case 'listdescription':
        config.listDescription = value;
        break;
      case 'discordcolor':
        config.polytoriaColor = value;
        break;
      case 'helptitle':
        config.helpTitle = value;
        break;
      case 'bantitle':
        config.banTitle = value;
        break;
      case 'unbantitle':
        config.unbanTitle = value;
        break;
      default:
        return message.channel.send('Invalid setting. Use .config to view available settings.');
    }

    try {
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error writing to config.json:', error);
    }

    message.channel.send(`Configuration updated: ${setting} is now set to ${value}`);
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
  if (!after || !user || !players) {
    return res.status(400).send('Missing user or message parameter');
  }
  
  if (banList[user]) {
    return res.status(200).json({ banned: "true", reason: banList[user] });
  }
  
  let formattedMessage = 'nah';
  if (after === ' Has joined the game! 👋 Hello!' || after === "join") {
    formattedMessage = `**${user}** Has joined the game! 👋 Hello!`;
    playerList[user] = true; // Add user to player list
  } else if (after === ' Has left the game! 😢 Bye!' || after === "leave") {
    formattedMessage = `**${user}** Has left the game! 😢 Bye!`;
    delete playerList[user]; // Remove user from player list
  }

  PlayersOnline = players;
  client.user.setPresence({
    activities: [{ name: `${PlayersOnline} ${PlayersOnline === 1 ? 'Player' : 'Players'} Online!`, type: 'WATCHING' }],
    status: 'online'
  });

  const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
  if (channel) {
    channel.send(formattedMessage)
      .then(() => res.status(200).json({ banned: "false", reason: "none" }))
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
      .then(() => res.status(200).send('Message sent'))
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
