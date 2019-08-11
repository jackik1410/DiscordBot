const Discord = require('discord.js'); //basic discord functionality
var OPs = require('./dbs/OPs.json'); //to be admin, or not to be admin
const fs = require("fs");


require('./autoupdatefromgit.js'); //automatically checks for updates and updates the bot if found, comment out if not wanted

// var auth = require('./auth.json'); // contains the authentication token for the bot
// const client = new Discord.Client({
//    token: auth.token, //can be manually edited here aswell to token: 'YouRTokenHeRe',
//    autorun: true
// });
// client.login(auth.token);//needed
var client = require('./client.js');
process.title = `running V-WG Bot`;//only you can see this
client.prefix = "!"; // just change the prefix here


const {db, winston} = require(`./logger.js`);
//database: for storing and and retreiving data, winston: provides logger functionality

//Defining some global functions for easier use

client.isUserAdmin = function(user){
  return OPs.admins.includes(user.id);
};
client.isUserRealAdmin = function(user){
  return OPs.RealAdmins.includes(user.id);
};
client.isUserMember = function(user){
  if (client.isUserAdmin(user)) {
    return true;
  }
  return user.roles.some(r => ["Moderator", "Mitbewohner", "Admin", "el jefe"].includes(r.name));
};


//reading files and collecting the commands
async function loadCommands(extensiveLogging){

    //preparing collections for commands (this is how they are accessible later)
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();//refering to client.commands

    client.events = new Discord.Collection();
    client.triggers = new Discord.Collection();

    var commandlocations = ['./commands/', './commands private/'];

    var commandsloaded = 0; //for show and debugging purposes
    var locationsloaded = 0; //
    await commandlocations.forEach(comloc =>{
        fs.readdir(comloc, (err, files) => {
            if(extensiveLogging) console.log(`-------------- Reading files from ${comloc}`);
            if(err) winston.log(err);
            let jsfile = files.filter(f => f.split(".").pop() === "js");
            if(jsfile.length <= 0){
              if(extensiveLogging) console.log("Commands Folder empy, no commands found");
              return;
            }

            jsfile.forEach((f, i) => {
              if(!f.endsWith(".js")) return;
              let commandfile = require(comloc+f);
              if(extensiveLogging) console.log(`${f} found`);

              if (commandfile.CommandArray) {
                if(extensiveLogging) console.log("  installing multiple:");
                commandfile.CommandArray.forEach(element => {
                  if(!element.name) return;
                  client.commands.set(element.name, element);
                  if(extensiveLogging) console.log(`      - ${element.name}`);
                  if (element.aliases) {
                    let aliases = "";//aliases directly refer to the command object
                    element.aliases.forEach(alias => {
                      client.aliases.set(alias, element.name);
                      aliases += ", " + alias;
                    });
                    if(extensiveLogging) console.log(`          aliases: ${aliases.slice(2)}`);
                  }
                  commandsloaded += 1;
                });
              }
              if (commandfile.name) {
                client.commands.set(commandfile.name, commandfile);
                if(extensiveLogging) console.log(`   installed - ${commandfile.name}`);
                if (commandfile.aliases) {
                    var aliases = "";//aliases directly refer to the commandfile
                    commandfile.aliases.forEach(alias => {
                        client.aliases.set(alias, commandfile.name);
                        aliases += ", " + alias ;
                    });
                    if(extensiveLogging) console.log(`          aliases: ${aliases.slice(2)}`);
                }
                commandsloaded += 1;
              }

              if (commandfile.triggers) {
                //still thinking about the structure here...
              }

                if (commandfile.events) { //loading Events
                    commandfile.events.forEach(async (event) => {
                        if (!event.run || (event.active==false)) {
                        winston.warn(`${event.name} has no defined run function or was deactivated`);
                        return;
                        }
                        if(! event.looptime || event.looptime < 500) {
                        winston.warn(`${event.name} has looptime = ${event.looptime}, setting it to 60000ms for now;`);
                        event.looptime = 60000;
                        }
                        if(extensiveLogging) console.log(`        starting ${event.name} event loop every ${event.looptime}ms`);
                        event.runtime = setInterval(event.run, event.looptime, client); //.catch(err => winston.error(err))
                        //commandsloaded += 1; //these are events, not commands... unsure if i should include them
                        client.events.set(event.name, event);
                    });
                }
            });
            locationsloaded=+1;
            winston.info(`successfully loaded ${commandsloaded} commands from ${locationsloaded + "/" + commandlocations.length} locations`);
        });
    });
    return commandsloaded;
}
function resetCommands(){
  winston.info('reloading all bot commands');
  delete client.commands, client.aliases, client.triggers, client.events;
  loadCommands(false);
}
loadCommands(true); //ACTUALLY loading commands

client.on('ready', async () => { // tell them when you're ready
  module.exports = {"client": client, "resetcommands": resetCommands};
  const consoleinput = await require('./consoleinput');

  console.log("\n\n\n\nREADY - CLI initialized");
  winston.info(`Reconnected as ${client.user.username} - (${client.user.id})`);
  client.user.setActivity(`my systems boot up`, {"type": "WATCHING"});
});

client.on('error', async (error) => {
  if (error.message.match('ECONNRESET')) {
    winston.info('Client suffered ECONNRESET, error caught, carrying on...');
    return;
  }
  if (error.message.match('ENOTFOUND')) {
    winston.info('Client suffered ENOTFOUND, error 443, carrying on as normal...');
    return;
  }
  winston.error(error);
});

client.on('debug', async (debugmsg) => {
    if(debugmsg.toLowerCase().match('heartbeat') && true){
        return;
    }
  winston.debug('client ' + debugmsg);
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

  if (msg.author.bot) return; //would react to own messages otherwise, potentially

  {//to be moved via the 'trigger' Collection
    if (msg.isMemberMentioned(client.user)) {
      winston.info("bot was mentioned by " + msg.author.toString()+ " in : " + msg.content);
      OPs.admins.forEach(adminid => {
        client.fetchUser(adminid).then(admin => {
          admin.send(msg.author.username + " mentioned bot in:\n" + msg.content);
        });
      });
    }
    if (msg.author.id == '289752534032056320' || msg.author.username=="Yuri" || ['yuri', 'moritz', 'kaesekuchen', 'käsekuchen'].some(triggerword => {if (msg.content.toLowerCase().match(triggerword)) return true;}) || msg.isMentioned('289752534032056320')) {
      // msg.react('579336050153881601');//old
      msg.react('579357609203728394');//new
    }
    /*
    if (msg.content.toLowerCase().match('discord')) {
      msg.react('579419800837685298');
    }
    // if (msg.content.toLowerCase().match('wtf')) {
    //   // msg.react('557192347704754216');
    // }
    if (msg.content.toLowerCase().match("bomb")) {
      msg.react('🍍');
    }
    if (["scheiß", "shit", "dumb", "fucking", "friggin", "shitty"].some(curse => msg.content.toLowerCase().match( curse + " bot"))) {
      msg.react('🖕');
    }
    if (msg.content.toLowerCase().match("gewitter")) {
      // msg.react("525993358154530817");
      msg.reply("GEWITTER?!");
    }
    */
  }


  //HERE START THE COMMANDS
  if (0!= msg.content.startsWith(client.prefix)) {} else {
      if(msg.channel.type == 'dm') {
          winston.info(`DM from ${msg.author.toString()}: ` +msg.content); //sends messages to the bot to the bot admins, they could be complaints or suggestions
      } else return; //only act when called
  }

  var args = msg.content.slice(1).trim().split(/ +/g);
  var command = args.shift().toLowerCase();
  //commandhandler
  var ListedCommand = client.commands.get(command) || client.commands.get(client.aliases.get(command)) || client.aliases.get(command);
  if (ListedCommand) {
    if (ListedCommand.adminOnly == true && !OPs.admins.includes(msg.author.id)){
      msg.reply(`I'm sorry, i can't let you do that ${msg.author.toString()}`);
      return;
    }
    if (ListedCommand.MemberOnly == true && !client.isUserMember(msg.member) && !OPs.RealAdmins.includes(msg.author.id)) { // || msg.guild.id != '525972362617683979'
      msg.reply(`It seems you weren't invited to the party ${msg.author.username}, only Members are allowed that command on the V-WG server.`);
    }
    if (ListedCommand.guildOnly && msg.channel.type !='text') {
        msg.channel.send("That command is only available on a server, I'm sorry.");
        return;
    }
    winston.info(`${OPs.RealAdmins.includes(msg.author.id)?`Admin ${msg.author.username}`:msg.author.toString()} ran command: ${msg.content.slice(client.prefix.length)}`);
    try {
      ListedCommand.run(client, msg, args, command, db).catch(err => winston.error(err));
    } catch (e) {
      winston.log(e);
    }

    return;
  }

});
