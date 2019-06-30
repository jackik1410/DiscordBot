//adding ranks for staying in a voice chat
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('./dbs/ranks.json');
const rankdb = low(adapter);


//tracking status

// client.on('voiceStateUpdate', member => {
//
//   winston.debug('Voice State Update for ' + member.user.username);
// });
//
//
// module.exports = {
//   "CommandArray":[
//     {
//       "name":"ranks",
//       "description":"",
//       "MemberOnly": true,
//       "run": async function run(client, msg, args, command){
//
//
//         var message = await {
//           "contetn":"",
//           "fields":[]
//         };
//
//         msg.channel.send(message);
//       }
//     }
//   ]
// }
