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
          var timeout = (!isNaN(args[0]))?args.shift():0;
          var reason = args.join(" ");

          console.log("timeout value: " + timeout );
          console.log("note: " + reason);

          client.restart(reason, timeout*1000);
      }
    },
    {
      "name":"abortrestart",
      "aliases":["cancelrestart", "stoprestart"],
      "description":"Stops a pending restart of the bot",
      "adminOnly": true,
      "run": async function run(client, msg, args, command){
          client.abortRestart();
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
      "description": "Sends the log file as DM, specify date using !logs YY MM DD (not fully ready yet, use '!logs all' for the 10 newest)",
      "adminOnly": true, // should it be members aswell? not sure if this data should be available to them...
      "run": async function run(client, msg, args, command, db) {

        switch (args[0]) {
          case 'list':
            fs.readdir("./logs/", (err, files) => {
              files.sort();
              msg.reply(`list of all ${files.length} currently saved logs:\n` + JSON.stringify(files));
            });
            break;
          case 'all':
            var logs = [];
            fs.readdir("./logs/", (err, files) => {
              files.sort().reverse();
              for (var e in files) {
                if (e >= 10) {
                  msg.channel.send('maximum files reached (10)');
                  break;
                }
                if (files.hasOwnProperty(e)) {
                  logs.push("./logs/" + files[e]);
                }
              }

              msg.reply(`Requested logs:`, {'files':logs});
            });
            break;
          default:

        }

        let moment = require('moment');
        var file = `logs/${moment().format('DD.MM.YYYY')}.log`;


        // msg.channel.send(`Requested logs:`, {files:['./logs/31.05.2019.log']});

      }
    },
    {
      "name": "checkupdate",
      "description": "checks for updates available at the ",
      "adminOnly": true,
      "run": async function run(client, msg, args, command){

        try {
          var checkForUpdates = require("../autoupdatefromgit.js").checkForUpdates;
          checkForUpdates().then( m => {
            console.log("Resonse from function: " + m);
            msg.reply(m||"no updates");
          });
        } catch (e) {
          console.log(e);
          winston.error(e);
          msg.reply(e);
        }
      }
    }
  ]
};
