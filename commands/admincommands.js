const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');

const main = require('../bot.js');
// const logger = main.logger;
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
      "description":"restarts the bot",
      "adminOnly": true,
      "run": async function run(client, msg, args){
        restart();
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
