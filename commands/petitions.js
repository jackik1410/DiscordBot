const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./dbs/petitions.json');
const db = low(adapter);

var checkDBforExistance = function(msg, petitionname){
  if (!db.has(`petitions.${msg.guild.id}`).value()||db.get(`petitions.${msg.guild.id}`).value().length < 1) {
    msg.channel.send("No petitions found for your server...");
    return 1;
  }
};
var updatePetitions = function(msg, allpetitions, pet){
  return(db.set(`petitions.${msg.guild.id}`, allpetitions).write());
};

module.exports = {
  "CommandArray": [
    {
      "name": "petition",
      "aliases": ["pet"],
      "description": "Starting server petitions, joining them and listing them 'petition list, petition create ~name~, petition sign ~name~'",
      "run": async function run(client, msg, args, command){
        if(msg.channel.type == "dm"){
          msg.reply(`you can only do that on a server`);
          return;
        }
        // var petitionname = msg.content.slice(1 + command.length + 1 + args[0].length + 1);
        var petitionname = args[1]; //allows no spaces
        var allpetitions = db.get(`petitions.${msg.guild.id}`).value();
        var petition = allpetitions.find(pet => {if (pet.name == petitionname)return true;});
        let pet = allpetitions.find(pet => {
          if (pet.name == petitionname) return true;
        });
        switch (args[0].toLowerCase()) {
          case 'create'://works
            var newpetition = {"name": petitionname, "author": msg.author.id, "description": msg.content.slice(1 + command.length + 1 + args[0].length + 1 + petitionname.length + 1), "signatures":[]};
            if (!db.has(`petitions.${msg.guild.id}`).value()) {//initialize server to system
              db.set(`petitions.${msg.guild.id}`, [newpetition]).write();
            } else {//add to existing array
              if (db.get(`petitions.${msg.guild.id}`).value().find(pet=> {if(pet.name==petitionname) return true;})) {
                msg.reply(`petition with name '${petitionname}' already exists`);
                return;
              }
              allpetitions.push(newpetition);
              db.set(`petitions.${msg.guild.id}`, allpetitions).write();
              msg.react("👌");
            }
            break;
          case 'list'://works
            if (checkDBforExistance(msg)) return;
            var message = "";
            await db.get(`petitions.${msg.guild.id}`).value().forEach(async (pet) =>{
              client.fetchUser(pet.author).then(user => {
                message += `${pet.name} from ${user.username} with ${pet.signatures.length} signatures\n`;
              });
              // let petauthor = await client.fetchUser(pet.author);
              // message += `${pet.name} from ${petauthor.username} with ${pet.signatures.length} signatures\n`;
            });
            msg.channel.send(`PETITIONS for your server:\n${message}`);
            break;
          case 'sign'://works
              if (checkDBforExistance(msg)) return;
              //pet def above
              if (pet == undefined) {
                msg.reply("Didn't find petition with name");
                return;
              }
              if(pet.signatures.includes(msg.author.id)) {
                msg.reply(`You have already signed`);
                return;
              }
              pet.signatures.push(`${msg.author.id}`);
              updatePetitions(msg, allpetitions, pet);
              msg.react("👌");
            break;
          case 'unsign':
            if (checkDBforExistance(msg)) return;
            //pet def above
            if (pet == undefined) {
              msg.reply("Didn't find petition with name");
              return;
            }
            if(!pet.signatures.includes(msg.author.id)) {
              msg.reply(`You haven't already signed`);
              return;
            }
            let signPos = pet.signatures.indexOf(`${msg.author.id}`);
            pet.signatures.splice(signPos, 1);
            updatePetitions(msg, allpetitions, pet);
            msg.react("👌");
            break;
          case 'delete'://works
            if (checkDBforExistance(msg)) return;
            if (!petition) {
              msg.reply("Couldn't find petition with that name");
            }
            if (OPs.admins.includes(msg.author.id) || petition.author == msg.author.id) {
              allpetitions.splice(allpetitions.indexOf(petition));
              updatePetitions(msg, allpetitions, petition);
              msg.react("👌");
              return;
            } else {
              msg.reply(`You have no permissions to do that, you need to be either admin or the author of that petition`);
              return;
            }
            break;
          case 'info':
            if(checkDBforExistance(msg)) return;
            if (!petition) {
              msg.reply(`Petition with name: '${petitionname}' doesn't exist`);
              return;
            }
            let petauthor = client.fetchUser(petition.author);
            msg.channel.send(`The Petition '${petition.name}' authored by ${petauthor.username} now has ${petition.signatures.length} signatures. Description: \n${petition.description}`);
            break;
          case 'signatures':
            if(checkDBforExistance(msg)) return;
            if (!petition) {
              msg.reply(`Petition with name: '${petitionname}' doesn't exist`);
              return;
            }
            let Signatures="";
            await petition.signatures.forEach(async (sign) => {
              client.fetchUser(sign).then(signeduser => {
                Signatures += `${signeduser.toString()} `;
              });
            });
            await msg.author.send(`Signatures list for Petition ${petition.name} :\n${Signatures}`);
            msg.reply(`You were sent a list with all ${petition.signatures.length} signatures`);
            break;
          case 'edit':
            if(checkDBforExistance(msg)) return;
            if (!petition) {
              msg.reply(`petition with name '${petitionname}' couldn't be found`);
            }
            msg.reply('function not yet implemented');
            // msg.react("👌");
            break;
          case 'help':
              msg.channel.send(`This function is still being worked on. A Petition name cannot include spaces. Create petitions with 'petition create ~name~', sign them with 'petition sign ~name~' and view them with 'petition list' and 'petition info ~name~';`);
              return;
            break;
          default:
            msg.reply(`I didn't quite catch that, try 'help petition' for command help`);
        }
      }
    }
  ]
};
