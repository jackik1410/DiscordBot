const Discord = require('discord.js');


module.exports = {
  CommandArray : [
    {
      "name":"news",
      "description":"Use to have the bot post a message in the news channel, usage:'!news ~title~ | ~content~'",
      "MemberOnly": true,
      "run": async function run(client, msg, args, command){
        if (true) {

        }
        msg.delete(4000);
        msg.reply('working on posting... (please wait a bit)').then( m => m.delete(5000));
        var webhook = {
          "id":"590250045866115085",
          "token":"ar_Y5dJIWdGSt2ws327lQdSr3Wnoe-Tb9398gh1k8I2ksGnaVEAjmH7j85AoUni6ujwB"
        };
        var WEBHOOK = new Discord.WebhookClient(webhook.id, webhook.token);

        //var something = msg.content.slice(command.length).split('|');
        var content = msg.content.slice(client.prefix.length + command.length +1).split('|');

        WEBHOOK.send(`<@&388765646554398734>`,{
          embeds:[
            {
            "title": content[0],
            "color": 2735296,
            "description": content[1]
            }
          ]
        })
          .catch(console.error);

      }
    }
  ]
};
