const Discord = require('discord.js');
var winston = require('winston');
const Transport = require('winston-transport');
var auth = require('./auth.json');
var OPs = require('./dbs/OPs.json');
const fs = require("fs");

const client = new Discord.Client({
   token: auth.token,
   autorun: true
});
client.login(auth.token);//needed

winston.format.combine(
  winston.format.colorize(),
  winston.format.json()
);
winston.remove(winston.transports.Console);
let moment = require('moment');
winston.add( new winston.transports.File({ filename: `logs/${moment().format('YY.MM.DD')}.log`, level: 'debug', format:     winston.format.combine(
  winston.format.timestamp(),
  // winston.format.simple(),
  winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
)}));
winston.add(new winston.transports.Console({level: 'silly',
  format : winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    // winston.format.simple(),
    winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`),
  )
}), {
  // colorize: true,
  // level: 'silly'
});
// winston.level = 'info';
  // new winston.transports.File({ filename: 'error.log', level: 'error' });
  // new winston.transports.File({ filename: 'combined.log' });
client.on('ready', () => {
  class CustomTransport extends Transport {
    constructor(opts) {
      super(opts);
      // Consume any custom options here. e.g.:
      // - Connection information for databases
      // - Authentication information for APIs (e.g. loggly, papertrail,
      //   logentries, etc.).
    }
    log(info, callback) {
      // Perform the writing to the remote service
      var message = `${info.level}: ${info.message}`;

      var VWG = client.guilds.get('388765646554398734');
      var jacksID = '274303955314409472';
      OPs.RealAdmins.forEach(async (admin) => {
        client.fetchUser(admin).then(user => {

          if (info.level == 'error') {

            if ( VWG.presences.has(jacksID) || user.id == jacksID) { //if i'm online, annoy me only
              message = `${user.toString()} ` + message;
            }
          }

          user.send(message);
        });
      });
      // setImmediate(() => {
      //   this.emit('logged', info);
      // });
      callback();
    }
  }
  // const transport = new CustomTransport();

  // winston.add( new CustomTransport);
  winston.add( new CustomTransport());
});


// DataBase
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('./dbs/db.json');
const db = low(adapter);

async function restart(reason, timeout){
  if (client.rebooting != undefined) {
    winston.info(`a restart is already scheduled`);
    return false;
  }
  if (timeout == undefined || typeof timeout != 'number') {
    timeout = 0;
  }

  winston.info(`RESTARTING BOT${(timeout ==0)?'':` in ${timeout}`}, reason:` + (reason != undefined)?reason:'no reason given');
  if (false) {//notify all voiceChannel users with a short message
    var broadcast = client.createVoiceBroadcast();
    await client.voiceConnections.forEach(async (connection) =>{
      connection.playBroadcast(broadcast);
    });
    broadcast.playFile(`Sounds/`);
  }
  if (timeout > 0) {
    client.rebooting = {
      'timer':setTimeout(rebootBot(), timeout*1000),
      'reason': reason};
  } else {
    rebootBot();
  }
  return true;
}
function abortRestart(){
  if (client.rebooting.timer != undefined) {
    clearTimeout(client.rebooting.timer);
    delete client.rebooting;
    winston.info('scheduled restart aborted');
  } else {
    winston.info('No restart scheduled, nothing happened');
  }
}

function rebootBot(){
  const { spawn } = require('child_process');
  const subprocess = spawn(process.argv[0], [`../bot.js`], {
    detached: true,
    // stdout: process.stdout,
    // stdio: 'inherit'
    stdio: ['ignore', 'ignore', 'ignore']
  });
  if (subprocess == undefined) {
    winston.info("Couldn't restart bot");
    return;
  }
  if (subprocess.connected) {
    console.log('disconnecting subprocess');
    subprocess.disconnect();
  }
  subprocess.unref();
  process.exit();
}

module.exports = {
  "winston": winston,
  "db": db,
  "restart": restart,
  "abortrestart": abortRestart,
};
