const Discord = require("discord.js");
const OPs = require('../dbs/OPs.json');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./dbs/tournamentdb.json');
const db = low(adapter);


var ShowTournament= function (client, msg){
  if (!db.has(`tournament.${msg.guild.id}`).value()) {//safety
    msg.channel.reply("There is either no running tournament or no Participants...");
    return;
  }
  let string=`${db.get(`tournament.${msg.guild.id}.name`).value()} \n      TEAMS:\n`;
  db.get(`tournament.${msg.guild.id}.teams`).value().forEach(team => {
    string += `Team ${team.name}:`;
    team.participants.forEach(participant => {
      string += ` <@!${participant}> `;
    });
    string += "\n";
  });
  msg.channel.send(string);
}

// collection#random to shuffle teams
// collection#sweep to remove elements that return true
module.exports = {
  "CommandArray": [
    { //main switch-case
      "name": "tournament",
      "aliases": ["tourn"],
      "MemberOnly": true,
      "description": "For tournaments, arguments: 'create ~name~, join, edit, switch @user, start, end'",
      "run": async function run(client, msg, args, command) {

        if (!db.has(`tournament.${msg.guild.id}`).value()) {
          if (args[0].toLowerCase()=="create") {
            console.log(db.set(`tournament.${msg.guild.id}.name`, msg.content.slice(3+command.length+args[0].length)).write());
            console.log(db.set(`tournament.${msg.guild.id}.teams`, [{id:1, name:"1", participants:[]},{id:2, name:"2", participants:[]}]).write());//maybe in the future editable
            // db.set(`tournament.${msg.guild.id}.Participants`, []).write();
            return;
          }
          msg.reply("first create a tournament for your server");
          return;
        }


        // let Participants = db.get(`tournament.${msg.guild.id}.Participants`).value();
        let Teams = db.get(`tournament.${msg.guild.id}.teams`).value();
        // Participants.forEach(participant => {
        //   Teams[participant.team] = 0;
        // });

        switch (args[0]) {
          case 'create'://shouldn't come to this, actual process is before
              msg.reply(`Your server already has a running tournament, please first end your tournament '${db.get(`tournament.${msg.guild.id}.name`).value()}'`);
            break;
          case 'show':
            ShowTournament(client, msg);
            break;
          case 'edit':
            msg.reply("not yet implemented");
            break;
          case 'start'://starts tournament, moves players
            //check teams
            //move teams to group channels

            break;
          case 'move'://works

            let channel;
            Teams.forEach(async (team) => {
              console.log(`Team ${team.id}`);
              console.log(team);
              team.participants.forEach(participant => {
                // let member = msg.guild.fetchMember(participant);
                // console.log(member);
                msg.guild.fetchMember(participant).then(async (member) => {
                // console.log(member.user.username);
                  if (!member.voiceChannel) {
                    msg.channel.send(`<@!${participant}> isn't in a VoiceChannel and couldn't be moved`);
                  }
                  // console.log(`Tried moving <@!${participant}> to channel ${channel}`);
                  // msg.channel.send(member.toString());
                  switch (team.id) {
                    case 1:
                      member.setVoiceChannel("526434603238555670");
                      break;
                    case 2:
                      member.setVoiceChannel("526434649472368670");
                      break;
                    case 3:
                      member.setVoiceChannel("547864161288192020");
                      break;
                    default:
                      msg.reply(`coudn't find channel for team ${team.id}: ${team.name}`);
                  }
                  // member.setVoiceChannel(channel);
                });
              });
            });
            break;
          case 'leave':
            if (!db.has(`tournament.${msg.guild.id}`).value()) {//safety
              msg.reply("Currently no running tournament for your server, start one with 'tournament create'");
            }

            var isAlreadyJoined = 0;
            await Teams.forEach(team => {
              if(team.participants.includes(msg.author.id)) {
                let i = team.participants.indexOf(msg.author.id);
                if (i==-1) {
                  msg.reply("there was an error with your request leaving the tournament, please try again, if this persists, please use '!report' with your issue");
                  console.log("ERROR, index of participant = -1");
                  console.log(team.participants);
                  console.log(msg.author.id);
                  console.log("test");
                  return;
                }
                team.participants.splice(i, 1);
                db.set(`tournament.${msg.guild.id}.${team}.participants`, team.participants).write();
                msg.reply(`has left the tournament: ${db.get(`tournament.${msg.guild.id}.name`)}`);
                isAlreadyJoined = 1;
                return true;
              }
            });
            if (isAlreadyJoined==0) {
              msg.reply(`You aren't joined, you need to do that before you can leave, you know?`);
              return;
            }
            ShowTournament(client, msg);
            break;
          case 'join'://enter tournament
            if (!db.has(`tournament.${msg.guild.id}`).value()) {//safety
              msg.reply("Currently no running tournament for your server, start one with 'tournament create'");
            }

            var isAlreadyJoined = 0;
            await Teams.forEach(team => {
              if(team.participants.includes(msg.author.id)) {
                msg.reply("you have already joined");
                isAlreadyJoined = 1;
                return true;
              }
            });
            if (isAlreadyJoined!=0) {
              return;
            }

            let teamToJoin;
            if (args[1]) {
              console.log(args[1]);
              let teamToJoin = Teams.find(team => team.id = args[1]) || Teams.find(team => team.name = args[1]);
              console.log(teamToJoin);
            }

            let lastTeamSize = 99;
            await Teams.forEach(team => {
              if (team.participants.length < lastTeamSize) {
                lastTeamSize = team.participants.length ;
                teamToJoin = team;
              }
            });
            let Participants = teamToJoin.participants;
            teamToJoin.participants.push(msg.author.id);
            console.log(
              db.get(teamToJoin).assign({Participants}).write()
            );
            ShowTournament(client, msg);
            break;
          case 'end'://ends tournament
            console.log(db.unset(`tournament.${msg.guild.id}`).write());
            msg.react('😞');
            break;
          case 'switch'://to switch either own team, or other players team
            if (db.get(`tournament.${msg.guild.id}.teams`).value().length != 2) {
              msg.reply(`switch is only supported if there are exactly 2 teams, not ${db.get(`tournament.${msg.guild.id}.teams`).value().length}`);
              return;
            }
            if (true) {//if metions or switch msg.author instead
              Teams.forEach(team => {
                console.log(`${team}`);
                if(team.participants.includes(msg.author.id)) {
                  console.log(`found author in team ${team.id}`);
                  let otherteam = Teams.find(function(testteam){
                    // if (team.id != testteam.id) {
                    //   console.log("should have worked");
                    // }
                    if (team.id != testteam.id) {//could be adapted to cycle through any team amount
                      console.log("testteam.id" + testteam.id);
                      return testteam;
                    }
                  });
                  console.log(`${Teams}`);
                  team.participants.splice(team.participants.indexOf(msg.author.id), 1);
                  otherteam.participants.push(msg.author.id);
                  //console.log(db.set(`tournament.${msg.guild.id}.${team}.participants`, team.participants).write());
                  //console.log(db.set(`tournament.${msg.guild.id}.${otherteam}.participants`, otherteam.participants).write());
                  db.set(`tournament.${msg.guild.id}.teams`, Teams).write();
                }
              });
            }
            // msg.mentions ;
            ShowTournament(client, msg);
            break;
          case 'test':
            if (!OPs.RealAdmins.includes(msg.author.id)) {
              msg.reply(`Nice try ${msg.author.username}, you're not allowed to access this`);
              return;
            }
            console.log(db.set(`test.${msg.guild.id}.teams`, [{name:"1", participants:[]},{name:"2", participants:[]}]).write());
            break;
          default:
            msg.reply("I'm sorry, i didn't get that, try 'help tournament'");
        }
      }
    },
    // { //showmatch //will probably delete
    //   "name": "showmatch",
    //   "description": "not yet implemented",
    //   "MemberOnly": true,
    //   "run": async function run (client, msg, args, command) {
    //
    //
    //
    //     // var reply = "";
    //     // await msg.member.guild.roles.find("name", "Mitbewohner").members.forEach(member => {
    //     //   if (member.voiceChannel) {
    //     //     member.setVoiceChannel("536246570946002959");
    //     //     reply = `${member.user.username} was rallied\n` + reply;
    //     //   } else {
    //     //     reply = reply + `${member.user.username} can't be bothered\n`;
    //     //   }
    //     // });
    //     // msg.channel.send("Gathering Members:\n" + reply);
    //   }
    // },
    { //test UNUSED
      "name": "test",
      "description": "just for testing",
      "adminOnly":true,
      "run": async function run(client, msg, args, command) {

      }
    }
  ]
}
