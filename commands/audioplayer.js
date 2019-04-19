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
      "description":"",
      "run": async function run(client, msg, args, command){
        let VC = await msg.member.voiceChannel;
        if (VC == undefined) {
          msg.reply(`You are not in a voiceChannel`);
          return;
        }
        if (msg.guild.voiceConnection != null && msg.guild.voiceConnection.channel != VC) {
          msg.reply(`I know, i know, don't rush me, i'm already there!`);
          return;
        }
        await VC.join().then(connection => {
          //no code here needed anymore
        }).catch(err => winston.error(err));

      }
    },
    { //leave
      "name":"leave",
      "description":"",
      "run": async function run(client, msg, args) {
        if (msg.guild.voiceConnection) { //doesn't need checks, just doesn't do anything if not intended
          console.log('disconnecting from voiceChannel');
          msg.guild.voiceConnection.disconnect();
        }
      }
    },
    {
      "name":"pause",
      "description":"",
      "run": async function run(client, msg, args){
        if (false && msg.guild.voiceConnection) {

        }
        // await msg.guild.voiceConnection.dispatcher.stream.pause();
        msg.guild.voiceConnection.dispatcher.pause();
      }
    },
    {
      "name":"unpause",
      "aliases":['resume'],
      "description":"",
      "run": async function run(client, msg, args){
        if (false && msg.guild.voiceConnection) {

        }
        // await msg.guild.voiceConnection.dispatcher.stream.resume();
        msg.guild.voiceConnection.dispatcher.resume();
      }
    },
    { //sound OLD much TODO here
      "name":"sound",
      "description": "still not entirely implemented",
      "MemberOnly": true,
      "run": async function run(client, msg, args, command) {
        switch (args[0]) {//args[0]
          case 'test':
            msg.channel.send(await fs.readdir('./Sounds/'));
            return;
          case 'play':
            //not yet intended to work
            return;
          default:

        }
        let path = `./Sounds/${args[0]}.wav`;
        if (!fs.existsSync(path)) {
          path = `./Sounds/${args[0]}.mp3`;
          if (!fs.existsSync(path)) {
            msg.reply(`couldn't find Sound`);
            return;
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
            setTimeout(function (msg){VC.leave(); IsReady = 1;}, 1500, msg);
          });
        }).catch(err => winston.error(err));
        break;


      }
    },
    { //echoing
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
    { //voice recog via google API TODO
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
          const fileName = './resources/audio.raw';

          // Reads a local audio file and converts it to base64
          const file = fs.readFileSync(fileName);
          const audioBytes = file.toString('base64');

          // The audio file's encoding, sample rate in hertz, and BCP-47 language code
          const audio = {
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
