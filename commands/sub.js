
var db = require('../logger.js').db;
var client = require('../client.js');


//intialize

async function ReadReactionsFromMessage(client){

  // var m = client.
  // m.createReactionCollector(filter).on('collect', async r => {
  //   if (!r.me || r.count <= 1) return;
  //   // console.log(r);
  //
  //   var user = r.users.find(u => !u.bot);
  //   r.remove(user);
  //   if (msg.guild.voiceChannel != user.voiceChannel) {
  //     msg.channel.send('Not in voiceChannel, not responding to command');
  //     return;
  //   }
  //   msg.author = user;
  //   ctremoji[r.emoji.name](client, msg);
  //   showPlaylist(client, msg, [], false);
  // });
}

// Starting the loop
ReadReactionsFromMessage(client);

/*
module.exports = {
  "CommandArray" : [
    {
      "name":"subtest",
      "adminOnly":true,
      "run": async function run(client, msg, args, command){

      }
    },
    {
      "name":"initsub",
      "description":"",
      "adminOnly":true,
      "run": async function run(client, msg, args, command, db){

      }
    },
  ],
};
*/
