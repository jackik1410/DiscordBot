const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');
// const fs = require('fs');
// const timers = require('timers');
const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;

module.exports = {
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
