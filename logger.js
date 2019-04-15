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

winston.remove(winston.transports.Console);
let moment = require('moment');
winston.add( new winston.transports.File({ filename: `logs/${moment().format('DD.MM.YYYY')}.log`, level: 'debug' }));
winston.add(new winston.transports.Console(), {
    colorize: true,
    level: 'silly'
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
      OPs.RealAdmins.forEach(async (admin) => {
        client.fetchUser(admin).then(user => {
          if (info.level == 'error') {
            message = `${user.toString()} ` + message;
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


async function restart(){
  // winston.info('RESTARTING BOT');
  // await msg.channel.send("restarting bot...");
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
  "winston":winston,
  "db":db,
  "restart":restart
};
