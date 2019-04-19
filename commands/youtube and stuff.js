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
    {
      "name":"skip",
      "description":"",
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher) {
          msg.guild.voiceConnection.dispatcher.stream.emit('end');
        }
      }
    },
    { //play (videos or sound only media)
      "name": "play",
      "description": "Provided with either keywords or url, plays audio stream over voiceChannel",
      "run": async function run(client, msg, args){
        if (msg.member.voiceChannel.id != msg.guild.voiceConnection.channel.id) {
          msg.reply('you can only do that if you are in the same voiceChannel as the bot');
          return;
        }

        // Play streams using ytdl-core
        const streamOptions = { seek: 0, volume: 0.25 };
        var stream = '';
        try {
          const stream = ytdl(args[0], { filter : 'audioonly' });
        } catch (err) {
          // console.log(typeof err);
          // console.log(err.message);
          if (err.message.match('No video id found')) { //anticipated, now searching youtube with keywords
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

        //checking queue, creating if necessary
        if (msg.guild.voiceConnection.dispatcher) {//queuing
          // var url = 'www.youtube.com/watch?v='+chosenresult.id.videoId || args[0];
          var queueobj = {'url':'', 'stream':stream};
          if (!msg.guild.playqueue) { //creating queue
            msg.guild.playqueue = [queueobj];
          } else { //adding to queue
            msg.guild.playqueue.push(queueobj);
          }
        } else { //directly playing
          msg.guild.voiceConnection.playStream(stream, streamOptions);
        }

        //stop dispatcher if queue empty, else start next song/video
        msg.guild.voiceConnection.dispatcher.on('end', () => {
          if (msg.guild.playqueue.length >0) {//playing from queue
            var newsong = msg.guild.playqueue.shift(); msg.guild.voiceConnection.playStream(newsong.stream, streamOptions);
          }
          //no queue, nothing else
        });
      }
    },
    // {
    //   "name":"ytsearch",
    //   "description":"",
    //   "adminOnly":true,
    //   "run": async function run(client, msg, args, command) {
    //     var results = await ytapi.search.list({'part': 'id,snippet', 'q': args.join(' ').toString(), 'maxResults': 2});
    //     // for(var i in results.items) {
    //     //   var item = results.items[i];
    //     //   console.log('[%s] Title: %s' + item.id.videoId + item.snippet.title);
    //     // }
    //     console.log(results.data.items);
    //
    //   }
    // }
  ]
}
