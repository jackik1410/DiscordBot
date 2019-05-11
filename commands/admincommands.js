const OPs = require('../dbs/OPs.json');

const main = require('../bot.js');
const fs = require('fs');
const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;
const restart = require(`../logger.js`).restart;

//.catch(err => winston.error(err));
module.exports = {
  "CommandArray": [
    {
      "name":"restart",
      "aliases":["relog", "reset", "relaunch"],
      "description":"restarts the bot, first argument should be the timeout in seconds, anything after that will be logged as the reason;",
      "adminOnly": true,
      "run": async function run(client, msg, args, command){
          restart( msg.content.slice(client.prefix.length + command.length + 1 + (args[0] && typeof args[0]=='number')?args[0].length+1:0), (typeof args[0]=='number')?args[0]:0);
      }
    },
    { //oldrestart no longer used
      // "name": "oldrestart",
      // "aliases": ["oldreset", "oldrelog"],
      // "description": "Restarts the bot",
      // // "adminOnly": true,
      // "MemberOnly":true,
      // "run": async function run(client, msg, args) {
      //   await msg.reply("restarting bot...");
      //   process.exit();
      // }
    },
    { //admins, lists all admins stored in the dbs/OPs.json file
      "name": "admins",
      "MemberOnly":true,
      "description":"Lists all admins for this bot",
      "run": async function run(client, msg, args, command) {
        var adminlist = "";
        await OPs.admins.forEach(adminid =>{
          client.fetchUser(adminid).then(admin => {
            adminlist += `${admin.id}: ${admin.username}\n`;
          });
        });
        msg.channel.send("Admins for this Bot:\n```" + adminlist + "```");
      }
    },
    { //should send the log file to admins when requested
      "name": "requestlog",
      "aliases": ["requestlog", "logrequest", "getlog", "getlogs", "logs"],
      "description": "Sends the log file as DM",
      "adminOnly": true,
      "run": async function run(client, msg, args, command, db) {
        msg.channel.send(`Requested logs:`, {files:['./error.log']});
      }
    }
  ]
};
