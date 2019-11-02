const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var adapter = new FileSync('./dbs/gods.json');
var db = low(adapter);

var chars = db.get('smite.chars').value();
var categories = db.get('smite.categories').value();
var chosengame = db.get('smite').value();



//prepare smite god infos
let cred = require("../auth.json").hirez;
const Hirez = require('hirez.js')
let hirez = new Hirez({
  devId: cred[0],
  authKey: cred[1]
});

hirez.smite('pc').session.generate().then( res=>{
  hirez.smite('pc').getGods().then(gods=>{
    db.set("smite.chars", gods).write();
  });
});


function FullGod(godObject){
  return;
  try {
    if (!godObject.attack) {
      godObject.type = new Promise((resolve, reject) => {
        if (["mage", "hunter"].includes(godObject.role)) {
          resolve("ranged");
        } else if (["assassin", "warrior", "guardian"].includes(godObject.role)) {
          resolve("melee");
        } else reject();
      }).then().catch(e => console.log(e));
    }
    if (!godObject.type) {
      godObject.type = new Promise((resolve, reject) => {
          if (["mage", "guardian"].includes(godObject.role)) {
            resolve("magical");
          } else if (["assassin", "warrior", "hunter"].includes(godObject.role)) {
            resolve("physical");
          } else reject();
        }).then().catch(e => console.log(e));
    }

  } catch (e) {
    // console.log(e);
    winston.info(e);
  }
  // return char;
}


async function SendGodInfo(msg, game, char, full){
    // console.log(char);
    // FullGod(char);
    // console.log(char);
  let charInfo;
  // var charInfo = {
  //   "embed":{
  //     "title":char.Name,
  //     "description": ""
  //   }
  // };
  var description;
  if (full && game.info.charfullinfo) {
    charInfo = await (Function('char', game.info.charfullinfo))(char);
  } else if (game.info.charinfo) {
    charInfo = await (Function('char', game.info.charinfo))(char);
  } else {
    for (var property in char) {
      if (char.hasOwnProperty(property)) {
        if (property == "Name") return;
        charInfo += " " + char[property];
      }
    }
  }
  // charInfo.embed.description = description || description(char);

  // console.log(charInfo);

  msg.channel.send(`chosen god is: ${char.Name}`, {embed:charInfo});
}

module.exports = {
  "CommandArray":[
    {
      "name":"randomgod",
      "aliases":["rgod","random", "rg"],
      // "repeatable": true,
      "description": `usage: randomgod list, randomgod any, randomgod info Aprhodite, randomgod hunter/mage/melee/greek/roman`,
      // "MemberOnly": true,
      "run": async function run(client, msg, args, command){

        switch (args[0]) {
          case 'sort':
            try {
              adapter = new FileSync('./dbs/gods.json');
              db = low(adapter);

              Object.keys(db.get('').__wrapped__).forEach(async game =>{
                chars = db.get(`${game}.chars`).value();
                categories = db.get(`${game}.categories`).value();
                // categories.sort();
                Object.keys(categories).forEach(async e => {
                  categories[e].sort();
                });
                chars.sort(function(a,b){
                  if ( a.name < b.name ){
                    return -1;
                  } else if ( a.name > b.name ){
                    return 1;
                  } else return 0;
                });
                console.log(`${game}: success,\n sorted all ${chars.length} ${db.get(`${game}.info.charname`).value() || characters}`);

                db.set(`${game}.chars`, chars).write();
                db.set(`${game}.categories`, categories).write();

                //now checking if all properties have proper values
                await chars.forEach(async c =>{ //for each char
                  if (!c.type) {
                    if (["hunter","assassin","warrior"].includes(c.role)) {
                      c.type = "physical";
                    } else if (["mage","guardian"].includes(c.role)) {
                      c.type = "magical";
                    }
                  }
                  if (!c.attack) {
                    if (["hunter","mage"].includes(c.role)) {
                      c.attack = "ranged";
                    } else if (["assassin","guardian","warrior"].includes(c.role)) {
                      c.attack = "melee";
                    }
                  }


                  Object.keys(c).forEach( p => {
                    if (p == "name") return;
                    if (!categories[p].includes(c[p])) {
                      console.log(`${c.name} has invalid property ${p}: ${c[p]}`);
                    }
                  });
                });

                db.set(`${game}.chars`, chars).write();


              });

            } catch (e) {
              console.log(e);
            } finally {

            }
            return;
            // break;
          case 'test':
            console.log(
              await Object.keys(categories).forEach(cat => {
                if (categories[cat].includes(args[1])) {
                  console.log(cat);
                  console.log(categories[cat]);
                  return cat;
                }
              })
            );
            return;
            // console.log("break");
          case 'help':
            msg.channel.send(this.description);
            return;
          case 'list':
            // msg.channel.send(`in the future, this will send info about arguments and stuff`);
            var list=[];
            await chars.forEach( char => {
              list.push({
                "name":char.Name || "none",
                "value": Function('char', chosengame.info.charinfo)(char),
                "inline": true
              });
            });
            msg.channel.send(`List of all ${chars.length} ${chosengame.info.charname||characters} - shown in ${Math.ceil(chars.length/24)} Parts`);

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
              char = chars.find(g => g.Name.toLowerCase().includes(args[1].toLowerCase()));
              if (char) {
                SendGodInfo(msg, chosengame, char, true);
              } else {
                msg.reply(`I couldn't find a char with the name: ${args[1]}`);
              }
            } else {
              msg.reply(`Please specify which char to give info about`);
            }
            return;
            // break;
          case 'all':
          case 'any':
          case undefined:
            char = chars[ Math.floor(Math.random() * chars.length) ];
            SendGodInfo(msg, chosengame, char, true);
            return;
          default:

          if (args.length != 1 ) {
            // console.log('random any char');
            char = chars[ Math.floor(Math.random() * chars.length) ];

          } else {

            var criteria = null;
            await Object.keys(categories).forEach(cat => {
              if (categories[cat].includes(args[0].toLowerCase())) {
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
              char = chars[ Math.floor(Math.random() * chars.length) ]; //chose random char
              FullGod(char);//expands to full detail
              // console.log(char[criteria].toLowerCase() + " == " + args[0].toLowerCase());
              // console.log(char[criteria].toLowerCase().includes(args[0].toLowerCase()));
              if (char[criteria].toLowerCase().includes(args[0].toLowerCase())) { //check if conforms to property value
                break; //exit if found
              }
            }
          }

          SendGodInfo(msg, chosengame, char, true);
          // msg.channel.send(`chosen char is: ${await JSON.toString(char)}`);
        }
      }
    }
  ]

};
