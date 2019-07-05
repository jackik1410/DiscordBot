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

        var roles= ["hunter", "mage", "warrior", "assassin", "guardian"];
        var pantheons= ["mayan", "roman", "greek", "norse", "chinese", "african", "japanese", "voodoo"];
        switch (args[0]) {
          // case 'test':
          //   console.log(
          //     await Object.keys(categories).forEach(cat => {
          //       if (categories[cat].includes(args[1])) {
          //         console.log(cat);
          //         console.log(categories[cat]);
          //         return cat;
          //       }
          //     })
          //   );
          //   return;
          //   break;
          case 'help':
          case 'list':
            // msg.channel.send(`in the future, this will send info about arguments and stuff`);
            var list=[];
            await gods.forEach( god =>{
              list.push({
                "name":god.name || "none",
                "value":`${god.role + " ".repeat(10-god.role.length)} -  ${god.pantheon}`,
                "inline":true
              });
            });
            msg.channel.send({
              "embed":{
                "title":"GODs list",
                "description": `List of all ${gods.length} gods`,
                "fields":list
              }
            });
            break;
          case undefined:

            break;
          default:


          //swap to categories.forEach( =>{}) instead in the future

          // console.log('1');

          var criteria = null;
          await Object.keys(categories).forEach(cat => {
            if (categories[cat].includes(args[0])) {
                  console.log(cat);
                  // console.log(categories[cat]);
              criteria = cat;
              return;
            }
          });
          if (criteria == null) {
            msg.reply(`I didn't understand...`);
            return;
          }

          // console.log('2');

          var god;
          if (args.length < 1) {
            god = gods[ Math.floor(Math.random() * gods.length) ];
          } else {
            for (var i = 0; i < 1000; i++){ // to have a chance to recover if all checks fail, only try 1.000 times
              god = gods[ Math.floor(Math.random() * gods.length) ]; //chose random god

              // console.log(god.name + " - " + god[criteria] + "===" + args[0] );
              // console.log( (god[criteria] === args[0].toLowerCase()) + " " + typeof god[criteria] + "===" + typeof args[0]);

              if (god[criteria].toLowerCase() === args[0].toLowerCase()) { //check if conforms to property value
                break; //exit if found
              }
            }
          }
          msg.channel.send(`chosen god is: ${god.name}`, {
            "embed":{
              "title":god.name,
              "description": god.role + " ".repeat(10-god.role.length) + " - " + god.pantheon
            }
          });
          // msg.channel.send(`chosen god is: ${await JSON.toString(god)}`);
        }
      }
    }
  ]

};
