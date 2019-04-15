const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');
const fs = require('fs');
// const timers = require('timers');
const winston = require(`../logger.js`).winston;
// const client = require(`../bot.js`).client;

var IsReady = 1;
var soundformats = ['.wav','.mp3', '.ogg'];

module.exports = {
  "events": [
    {
      "name": "abfuck",
      "description": "randomly annoying the fuck out of someone",
      "active": false,
      "looptime": 5000,
      "run": async function run(client){
          // client.guilds[]
          console.log('was called');
      }
    }
  ],
  "CommandArray": [
    { //report
      "name":"sound",
      "description": "still not entirely implemented",
      "MemberOnly": true,
      "run": async function run(client, msg, args, command) {
        switch (args[0]) {//args[0]
          case 'test':
            msg.channel.send(await fs.readdir('./Sounds/'));
            return;
          case 'play':
            //not yet intended to work
            return;
          default:

        }
        let path = `./Sounds/${args[0]}.wav`;
        if (!fs.existsSync(path)) {
          path = `./Sounds/${args[0]}.mp3`;
          if (!fs.existsSync(path)) {
            msg.reply(`couldn't find Sound`);
            return;
          }
        }
        while(true){
          if (IsReady != 1) {
            // setTimeout( function () {}, 2000);
          } else {
            IsReady = 0;
            let VC = await msg.member.voiceChannel;
            if (VC == undefined) {
              msg.reply(`You are not in a voiceChannel`);
              return;
            }
            IsReady = 0;
            await VC.join().then(connection => {
              let dispatcher = connection.playFile(path);
              dispatcher.on("end", end => {
                setTimeout(function (msg){VC.leave(); IsReady = 1;}, 1500, msg);
              });
            }).catch(err => winston.error(err));
            break;
          }
        }
      }
    }
  ]
};
