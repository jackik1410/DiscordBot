const Discord = require('discord.js'); //basic discord functionality
var client = require('./client.js');
const {winston} = require(`./logger.js`);
const fs = require("fs");

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
        if(fs.existsSync(comloc)) fs.readdir(comloc, (err, files) => {
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

              if(commandfile.TriggerArray){
                if(extensiveLogging) console.log("  reading Triggers:");
                commandfile.TriggerArray.forEach( trigger => {
                  if(extensiveLogging) console.log(`      + ${trigger.name}`);
                  client.triggers.set(trigger.name, trigger);
                });
              }

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

module.exports = {loadCommands, resetCommands};
