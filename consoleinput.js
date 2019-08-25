const db = require(`./logger.js`).db;
const winston = require('./logger.js').winston;
var client = require('./client.js');

var ConsoleCommands = { // commands defined just for CLI usage, primarily for debug and development
  "test": function (){
      console.log('works...\n fine!');
    },
  "eval": function (line, command){
      eval(line.trim().slice(command.length +1));
    },
  "commands": function (){
      console.log(client.commands);
    },
  "commandreload": require('./bot.js').resetcommands,
  "": function (){

    },
  "": function (){

    }
}


// stuff needed to pretent messages came via Discord to use those commands aswell(where possible)

//msg.member.roles
var msg = {
  'author':{'username':'server','id':'0000'},
  // 'member':{'roles':[{'name':'Mitbewohner'}, {'name':'Admin'}, {'name':'Server'}]},
  'member':{},
  'createdTimestamp': new Date(),
  'guild': {'channels':[], 'id':'0000'},
  'content':'',//is edited when passed
  'channel':{'send':SendMsg},
  'reply':SendMsg,
  'edit':SendMsg
};
msg.member.roles = [{name:'Mitbewohner'}, {name:'Admin'}, {name:'Server'}];

async function SendMsg(text){
  console.log("response: " + text);
  return msg;
};

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt:''
});
rl.on('line', (line) => {
  try {
    winston.silly(`CLI input: "${line}"`); // just in case something breaks, will be loged in the files
    var args = line.trim().split(/ +/g);
    var command = args.shift().toLowerCase();
    if (ConsoleCommands[command] != null) {
      ConsoleCommands[command](line, command, args);
    } else {
      // standart commandhandler
      msg.content = client.prefix + line.trim(); //update
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
        winston.info(`running \`${ListedCommand.name}\` from CLI`);
        ListedCommand.run(client, msg, args, command, db).catch(err => winston.error(err));
      }
    }

  } catch (err) {
    winston.error(err);
  } finally {
    //nothing
  }
  rl.prompt();
});
