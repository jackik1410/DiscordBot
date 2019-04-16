// const rl = require('readline-async');
// console.log(rl);

// rl.addCommands();
// rl.onLine(function (line) {
//   console.log(`received input was: '${line}'`);
//   // eval(line);
// })

// module.exports = async function (client){
//   while (true) {
//     await rl.question(' ', (input) => {
//       eval(input);
//       rl.close();
//     });
//   }
// };


const db = require(`./logger.js`).db;
const winston = require('./logger.js').winston;
var client = require('./bot.js').client;

// stuff needed to pretent messages came via Discord
async function SendMsg(msg){
  console.log(msg);
  return;
};
//msg.member.roles
var msg = {
  'author':{'username':'server','id':'0000'},
  // 'member':{'roles':[{'name':'Mitbewohner'}, {'name':'Admin'}, {'name':'Server'}]},
  'member':{},
  'guild': {'channels':[], 'id':'0000'},
  'content':'',//is edited when passed
  'channel':{'send':SendMsg},
  'reply':SendMsg
};
msg.member.roles = [{name:'Mitbewohner'}, {name:'Admin'}, {name:'Server'}];


const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt:''
});
rl.on('line', (line) => {
  try {
    msg.content = "!" + line.trim();//update
    var args = line.trim().split(/ +/g);
    var command = args.shift().toLowerCase();
    switch (command) {
      case 'clieval':
          eval(line.trim().slice(command.length +1));
        break;
      case 'test':
        console.log(client.commands);
        break;
      case 'hello':
        console.log('world! I WORK!');
        break;
      default:
        //commandhandler
        let ListedCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command)) || client.aliases.get(command);
        if (ListedCommand) {
          if (!ListedCommand.run) {
            console.log(ListedCommand);
            console.log("command couldn't be run, run() not defined");
            return;
          }
          if (ListedCommand.cli == false) {
            console.log('This command was intentionally deactivated for the CLI');
            return;
          }
          ListedCommand.run(client, msg, args, command, db).catch(err => winston.error(err));
        }
        break;
    }
  } catch (err) {
    winston.error(err);
  } finally {
    //nothing
  }
  rl.prompt();
});
