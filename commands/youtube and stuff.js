const winston = require(`../logger.js`).winston;

const ytdl = require('ytdl-core');

const {google} = require('googleapis');
const ytapi = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM'
});
// Gapi.setApiKey('AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM');

module.exports = {
  "CommandArray":[
    { //play (videos or sound only media)
      "name": "play", // might need to change the name
      "description": "Provided with either keywords or url, plays audio stream over voiceChannel",
      "run": async function run(client, msg, args){
        if (msg.member.voiceChannel.id != msg.guild.voiceConnection.channel.id) {
          msg.reply('you can only do that if you are in the same voiceChannel as the bot');
          return;
        }
        //Also need to check if already plaing something!!!
        //TODO: queueing


        // Play streams using ytdl-core
        const streamOptions = { seek: 0, volume: 0.5 };
        var stream = '';
        try {
          const stream = ytdl(args[0], { filter : 'audioonly' });
        } catch (err) {
          if (err.includes('No video id found')) {
            //ignore error
            let results = await ytapi.search.list({'part': 'id', "type": "video", 'q': args.join(' ').toString(), 'maxResults': 25});
            // let chosenresult = results.items.find(item => {
            //   if (item.id.kind == "youtube#video") return true;
            // });
            let chosenresult = results.data.items.shift();
            stream = await ytdl(chosenresult.id.videoId, {filter : 'audioonly'});
            // console.log(results.items);
            // console.log(chosenresult);
          } else {
            winston.error(err);
          }
        }
        const dispatcher = msg.guild.voiceConnection.playStream(stream, streamOptions);
        stream.on('end', () => {
          dispatcher.end();
        });
      }
    },
    {
      "name":"ytsearch",
      "description":"",
      "adminOnly":true,
      "run": async function run(client, msg, args, command) {
        var results = await ytapi.search.list({'part': 'id,snippet', 'q': args.join(' ').toString(), 'maxResults': 2});
        // for(var i in results.items) {
        //   var item = results.items[i];
        //   console.log('[%s] Title: %s' + item.id.videoId + item.snippet.title);
        // }
        console.log(results.data.items);

      }
    }
  ]
}
