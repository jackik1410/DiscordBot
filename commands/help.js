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
          msg.reply("You have no access to this command, " + msg.author.username);
          return;
        }
        msg.channel.send(`${ListedCommand.name}: ${await ListedCommand.description}`);
        return;
      }
      msg.reply("command not found, displaying help instead");
    }

    var helpmessage = "";
    var generalcommands = [];
    var membercommands = [];
    var admincommands = [];

    await client.commands.forEach(element =>{
      if (element.adminOnly && element.adminOnly == true) {
        if (OPs.admins.includes(msg.author.id)) {//don't bother doing if not going to be shown
          // admincommands += `\n"${element.name}": ${element.description}`;
          admincommands.push({
            "name":element.name || "unnamed",
            "value":element.description || "no description",
            "inline":true
        });
        }
      } else if (element.MemberOnly && element.MemberOnly == true) {
        if ( msg.channel.type != 'dm' && client.isUserMember(msg.member)) {//don't bother doing if not going to be shown
          membercommands.push({
            "name":(element.name || "unnamed" ) + "`Member`",
            "value":element.description || "no description",
            "inline":true
          });
        }
      } else {
        generalcommands.push({
          "name":element.name || "unnamed",
          "value":element.description || "no description",
          "inline":true
        });
      }
    });

  //double checking roles
    if ( msg.channel.type != 'dm' && client.isUserMember(msg.member)) {
      membercommands = "\nMember Commands: ";
    }

    helpmessage = {
      "content":"Available Commands: ",
      "embed":{
        "fields": generalcommands.concat(membercommands)
      }
  };
    msg.channel.send(helpmessage);
    if (OPs.admins.includes(msg.author.id)) {
      // admincommands =  "\nAdmincommands: ```javascript\n" + admincommands+"```";
      msg.channel.send({"embed":{
        "title":"Admin Commands",
        // "":"",
        "fields": admincommands,
      }});
    }
  }
}
