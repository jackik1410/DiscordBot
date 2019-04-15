const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');

const main = require('../bot.js');
// const logger = main.logger;

const winston = require(`../logger.js`).winston;

//runs when name found in a message (not YET implemented)
module.exports = {
  "triggers":[
    {
      "name": "Yuri",
      "conditions": [],
      "run": async function run(client, msg){

      }
    }
  ]
};
