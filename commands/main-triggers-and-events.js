const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');
// const fs = require('fs');
// const timers = require('timers');
const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;

module.exports = {
  "TriggerArray":[
    {
      "name":"VWG",
      "shouldTrigger": async function shouldTrigger(client, msg){
          if(msg.guild && msg.guild.id == '388765646554398734') return true;
          return false;
      },
      "run": async function run(client, msg){
          var keywords = {
              "discord": {'react':'579419800837685298'},
              "yuri": {'react':'579357609203728394'},
              "slime":{'react':'579364833355497506'},
              "bomb":{'react':'🍍'},
              "sayori":{'react':'591314303026724916'},
              "intel":{'react':'593081087178047511'},
              "nvidia":{'react':'593122522476707842'},
              "amd":{'react':'593080676014882829'}
          }

          Object.keys(keywords).forEach(async word =>{
              if(msg.content.toLowerCase().match(word)) {
                  console.log('found '+word+' in message');
                  if(keywords[word].react) msg.react(`${keywords[word].react}`)
              }
          });
      }
    }
  ],
  "events":[
    {
      "name":"ActivityUpdate",
      "description":"Updates bot's presence",
      "looptime": 60000,
      "run": async function run(client){
        // let newactivity = db.get('activity').value().random();
        while (newactivity == undefined || newactivity.name == client.user.localPresence.game.name) {
          var activities = await db.get('activities').value();
          var newactivity = activities[Math.floor(Math.random() * activities.length)];
        }
        client.user.setActivity(newactivity.name, newactivity.details);
        // console.log(`updated activity to: `);
        // console.log(newactivity);
      }
    }
  ],
  "triggers":[

  ]
};
