const winston = require(`../logger.js`).winston;
const db = require(`../logger.js`).db;

const { validMove } = require('./chess/chessstuff.js');

const newboard = [];

function printPiece(piece){

}
function printBoard(board){
 var printedBoard = '';

  for (var y in object) {
    if (object.hasOwnProperty(y)) {
      printedBoard += '\n';
      for (var x in object) {
        if (object.hasOwnProperty(x)) {

        } else {
          break;
        }
      }
    } else {
      break;
    }
  }
  return '' + printedBoard + '';
}

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
        var board = db.get('chess.').value();


        switch (args[0]) {
          case 'test':
            msg.channel.send(printBoard(``));
            break;
          case 'move':
              ////make a move
              //if (validMove(x, y, desx, desy)) {
              //  //allow move
              // } else {
              //  //DENIED
              // }
            break;
          case 'start':
            if (false) {//not already playing a chess match (maybe 1 active game at at time?)
              //msg.channel.send('already playing a game...');
              return;
            }
              //starts a match agains the first mentioned player
              db.set(`chess.${msg.guild.id}.`, newboard).write();
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
