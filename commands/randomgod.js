const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var adapter = new FileSync('./dbs/gods.json');
var db = low(adapter);

var gods = db.get('gods').value();
var categories = db.get('categories').value();




function FullGod(godObject){
  try {

    if (!godObject.attack) {
      godObject.type = new Promise((resolve, reject) => {
        if (["mage", "hunter"].includes(godObject.role)) {
          resolve("ranged");
        } else if (["assassin", "warrior", "guardian"].includes(godObject.role)) {
          resolve("melee");
        } else reject();
      }).catch(e => console.log(e));
    }
    if (!godObject.type) {
      godObject.type = new Promise((resolve, reject) => {
          if (["mage", "guardian"].includes(godObject.role)) {
            resolve("magical");
          } else if (["assassin", "warrior", "hunter"].includes(godObject.role)) {
            resolve("physical");
          } else reject();
          }).catch(e => console.log(e));
    }


  } catch (e) {
    winston.log(e);
  } finally {

  }
  // return god;
}


async function SendGodInfo(msg, god, full){
    // console.log(god);
    FullGod(god);
    // console.log(god);
  var GodInfo = {
    "embed":{
      "title":god.name,
      "description": god.role + " ".repeat(10-god.role.length) + " - " + god.pantheon
    }
  };
  if (full) {
    GodInfo.embed.description += `\n${await god.type} ${await god.attack} attack`;
  }

  msg.channel.send(`chosen god is: ${god.name}`, GodInfo);
}

module.exports = {
  "CommandArray":[
    {
      "name":"randomgod",
      "description":"none yet",
      // "MemberOnly": true,
      "run": async function run(client, msg, args, command){

        var god;

        // god.prototype.methodName = function () {
        //   if (!this.attack) {
        //     if (["mage", "hunter"].includes(this.role)) {
        //       this.attack= "ranged";
        //     } else if (["assassin", "warrior", "guardian"].includes(this.role)) {
        //       this.attack= "melee";
        //     }
        //   }
        // };
        switch (args[0]) {
          // case 'clean':
          //   if (!client.isUserAdmin(msg.author)) {
          //     msg.reply(`nice try ${msg.author.name}`);
          //     return;
          //   }
          //   adapter = new FileSync('./dbs/gods.json');
          //   db = low(adapter);
          //
          //   gods = db.get('gods').value();
          //   // categories = db.get('categories').value();
          //
          //   gods.forEach(async g =>{
          //     delete g.type;
          //   });
          //
          //
          //   db.set('gods', gods).write(); //writing in changes back to file
          //   break;
          case 'sort':
            try {
              adapter = new FileSync('./dbs/gods.json');
              db = low(adapter);

              gods = db.get('gods').value();
              categories = db.get('categories').value();
              // categories.sort();
              Object.keys(categories).forEach(async e => {
                categories[e].sort();
              });
              gods.sort(function(a,b){
                if ( a.name < b.name ){
                  return -1;
                } else if ( a.name > b.name ){
                  return 1;
                } else return 0;
              });

              db.set('gods', gods).write();
              db.set('categories', categories).write();

              //now checking if all properties have proper values
              await gods.forEach(async g =>{
                Object.keys(g).forEach( p => {
                  if (p == "name") return;
                  if (!categories[p].includes(g[p])) {
                    console.log(`${g.name} has invalid property ${p}: ${g[p]}`);
                  }
                });
              });

            } catch (e) {
              console.log(e);
            } finally {
              console.log(`success,\n sorted all ${gods.length}`);
            }
            return;
            break;
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
            msg.channel.send();
          case 'list':
            // msg.channel.send(`in the future, this will send info about arguments and stuff`);
            var list=[];
            await gods.forEach( god => {
              list.push({
                "name":god.name || "none",
                "value":`${god.role + " ".repeat(10-god.role.length)} -  ${god.pantheon}`,
                "inline":true
              });
            });
            msg.channel.send(`List of all ${gods.length} gods`);

            var part = 1;
            while (list.length != 0 && list) {
              msg.channel.send({
                "embed":{
                  "title":`Part ${part}`,
                  "fields": list.splice(0, 24)
                }
              });
              part++;
            }
            return;
            // break;

            case 'info':
              if (args[1]) {
                god = gods.find(g => g.name.match(args[1]));
                if (god) {
                  SendGodInfo(msg, god, true);
                } else {
                  msg.reply(`I couldn't find a god with the name: ${args[1]}`);
                }
              } else {
                msg.reply(`Please specify which god to give info about`);
              }
              break;
          case 'all':
          case 'any':
          case undefined:

            god = gods[ Math.floor(Math.random() * gods.length) ];
            SendGodInfo(msg, god, true);
            return;
          default:


          //swap to categories.forEach( =>{}) instead in the future

          // console.log('1');



          // console.log('2');

          if (args.length != 1 ) {
            console.log('random any god');
            god = gods[ Math.floor(Math.random() * gods.length) ];

          } else {

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
            for (var i = 0; i < 1000; i++){ // to have a chance to recover if all checks fail, only try 1.000 times
              god = gods[ Math.floor(Math.random() * gods.length) ]; //chose random god
              FullGod(god);//expands to full detail

              // console.log(god.name + " - " + god[criteria] + "===" + args[0] );
              // console.log( (god[criteria] === args[0].toLowerCase()) + " " + typeof god[criteria] + "===" + typeof args[0]);

              if (god[criteria].toLowerCase() === args[0].toLowerCase()) { //check if conforms to property value
                break; //exit if found
              }
            }
          }

          SendGodInfo(msg, god);
          // msg.channel.send(`chosen god is: ${await JSON.toString(god)}`);
        }
      }
    }
  ]

};
