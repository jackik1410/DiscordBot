const winston = require(`../logger.js`).winston;

const ytdl = require('ytdl-core');

const {google} = require('googleapis');
const ytapi = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM'
});
// Gapi.setApiKey('AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM');


function showPlaylist(client, msg){ //shows and updates
  var playlistmsg = {};
  if (msg.guild.playlistmsg) {
    playlistmsg = msg.guild.playlistmsg.channel.fetchMessage(msg.guild.playlistmsg.id);

    if (!msg.guild.currentlyPlaying) {
      playlistmsg.delete();
      return;
    }
  }

  var message = {
    "embed": {
      "title":"**Now Playing:**",
      "color": 2728740,
      "description":`[${msg.guild.currentlyPlaying.name}](${msg.guild.currentlyPlaying.url})`
    }
  };
  if (msg.guild.voiceConnection.dispatcher.paused) message.embed.title += '__(paused)__';

  // var message = `**Now playing:** ${msg.guild.currentlyPlaying.name}`;
  if (msg.guild.playqueue) {
    var queuelist = '';
    for (var song in msg.guild.playqueue) {
      if (!msg.guild.playqueue.hasOwnProperty(song)) winston.debug(`has no property (look at showPlaylist() for debuging)`); // i don't know yet if that would ever be necessary TODO: remove this after testing
      queuelist += `\n - [${song.name}](${song.url})`;
      console.log()
    }
    message.embed.description += "\n QUEUED:" + queuelist;
  }

  if (playlistmsg && playlistmsg.editable) {
    playlistmsg.edit(message); //only edit if was already sent and not deleted
  } else {
    msg.guild.playlistmsg = msg.channel.send(message);
  }
}


module.exports = {
  "CommandArray":[
    { //skip
      "name":"skip",
      "description":"skips the currently playing song",
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher) {
          msg.guild.voiceConnection.dispatcher.emit('end');
          showPlaylist(client, msg);
        }
      }
    },
    { //play (videos or sound only media)
      "name": "play",
      "description": "Provided with either keywords or url, plays audio stream over voiceChannel",
      "run": async function run(client, msg, args){
        if ( !msg.member.voiceChannel || !msg.guild.voiceConnection || msg.member.voiceChannel.id != msg.guild.voiceConnection.channel.id) {
          msg.reply('you can only do that if you are in the same voiceChannel as the bot');
          return;
        }
        if (!args[0]) {
          msg.reply('And I should be playing **what** exactly?');
          return;
        }

        // Play streams using ytdl-core
        const streamOptions = { seek: 0, volume: 0.25 };
        var stream = '';
        var queueobj = {};//not populated here, only defined for higher scope
        try {
          stream = ytdl(args[0], { filter : 'audioonly' });
          queueobj = {'name': args[0], 'url': args[0], 'id': 'none, working on it', 'stream':stream};
        } catch (err) {
          // console.log(typeof err);
          // console.log(err.message);
          if (err.message.match('No video id found')) { //anticipated, now searching youtube with keywords
            let results = await ytapi.search.list({'part': 'id, snippet', "type": "video", 'q': args.join(' ').toString(), 'maxResults': 1});
            // let chosenresult = results.items.find(item => {
            //   if (item.id.kind == "youtube#video") return true;
            // });
            let chosenresult = results.data.items.shift();
            stream = await ytdl(chosenresult.id.videoId, {filter : 'audioonly'});
            // console.log(results.items);
            // console.log(chosenresult);
            queueobj = {'name': chosenresult.snippet.title, 'url':'www.youtube.com/watch?v='+chosenresult.id.videoId, 'id': chosenresult.id.videoId, 'stream':stream};
          } else {
            winston.error(err);
            msg.channel.reply("there was an error and it seems I can't play that, please try again");
          }
        }

        //checking queue, creating it if necessary
        if (msg.guild.voiceConnection.dispatcher) {//queuing
          // var queueobj = {'url':url, 'stream':stream};
          if (!msg.guild.playqueue) { //creating queue
            msg.guild.playqueue = [queueobj];
          } else { //adding to queue
            msg.guild.playqueue.push(queueobj);
          }
          showPlaylist(client, msg);
        } else { //directly playing
          msg.guild.voiceConnection.playStream(stream, streamOptions);
          msg.guild.currentlyPlaying = queueobj;
          showPlaylist(client, msg);
        }

        //stop dispatcher if queue empty, else start next song/video
        msg.guild.voiceConnection.dispatcher.on('end', () => {
          if (msg.guild.playqueue && msg.guild.playqueue.length >0) {//playing from queue
            msg.guild.currentlyPlaying = msg.guild.playqueue.shift(); //moves object to play from queue
            msg.guild.voiceConnection.playStream(msg.guild.currentlyPlaying.stream, streamOptions);
          } else {
            msg.guild.voiceConnection.dispatcher.end();
            delete msg.guild.currentlyPlaying;
          }
          showPlaylist(client, msg);

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
