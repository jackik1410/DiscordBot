


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
        msg.reply('working on posting... (please wait a bit)').delete(5000)
        var webhook = {
          "id":"590250045866115085",
          "token":"ar_Y5dJIWdGSt2ws327lQdSr3Wnoe-Tb9398gh1k8I2ksGnaVEAjmH7j85AoUni6ujwB"
        };
        var WEBHOOK = new Discord.WebhookClient(webhook.id, webhook.token);

        WEBHOOK.send({
          "name":"",
          "color": 2735296,
          "content":""
        })
          .catch(console.error);

      }
    }
  ]
};
