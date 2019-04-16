const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;

const chessstuff = require('./chess/chessstuff.js');

const newboard = []
module.exports = {
  CommandArray:[
    {
      "name": "chess",
      "description": "Well, chess... not yet implemented",
      "cli": false,
      "adminOnly": true,
      "run": async function run(cliet, msg, args){
        if (msg.channel.type == 'dm') {
          msg.channel.send(`Chess is a multiplayer game, you will have to move to a server to be able to play it... (AI is in the works ;D)`);
          return;
        }
        var board = db.get('').value();


        switch (args[0]) {
          case 'move':
              //make a move
            break;
          case 'start':
            if (false) {//not already playing a chess match (maybe 1 active game at at time?)
              //msg.channel.send('already playing a agame...');
              return;
            }
              //starts a match agains the first mentioned player
              db.set(`chess`, newboard).write();
            break;
          case 'surrender' || 'surr':
              //
            break;
          case 'help':

            break;
          default:
            msg.channel.send(`I didn't understand your command, ${msg.member.nickname || msg.author.username}`);
        }
      }
    }
  ]
}
