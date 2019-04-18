

const ytdl = require('ytdl-core');
// var Gapi = require('googleapis');
// Gapi.setApiKey('AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM');

module.exports = {
  "CommandArray":[
    { //play (videos or sound only media)
      "name": "play", // might need to change the name
      "description": "",
      "run": async function run(client, msg, args){
        if (msg.member.voiceChannel.id != msg.guild.voiceConnection.channel.id) {
          msg.reply('you can only do that if you are in the same voiceChannel as the bot');
          return;
        }
        //Also need to check if already plaing something!!!
        //TODO: queueing



        // Play streams using ytdl-core
        const streamOptions = { seek: 0, volume: 1 };

        const stream = ytdl(args[0], { filter : 'audioonly' });
        const dispatcher = msg.guild.voiceConnection.playStream(stream, streamOptions);
      }
    },
    {
      // "name":"ytsearch",
      "description":"",
      "adminOnly":true,
      "run": async function run(client, msg, args, command) {
        function searchByKeyword() {
          var results = YouTube.Search.list('id,snippet', {q: 'william osman japan', maxResults: 2});
          for(var i in results.items) {
            var item = results.items[i];
            winston.debug('[%s] Title: %s', item.id.videoId, item.snippet.title);
          }
        }

      }
    }
  ]
}
