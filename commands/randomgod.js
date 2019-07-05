const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./dbs/gods.json');
const db = low(adapter);

var gods = db.get('gods').value();
var categories = db.get('categories').value();
module.exports = {
  "CommandArray":[
    {
      "name":"randomgod",
      "description":"none yet",
      "adminOnly": true,
      "run": async function run(client, msg, args, command){

        var roles= ["hunter", "mage", "warrior", "asassin", "guardian"];
        var pantheons= ["mayan", "roman", "greek", "norse", "chinese", "african", "japanese", "voodoo"];
        switch (args[0]) {
          case 'help':
          case 'list':
            msg.channel.send(`in the future, this will send info about arguments and stuff`);
            break;
          case undefined:

            break;
          default:


          //swap to categories.forEach( =>{}) instead in the future
          var criteria;
          if (roles.includes(args[0])) {
            criteria = {"array":roles, "property":"role"};
          } else if (pantheons.includes(args[0])) {
            criteria = {"array":pantheons, "property":"pantheon"};
          } else {
            msg.reply(`I didn't understand`);
            return;
          }


          var god;
          if (args.length() < 1) {
            god = gods[ Math.floor(Math.random() * gods.length) ];
          } else {
            while (true) {
              god = gods[ Math.floor(Math.random() * gods.length) ]; //chose random god
              if (god[criteria.property] === args[0]) { //check if conforms to property value
                break; //exit if found
              }
            }
          }
          msg.channel.send(`chosen god is: ${god.name}`);
          // msg.channel.send(`chosen god is: ${await JSON.toString(god)}`);
        }
      }
    }
  ]

};
