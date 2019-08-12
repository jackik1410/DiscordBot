const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');

const main = require('../bot.js');
// const logger = main.logger;
const fs = require('fs');
const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;

// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync('db.json');
// const db = low(adapter);


module.exports = {
  "CommandArray": [
    {
      "name": "stoploop",
      "description":"stops looping events by name",
      "adminOnly":true,
      "run": async function run(client){
        let foundevent = client.events.find(event => {
          if (event.name == args[0]) return true;
        });
        if (foundevent == undefined) {
          msg.channel.send("couldn't find anything with that name");
          return;
        }
        clearInterval(foundevent.runtime);
      }
    },
    { //eval DO NOT GIVE ACCESS TO ANYONE
      "name": "eval",
      "description": "Directly executes arguments as javascript, BEWARE",
      "adminOnly": true,
      "run": async function run(client, msg, args, command, db) {
        if (OPs.RealAdmins.includes(msg.author.id)) {
          // if (msg.author.id=="274303955314409472") {
          eval(msg.content.slice(1+command.length + 1));
        } else {
          winston.warn(msg.author.id + msg.author.username + " tried to call" + msg.content);
          msg.reply("You do not have admin priviliges for this bot.\n This is because giving it to you would entail full access to the entire server this bot is running on.");
        }
      }
    },
    {
      "name":"commandreload",
      "aliases":["reloadcommands","resetcommands","commandsrest"],
      "description":"reloads all commands (slightly faster than restarting)",
      "adminOnly": true,
      "run": async function run(){
        require('../bot.js').resetcommands();
      }
    },
    { // bot stats             shows embeded message with some stats of the bot
      "name":"bot",
      "aliases":['botinfo', 'info', 'generalinfo', 'botstats', 'stats'],
      "description": "displays general information about the bot",
      "run": async function run(client, msg, args){
          var memCount = 0;
          client.guilds.forEach(g =>{memCount +=g.memberCount;});

        msg.channel.send({
          "embed":{
            "title": client.user.username + " stats:",
            "description":`Bot is used on **${client.guilds.array().length}** Servers with **${memCount}** Members
            Currently connected to **${client.voiceConnections.array().length}** Voice Channels
            Has a total of **${client.commands.array().length}** loaded commands
            ${(msg.channel.type=='dm')?"":`Invite the bot to your server [here](${await client.generateInvite().then()})`}
            `
          }
        }).then((m) => {
          m.delete(1000*60*5).then(msg.delete()); // 5min
        });//timeout is in milliseconds
      }
    },
    { //todolist
      "name": "todo",
      "description": "adds items to the dev's todo list, pls do not abuse",
      "adminOnly": true,
      "run": async function run(client, msg, args, command, db) {
        var todolist = await db.get('todolist').value() || [];
        // console.log(todolist);
        switch (args[0]) {
          case 'show'://fall-through, but posted public
            var showpublic = true;
          case 'list':
            var list = [];
            for (var i = 0; i < todolist.length; i++) {
              list.push({
                "name": `-[${i+1}] ` + todolist[i].content,
                "value":todolist[i].author.name
              });
            }

            var message = await {
              "embed":{
                "title": "Bot TODOLIST:",
                "description": "",
                "fields": list
              }
            };
            if (showpublic) {
              msg.channel.send(message);
            } else {
              msg.author.send(message);
              msg.reply(`you were sent a DM with all todolist items.`).then(m=> m.delete(60*1000));
            }
            break;
          case 'add':
            await todolist.push({"author":{"id":msg.author.id, "name":msg.author.username},
                "content":msg.content.slice(client.prefix.length+command.length+"add".length+1)});
            // console.log(todolist);
            db.set('todolist', todolist).write();
            break;
          default:
            msg.channel.send("I didn't understand that");
            break;
        }
        // db.set(`todolist`, [{"author":msg.author, "content":msg.content.slice(1+command.length+1)}].concat(db.get(`todolist`).value())).write();
      }
    },
    {
      "name":"jaxuptime",
      "description":"",
      "run": async function run(client, msg, args){
        const os = require('os');
        let days = Math.floor(os.uptime()/60/60/24);
        let hours = Math.floor(os.uptime()/60/60)-days*24;
        let minutes = Math.floor(os.uptime()/60)-hours*60-days*24*60;
        let secs = Math.floor(os.uptime())-minutes*60-hours*60*60-days*24*60*60;
        msg.channel.send(`The Server (Jax' PC) has  now been running for: ${days} Tage, ${hours} Stunden, ${minutes} Minuten und ${secs} sekunden`);
        // process.uptime maybe?
      }
    }
  ]
};
