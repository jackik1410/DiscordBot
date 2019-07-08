const winston = require(`../logger.js`).winston;

const ytdl = require('ytdl-core');

const {google} = require('googleapis');
const ytapi = google.youtube({
  version: 'v3',
  auth: require('../auth.json').ytapi_auth,
  // auth: 'AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM'
});


// Gapi.setApiKey('AIzaSyCCbbERdJGtOGk_j4xuESfESAEvcf2d7EM');

//  //i MAY revet to using a promise, might be handlier in some cases...
// async function getplaylistmsg(msg){
//   if (msg.guild.playlistmsg) {
//     return await msg.guild.playlistmsg.then(m => {
//         return m;
//     });
//   }
//   return undefined;
// }

//control emojis
// var client = require('../client.js');


//used to control the dispatcher via emotes appended to the queue message
var ctremoji = {
  '⏯': async function (client, msg){
    if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && msg.guild.voiceChannel == msg.author.voiceChannel) {
      if (msg.guild.voiceConnection.dispatcher.paused) {
        msg.guild.voiceConnection.dispatcher.resume();
      } else {
        msg.guild.voiceConnection.dispatcher.pause();
      }
    }
  },
  // '🔂':'';
  // '⏸': function (client, msg) {client.commands.get('pause').run(client, msg, []);},
  // '▶':  function (client, msg) {client.commands.get('unpause').run(client, msg, []);},
  '⏭': async function (client, msg) {client.commands.get('skip').run(client, msg, []);},
  '🔁': async function (client, msg) {client.commands.get('loop').run(client, msg, []);},
  '🔉': async function (client, msg) {client.commands.get('volume').run(client, msg, ['down']);},
  '🔊': async function (client, msg) {client.commands.get('volume').run(client, msg, ['up']);},
  '⏹': async function (client, msg) {client.commands.get('stop').run(client, msg, []);},
};


function showPlaylist(client, msg, args, forceNewMessage){ //shows and updates

  // var playlistmsg = getplaylistmsg(msg);
  var playlistmsg = msg.guild.playlistmsg || undefined;
  if (msg.guild.playlistmsg) {
    // msg.guild.playlistmsg.then(m => {
    //     playlistmsg = m;
    // });
    //  // playlistmsg = msg.guild.playlistmsg;

  }
  if (!msg.guild.currentlyPlaying) {
    playlistmsg.delete();
    return; //exits if nothing left todo
  }

  var now = new Date();
  var message = {
    "embed": {
      "title":`**${msg.guild.dispatcher && msg.guild.dispatcher.paused?(`⏸Now Pausing`):((msg.guild.loop)? `🔁Now Looping`:`▶Now Playing`)}:**`,
      // 'video':{'url': msg.guild.currentlyPlaying.url},
      'thumbnail':{"url":msg.guild.currentlyPlaying.thumbnail||'https://cdn.discordapp.com/embed/avatars/2.png'},
      "color": 2728740,
      'timestamp': now.toJSON(),
      "author":{'name': msg.guild.me.nickname},
      "description":`[${msg.guild.currentlyPlaying.name}](${msg.guild.currentlyPlaying.url})`,
    }
  };
  if (msg.guild.voiceConnection.dispatcher.paused) message.title += '__(paused)__';

  // var message = `**Now playing:** ${msg.guild.currentlyPlaying.name}`;
  if (msg.guild.playqueue && msg.guild.playqueue.length >0) {
    var queuelist = '';
    for (var i = 0; i < msg.guild.playqueue.length; i++) {
      // var song = msg.guild.playqueue[i];
      queuelist += `\n ${i+1} - [${msg.guild.playqueue[i].name}](${msg.guild.playqueue[i].url})`;
    }
    message.embed.description += "\n QUEUED:" + queuelist;
  }

  //delete message if nothing is being played, or setting is on for guild
  // var alwaysNewMessage = true;//Will be moved to guild settings... maybe... probably not...
  // if ((playlistmsg && !playlistmsg.deleted && alwaysNewMessage) || (!msg.guild.currentlyPlaying && playlistmsg && !playlistmsg.deleted)) {
  //   playlistmsg.delete();
  // }

  if (playlistmsg && !msg.guild.playlistmsg.deleted && playlistmsg.editable && (forceNewMessage != true)) {
    playlistmsg.edit(message); //only edit if was already sent and not deleted
  } else {

    msg.channel.send(message).then(async (m) => {
      msg.guild.playlistmsg = m;//updating the saved message

      //TODO add reaction emojis so that pausing, unpausing and skipping cost only a single click
      Object.keys(ctremoji).forEach(async (emote) => {
        await m.react(emote);
      });

      // new Discord.ReactionCollector(messagefilteroptions);
      const filter = (reaction, user) => Object.keys(ctremoji).includes(reaction.emoji.name);
      m.createReactionCollector(filter).on('collect', async r => {
        if (!r.me || r.count <= 1) return;
        // console.log(r);

        var user = r.users.find(u => !u.bot);
        r.remove(user);
        if (msg.guild.voiceChannel != user.voiceChannel) {
          msg.channel.send('Not in voiceChannel, not responding to command');
          return;
        }
        msg.author = user;
        ctremoji[r.emoji.name](client, msg);
        showPlaylist(client, msg, [], false);
      });


      // m.awaitReactions(obj => {
      //   // console.log(obj.message);
      //   obj.message.reactions.find(reaction => {
      //     console.log(reaction);
      //     //  //find first emote not from bot, act on it, delete afterwards
      //     //  // if (!reaction.me) return true; //doesn'T work like that
      //     if (reaction.count >1) return true;
      //   });
      // }).then(reactions => {
      //   reactions.forEach(async (r) => {
      //     console.log('found a reactable emote');
      //     if (r.me && r.count >1 && Object.keys(ctremoji).includes(r.emojis.toString())) {
      //       r.remove(r.users);
      //       ctremoji.get(r.emoji.toString()).run(client, msg);
      //     }
      //   });
      // });

    });
  }

}


function resumePause(msg){
  if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher) {
    if (msg.guild.dispatcher.paused) {
      msg.guild.dispatcher.resume();
    } else {
      msg.guild.dispatcher.pause();
    }
    // showPlaylist(client, msg, [], false);
  }
}

module.exports = {
  "CommandArray":[
    { //play (videos or sound only media)
      "name": "play",
      "description": "Provided with either keywords or url, plays audio stream over voiceChannel",
      "run": async function run(client, msg, args){
        if (!msg.guild.playqueue) {
          msg.guild.playqueue = [];
        }
        if ( !msg.member.voiceChannel || !msg.guild.voiceConnection || msg.member.voiceChannel.id != msg.guild.voiceConnection.channel.id) {
          msg.reply('you can only do that if you are in the same voiceChannel as the bot');
          return;
        }
        if (!args[0]) {
          msg.reply('And I should be playing **what** exactly?');
          return;
        }

        // Play streams using ytdl-core

        var streamOptions = { seek: 0, volume: 0.25 };
        if (!msg.guild.streamOptions) {
          streamOptions = { seek: 0, volume: 0.25 };
          msg.guild.streamOptions = streamOptions;
        } else {
          streamOptions = msg.guild.streamOptions;
        }
        var stream, queueobj; //not populated here, only defined for higher scope
        try {
          stream = ytdl(args[0], { filter : 'audioonly' });
          queueobj = {'name': args[0], 'url': args[0], 'id': 'none, working on it', 'stream':stream};
          if (!args[0].startsWith('https://')) {
            queueobj.url = 'https://'+args[0];
          }
        } catch (err) {
          // console.log(typeof err);
          // console.log(err.message);
          if (err.message.match('No video id found')) { //anticipated, now searching youtube with keywords
            var results = await ytapi.search.list({'part': 'id, snippet', "type": "video", 'q': args.join(' ').toString(), 'maxResults': 1});
            // var chosenresult = results.items.find(item => {
            //   if (item.id.kind == "youtube#video") return true;
            // });
            var chosenresult = results.data.items.shift();
            stream = await ytdl(chosenresult.id.videoId, {filter : 'audioonly'});
            // console.log(results.items);
            // console.log(chosenresult);
            queueobj = {'name': chosenresult.snippet.title, 'url':'https://www.youtube.com/watch?v='+chosenresult.id.videoId, 'id': chosenresult.id.videoId, 'stream':stream, 'thumbnail': chosenresult.snippet.thumbnails.default.url};
          } else {
            winston.error(err);
            msg.channel.reply("there was an error and it seems I can't play that, please try again");
          }
        }

        //checking queue, creating it if necessary
        if (msg.guild.voiceConnection.dispatcher) {//queuing
          // var queueobj = {'url':url, 'stream':stream};
          msg.guild.playqueue.push(queueobj);//adding to queue

          showPlaylist(client, msg, true);
        } else { //directly playing
          msg.guild.voiceConnection.playStream(stream, msg.guild.streamOptions);
          msg.guild.currentlyPlaying = queueobj;
          showPlaylist(client, msg, true);
        }

        //stop dispatcher if queue empty, else start next song/video
        // msg.guild.voiceConnection.dispatcher.stream.on('end', (reason) => {
        //   // msg.guild.voiceConnection.dispatcher.end();
        // });

        // msg.guild.voiceConnection.dispatcher.on('speaking', () => {
        //     showPlaylist(client, msg, [], false);
        //   }
        // );
        msg.guild.voiceConnection.dispatcher.on('end', (reason) => {
          // console.log(reason);
          if (msg.guild.loop == true) {
            msg.guild.playqueue.push(msg.guild.currentlyPlaying);
            msg.guild.currentlyPlaying = msg.guild.playqueue.shift();

            msg.guild.voiceConnection.playStream(msg.guild.currentlyPlaying.stream, msg.guild.streamOptions);
            showPlaylist(client, msg, [], false);
            return;
          }

          if (msg.guild.playqueue && msg.guild.playqueue.length >0) {//playing from queue
            msg.guild.currentlyPlaying = msg.guild.playqueue.shift(); //moves object to play from queue
            msg.guild.voiceConnection.playStream(msg.guild.currentlyPlaying.stream, msg.guild.streamOptions);
          } else {
            // msg.guild.voiceConnection.dispatcher.end(); //should have just happened anyway...
            delete msg.guild.currentlyPlaying;
            return;
          }
          showPlaylist(client, msg, [], false);
          //no queue, nothing else
        });


          //ADDITIONAL INFO HANDLING, only shows, doesn't do anything else
        msg.guild.voiceConnection.dispatcher.on('error', winston.error);
        msg.guild.voiceConnection.dispatcher.on('debug', async (info)  => {
          winston.debug("dispatcher " + info);
          // showPlaylist(client, msg); //to update when pausing/unpausing playback
        });

        msg.guild.voiceConnection.dispatcher.stream.on('error', winston.error);
        msg.guild.voiceConnection.dispatcher.stream.on('debug', async (info)  => {
          winston.debug("stream " + info);
        });

        msg.guild.voiceConnection.dispatcher.player.on('error', winston.error);
        msg.guild.voiceConnection.dispatcher.player.on('debug', async (info)  => {
          winston.debug("player " + info);
        });

      }
    },
    { //skip
      "name":"skip",
      "description":"skips the currently playing song",
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher) {
          if (args[0] && typeof args[0] == 'number' && args[0] >0) {
            console.log('entered if');
            var i = args[0] - 1;
            if (msg.guild.playqueue && msg.guild.playqueue[i]) {
              msg.guild.playqueue.splice(i, 1);
              showPlaylist(client, msg, args, false);
            } else {
              msg.channel.send(`Couldn't find element ${i+1} in the queue`);
            }
            return;
          }
          msg.guild.voiceConnection.dispatcher.emit('end');
          // showPlaylist(client, msg);//is run when 'end' is emited anyway
        }
      }
    },
    {
      "name":"loop",
      "description":"Toggles looping the queue",
      "run": async function run(client, msg, args){
        msg.guild.loop = (msg.guild.loop)?!msg.guild.loop:true;
        // showPlaylist(client, msg, [], false);
      }
    },
    // {
    //   "name":"yttest",
    //   "description":"",
    //   "adminOnly": true,
    //   "run": async function run(client, msg, args, command){
    //     eval(msg.content.slice(client.prefix.length + command.length + 1));
    //   }
    // },
    // {
    //   "name":"yttest",
    //   "description":"",
    //   "adminOnly": true,
    //   "run": async function run(client, msg, args, command){
    //     eval(msg.content.slice(client.prefix.length + command.length + 1));
    //   }
    // },
    // {
    //   "name":"ytsearch",
    //   "description":"",
    //   "adminOnly":true,
    //   "run": async function run(client, msg, args, command) {
    //     try {
    //       console.log(ytapi.search.list({'part': 'id, snippet', "type": "video", 'q': "boulevard of broken dreams", 'maxResults': 1}));
    //       // console.log(r);
    //       // var result = r;
    //     } catch (e) {
    //       winston.error(e);
    //     } finally {
    //
    //     }
    //     // var chosenresult = results.data.items.shift();
    //     // var stream = await ytdl(chosenresult.id.videoId, {filter : 'audioonly'});
    //     // console.log(results);
    //
    //   }
    // }
  ]
}
