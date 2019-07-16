const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');

const main = require('../bot.js');
// const logger = main.logger;

const winston = require(`../logger.js`).winston;

// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync('db.json');
// const db = low(adapter);


module.exports = {
  "CommandArray": [
    { //report
      "name":"report",
      "aliases": [`request`],
      "description": "This will directly message all admins of this bot. Please only use when finding issues or when trying to harrass the author ;D",
      "run": async function run(client, msg, args, command) {
        OPs.admins.forEach(admin =>{
          client.fetchUser(admin)
            .then(op=> {
              op.send(`${msg.author} just sent this: ` + msg.content);
            })
            .catch(console.error);
        });
      }
    },
    { //stream
      "name":"stream",
      "MemberOnly": true,
      "description": "Use to tell everyone that V-WG is Life, i mean live...",
      "run": async function run(client, msg, args) {
        var announcement = `@here , We have an announcement to make, we're live! \n check us out on https://www.twitch.tv/virtuelle_wg`;
        // msg.guild.channels.find()
        var announcementchannel = await msg.guild.channels.find( function(chan){
          if (chan.type == "text" && chan.name.match("news") ) return chan;
        });
        if (!announcementchannel) {
          msg.reply("Didn't find text-channel 'announcements'");
          return;
        }
        announcementchannel.send(announcement);
      }
    },
    { //stream
      "name":"gstream",
      "description": "Use to tell everyone that V-WG is Life, i mean live...",
      "run": async function run(client, msg, args) {
        var announcement = `@here , We have an announcement to make, we're live! \n check us out on https://www.twitch.tv/virtuelle_wg`;
        // msg.guild.channels.find()
        var announcementchannel = await msg.guild.channels.find( function(chan){
          if (chan.type == "text" && chan.name.match("news") ) return chan;
        });
        if (!announcementchannel) {
          msg.reply("Didn't find text-channel 'announcements'");
          return;
        }
        announcementchannel.send(announcement);
      }
    },
    { //tell
      "name": "tell",
      "description": "msg mentioned user",
      // "adminOnly": true,
      "MemberOnly": true,
      "run": async function run(client, msg, args, command) {
        await msg.mentions.users.forEach(user =>{
          user.send(msg.content.slice(command.length + 1));
        });
        msg.react("👌");
      }
    },
    { //purge
      "name": "purge",
      "aliases": ["deletemsgs", "erradicate"],
      "MemberOnly": true,
      "description": "Deletes Messages in the current channel, up to 100 at a time",
      "run": async function run(client, msg, args) {
        const deleteCount = parseInt(args[0], 10);

        if(!deleteCount || deleteCount < 2 || deleteCount > 100) {
          return msg.reply(`${args[0]} is not a number bewteen 2 and 100`);
        }

        const fetched = await msg.channel.fetchMessages({limit: deleteCount});
        msg.channel.bulkDelete(fetched)
          .catch(error => msg.reply(`Couldn't delete messages because of: ${error}`));
      }
    },
    { //rally
      "name": "rally",
      "description": "moves all members of the role 'Mitbewohner' to the 'Wohnzimmer'",
      "MemberOnly": true,
      "run": async function run(client, msg, args) {
        var reply = "";
        await msg.member.guild.roles.find("name", "Mitbewohner").members.forEach(member => {
          if (member.voiceChannel) {
            member.setVoiceChannel("536246570946002959");
            reply = `${member.user.username} was rallied\n` + reply;
          } else {
            reply = reply + `${member.user.username} can't be bothered\n`;
          }
        });
        msg.channel.send("Gathering Members:\n" + reply);
      }
    },
    { //move
      "name": "move",
      "MemberOnly": true,
      "description": "Moves all mentioned users to the first VoiceChannel containing the tag, usage: '!move ~destiny~ @user1 @user2 ...'",
      "run": async function run(client, msg, args, command) {
        var reply="";
        // var channel = msg.member.guild.channels.find("name", args[0]);
        var channel = msg.member.guild.channels.find(function(chan){
          if(chan.name.includes(args[0])) return chan;
        });
        if (channel) {
          if(msg.mentions.length == 0) {
            msg.reply("you need to mention all people to be moved");
            return;
          }
          msg.mentions.members.forEach( async (member) => {
            if (member.voiceChannel) {
                member.setVoiceChannel(channel.id);
                reply = `${member.user.username} was rallied\n` + reply;
              } else {
                reply = reply + `${member.user.username} can't be bothered\n`;
              }
          });
        } else {
          msg.channel.send("couldn't find channel");
        }
      }
    },
    {
      "name":"listemojis",
      "description":"displaying all emojis on the server",
      "adminOnly": false,
      "MemberOnly": false,
      "run": async function run(client, msg, args) {
        const emojiList = msg.guild.emojis.map((e, x) => ('`'+ x + '` = ' + e) + ' | ' +e.name).join('\n');
        msg.channel.send("Server Emojilist: \n" + emojiList);
      }
    }
  ]
};
