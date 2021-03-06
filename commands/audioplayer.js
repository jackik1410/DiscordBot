const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');
const fs = require('fs');
// const timers = require('timers');
const winston = require(`../logger.js`).winston;
// const client = require(`../bot.js`).client;

var IsReady = 1;
var soundformats = ['.wav','.mp3', '.ogg'];

var client = require(`../bot.js`);
client.connections = [];

function inChannel(client, msg){
  if (msg.member.voiceChannel == undefined) {
    msg.reply(`You are not in a voiceChannel`);
    return true;
  }
  return false;
}

module.exports = {
  "events": [
    {
      "name": "abfuck",
      "description": "randomly annoying the fuck out of someone",
      "active": false,
      "looptime": 5000,
      "run": async function run(client){
        if (true) {
          client.guilds.get('525972362617683979').then(guild => guild.members.find(member => {member.roles.some(r => ['Mitbewohner'].includes(r));}))
        }
          // client.guilds[]
          console.log('was called');
      }
    }
  ],
  "CommandArray": [
    { //join
      "name":"join",
      "description": "have the bot join the voiceChannel",
      "guildOnly": true,
      "run": async function run(client, msg, args, command){
        let VC = await msg.member.voiceChannel;
        if (VC == undefined) {
          msg.reply(`You are not in a voiceChannel`);
          return;
        }
        if (msg.guild.voiceConnection != null && msg.guild.voiceConnection.channel == VC) {
          msg.reply(`I know, i know, don't rush me, i'm already there!`);
          return;
        }
        await VC.join().then(connection => {
          //no code here needed anymore
        }).catch(err => winston.error(err));

      }
    },
    {//leave
      "name":"leave",
      "description":"have the bot leave the voiceChannel",
      "guildOnly": true,
      "run": async function run(client, msg, args) {
        if (msg.guild.voiceConnection) { //doesn't need checks, just doesn't do anything if not intended
            if (msg.member.voiceChannel || OPs.admins.includes(msg.author.id)) {
              msg.guild.voiceConnection.disconnect();
            }
              // console.log('disconnecting from voiceChannel');
        }
      }
    },
    {//pause
      "name":"pause",
      "description":"pauses playback, undo with 'unpause'",
      "guildOnly": true,
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.paused) {
          msg.guild.voiceConnection.dispatcher.pause();
        } else {
          msg.reply('there is nothing to pause for me');
        }
      }
    },
    {//unpause, resume
      "name":"unpause",
      "aliases":['resume'],
      "description":"resumes playback",
      "guildOnly": true,
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher && msg.guild.voiceConnection.dispatcher.paused) {
          msg.guild.voiceConnection.dispatcher.resume();
        } else {
          msg.reply('there is nothing to resume for me');
        }
      }
    },
    {//stop
      "name":"stop",
      "description":"Completely stops playback",
      "guildOnly": true,
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher) {
          msg.guild.voiceConnection.dispatcher.end();
        } else {
          msg.channel.send('There is nothing to stop for me here...');
        }
      }
    },
    {//volume
      "name":"volume",
      "description":"Sets the volume",
      "guildOnly": true,
      "run": async function run(client, msg, args){
        var upperlimit = 10;
        var lowerlimit = 0;
        //msg.guild.settings.volume = ...;
        if (msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher) {
          if (args[0]) {
            switch (args[0]) {
              case 'up':
                msg.guild.voiceConnection.dispatcher._volume *= 4/3;
                return;
              case 'down':
                msg.guild.voiceConnection.dispatcher._volume *= 3/4;
                return;
              default:
                //nothing
            }
            if (args[0] && 0 <= args[0] && args[0] <= 10 ) {
              msg.guild.voiceConnection.dispatcher._volume= args[0];
            } else  {
              msg.reply(`Argument needs to be valid, accepts values between ${lowerlimit}-${upperlimit}`);
            }
          } else {
            msg.channel.send(`Current volume: ${msg.guild.voiceConnection.dispatcher._volume}`);
          }
        } else {
          msg.reply("i couldn't do that");
        }
      }
    },
    {//sound OLD much TODO here
      "name":"sound",
      "description": "still not entirely implemented",
      "adminOnly": true,
      "guildOnly": true,
      "run": async function run(client, msg, args, command) {
        switch (args[0]) {//args[0]
          case 'test':
            await fs.readdir('./Sounds/', (err, files)=> {msg.channel.send(files);});
            return;

          case 'list':
            try {
              var originalDir = "./Sounds/";
              var soundsList= "";
              function searchDir(dir){
                fs.readdir(dir, {"withFileTypes":true}, (err, files) => {
                  console.log(files);
                  console.log(typeof files);
                  Object.keys(files).forEach(o => {
                    if (files[o].isDirectory()) {
                      searchDir(dir+files[o]);
                    } else if (files[o].isFile()) {
                      soundsList += dir.slice(originalDir.length) + o;
                    } else {
                      winston.error(`${o} is neither file nor directory!`);
                    }
                  });
                  // let f = files.filter(f => f.split(".").pop() === "mp3"|| "wav");
                });
              }
              await searchDir(originalDir);
              msg.channel.send({"embed":{
                "title":"Sounds",
                "description":soundsList,
              }});
            } catch (e) {
              winston.error(e);
            }

            break;

          case 'play':
            //not yet intended to work
            // return; //fallthrough
          default:
            let path = `./Sounds/${args[0]}.wav`;
            if (!fs.existsSync(path)) {
              path = `./Sounds/${args[0]}.mp3`;
              if (!fs.existsSync(path)) {
                path = `./Sounds/${args[0]}.ogg`;
                if (!fs.existsSync(path)) {
                    msg.reply(`couldn't find Sound`);
                    return;
                }
              }
            }


            let VC = await msg.member.voiceChannel;
            if (VC == undefined) {
              msg.reply(`You are not in a voiceChannel`);
              return;
            }
            await VC.join().then(connection => {
              let dispatcher = connection.playFile(path);
              dispatcher.on("end", end => {
                // setTimeout(function (msg){VC.leave(); IsReady = 1;}, 1500, msg);
              });
            }).catch(err => winston.error(err));
            // break;
        }


      }
    },
    {//echoing
      "name":"echoing",
      "description":"i wouldn't recommend trying this...",
      "adminOnly":true,
      "run": async function run(client, msg, args){
        var VoiceCon = await msg.guild.voiceConnection;
        var receiver = await VoiceCon.createReceiver();
        console.log(receiver);
        receiver.on('warn', (err)=> winston.error('voice receiver ' + err));
        VoiceCon.on('warn', (err)=> winston.error('voiceconnection ' + err));
        VoiceCon.on('speaking', (speaker, bool) => {
          console.log(`speaking: ${speaker.username} = ${bool}`);
          if (receiver.destroyed) {winston.debug(`receiver was destroyed`); return;}
          if (!bool)  return; // don't execute if stopped speaking
          var readableStream = receiver.createPCMStream(speaker);
          readableStream.on('data', (chunk)=>console.log(`received ${chunk.length} bytes`));
          VoiceCon.playStream(readableStream);
        });
      }
    },
    {
      "name":"mic",
      "description":"",
      "adminOnly":true,
      "run": async function run(client, msg, args){
        if (msg.guild.voiceConnection) {
          msg.guild.voiceConnection.on('speaking', (user, bool) => {
            console.log(`${user.username} is speaking: ${bool}`);
            if (bool) {
              var receiver = msg.guild.voiceConnection.createReceiver();
              receiver.on('warn', console.log());
              var stream = receiver.createOpusStream(user);
              stream.on('error', console.log());
              msg.guild.voiceConnection.playOpusStream(stream);
            }
          })
        }
      }
    },
    {//voice recog via google API TODO
      // "name":"recog",
      "aliases":[''],
      "description":"none yet",
      "adminOnly": true,
      "run": async function run(client, msg, args, command){
          // Imports the Google Cloud client library
          const speech = require('@google-cloud/speech');
          const fs = require('fs');

          // Creates a client
          const googleclient = new speech.SpeechClient();

          // The name of the audio file to transcribe
          var fileName = './resources/audio.raw';

          // Reads a local audio file and converts it to base64
          const file = fs.readFileSync(fileName);
          const audioBytes = file.toString('base64');

          // The audio file's encoding, sample rate in hertz, and BCP-47 language code
          var audio = {
            content: audioBytes,
          };
          const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          };
          const request = {
            audio: audio,
            config: config,
          };

          // Detects speech in the audio file
          const [response] = await googleclient.recognize(request);
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
          console.log(`Transcription: ${transcription}`);
      }
    }
  ]
};
