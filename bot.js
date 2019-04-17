const Discord = require('discord.js'); //basic discord functionality
var OPs = require('./dbs/OPs.json'); //to be admin, or not to be admin
const fs = require("fs");

const db = require(`./logger.js`).db; //database, for storing and and retreiving data
const winston = require(`./logger.js`).winston; //provides logger functionality

require('./autoupdatefromgit.js'); //automatically checks for updates and updates the bot if found

var auth = require('./auth.json'); // contains the authentication token for the bot
const client = new Discord.Client({
   token: auth.token, //can be manually edited here aswell
   autorun: true
});
client.login(auth.token);//needed

process.title = `running V-WG Bot`;


//file handler for commands
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();//refering to client.commands

client.events = new Discord.Collection();
client.triggers = new Discord.Collection();

//reading and collection the actual files
function loadCommands(){
  fs.readdir("./commands/", (err, files) => {
    if(err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if(jsfile.length <= 0){
      console.log("Commands Folder empy, no commands found");
      return;
    }

    jsfile.forEach((f, i) => {
      if(!f.endsWith(".js")) return;
      let commandfile = require(`./commands/${f}`);
      console.log(`${f} found`);

      if (commandfile.CommandArray) {
        console.log("  installing multiple:");
        commandfile.CommandArray.forEach(element => {
          if(!element.name) return;
          client.commands.set(element.name, element);
          console.log(`      - ${element.name}`);
          if (element.aliases) {
            console.log(`          aliases:`);
            let aliases = "";//aliases directly refer to the command object
            element.aliases.forEach(alias => {
              client.aliases.set(alias, element.name);
              aliases += ", " + alias;
            });
            console.log(`             ${aliases.slice(2)}`);
          }
        });
      }
      if (commandfile.name) {
        client.commands.set(commandfile.name, commandfile);
        console.log(`   installed - ${commandfile.name}`);
        if (commandfile.aliases) {
          console.log(`          aliases:`);
          var aliases = "";//aliases directly refer to the commandfile
          commandfile.aliases.forEach(alias => {
            client.aliases.set(alias, commandfile.name);
            aliases += ", " + alias ;
          });
          console.log(`             ${aliases.slice(2)}`);
        }
      }

      if (commandfile.events) { //loading Events
        commandfile.events.forEach(async (event) => {
          if(! event.looptime || event.looptime < 50) {
            winston.warn(`${event.name} has looptime = ${event.looptime}, setting it to 60000ms for now;`);
            event.looptime = 60000;
          }
          if (!event.run || (event.active==false)) {
            winston.error(`${event.name} has no defined run function or was deactivated`);
            return;
          }
          console.log(`starting ${event.name} event loop every ${event.looptime}ms`);
          event.runtime = setInterval(event.run, event.looptime, client); //.catch(err => winston.error(err))
        });
      }
    });
  });
}
function resetCommands(){
  delete client.commands, client.aliases, client.triggers, client.events;
  loadCommands();
}
loadCommands(); //ACTUALLY loading commands

client.on('ready', () => { // tell them when you're ready
  module.exports = {"client": client, "resetcommands": resetCommands};
  const consoleinput = require('./consoleinput');

  console.log("\n\n\n\nREADY - CLI initialized");
  winston.info(`Reconnected as ${client.user.username} - (${client.user.id})`);
  client.user.setActivity(`my systems boot up`, {"type": "WATCHING"});
});

client.on('error', (error) => {
  winston.error(error);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  winston.info(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  winston.info(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

client.on('message', async msg => {

  if (msg.author.bot) return; //would react to own messages otherwise

  {//to be moved via the 'trigger' Collection
    if (msg.isMemberMentioned(client.user)) {
      winston.info("bot was mentioned by " + msg.author.toString()+ " in : " + msg.content);
      OPs.admins.forEach(adminid => {
        client.fetchUser(adminid).then(admin => {
          admin.send(msg.author.username + " mentioned bot in:\n" + msg.content);
        });
      });
    }
    if (msg.author.id == '289752534032056320' || msg.author.username=="Yuri") {
      msg.react('525995512172904451');
      msg.react('🦍');
    }
    if (['yuri', 'moritz', 'kaesekuchen', 'käsekuchen'].some(triggerword => {if (msg.content.toLowerCase().match(triggerword)) return true;}) || msg.isMentioned('289752534032056320')) {
      msg.react('525995512172904451');

    }
    if (msg.content.toLowerCase().match('wtf')) {
      msg.react('557192347704754216');
    }
    if (msg.content.toLowerCase().match("bomb")) {
      msg.react('🍍');
    }
    if (msg.content.toLowerCase().match("scheiß bot")) {
      msg.react('🖕');
    }
    if (msg.content.toLowerCase().match("gewitter")) {
      msg.react("525993358154530817");
      msg.reply("GEWITTER?!");
    }
  }


  //HERE START THE COMMANDS
  if (0!= msg.content.startsWith('!')) {} else return; //only act when called

  var args = msg.content.slice(1).trim().split(/ +/g);
  var command = args.shift().toLowerCase();
  //commandhandler
  let ListedCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command)) || client.aliases.get(command);
  if (ListedCommand) {
    if (ListedCommand.adminOnly == true && !OPs.admins.includes(msg.author.id)){
      msg.reply(`I'm sorry, i can't let you do that ${msg.author.toString()}`);
      return;
    }
    if (ListedCommand.MemberOnly == true && !msg.member.roles.some(r => ["Moderator", "Mitbewohner", "Admin", "el jefe"].includes(r.name)) && !OPs.RealAdmins.includes(msg.author.id)) { // || msg.guild.id != '525972362617683979'
      msg.reply(`It seems you weren't invited to the party ${msg.author.username}, only Members are allowed that command on the V-WG server.`);
    }
    ListedCommand.run(client, msg, args, command, db).catch(err => winston.error(err));
    let info = "";
    if (OPs.RealAdmins.includes(msg.author.id)) {
      info = `Admin ${msg.author.username} ran command: ${msg.content.slice(1)}`;
    } else {
      info = `${msg.author.toString()} ran command: ${msg.content.slice(1)}`;
    }
    winston.info(info);
    return;
  }

});
