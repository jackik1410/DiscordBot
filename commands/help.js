const fs = require("fs");
const OPs= require("../dbs/OPs.json");

module.exports = {
  "name": "help",
  "aliases": ["?"],
  "description": "type 'help' or 'help ~command~' to show their description",
  "adminOnly": false,
  "run": async function run(client, msg, args, command) {

      // console.log(args.length + "   " + args);//to never be dug out again
    if (args && args.length >= 1) {
      let ListedCommand = client.commands.get(msg.content.slice(2+command.length)) || client.commands.get(client.aliases.get(msg.content.slice(2+command.length)));
      if (ListedCommand) {
        if (ListedCommand.adminOnly && !OPs.admins.includes(msg.author.id)){
          msg.reply("You have no acces to this command, " + msg.author.username);
          return;
        }
        msg.channel.send(`${ListedCommand.name}: ${ListedCommand.description}`);
        return;
      }
      msg.reply("command not found, displaying help instead");
    }

    var helpmessage = "";
    var generalcommands = "";
    var membercommands = "";
    var admincommands = "";

    await client.commands.forEach(element =>{
      if (element.adminOnly && element.adminOnly == true) {
        if (OPs.admins.includes(msg.author.id)) {//don't bother doing if not going to be shown
          admincommands += `\n"${element.name}": ${element.description}`;
        }
      } else if (element.MemberOnly && element.MemberOnly == true) {
        if ( msg.channel.type != 'dm' && msg.member.roles.some(r => ["Moderator", "Mitbewohner", "Admin", "el jefe"].includes(r.name))) {//don't bother doing if not going to be shown
          membercommands += `\n<${element.name}>: ${element.description}`;
        }
      } else {
        generalcommands += `\n'${element.name}': ${element.description}`;
      }
    });

  //double checking roles
    if ( msg.channel.type != 'dm' && msg.member.roles.find(r => r.name == "Mitbewohner")) {
      membercommands = "\nMember Commands: ```javascript\n" + membercommands+"```";
    }
    if (OPs.admins.includes(msg.author.id)) {
      admincommands =  "\nAdmincommands: ```javascript\n" + admincommands+"```";
    }
    helpmessage = "Available Commands: ```javascript\n" + generalcommands + "```" + membercommands + admincommands;
    msg.channel.send(helpmessage);
  }
}
