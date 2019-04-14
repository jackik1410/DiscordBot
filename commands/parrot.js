module.exports = {
  "name":"parrot",
  "description":"parroting message",
  // "adminOnly": false,
  "run": async function run(client, msg, args, command) {
    var string= msg.content.slice(command.length +2);
    if (string.length<1) {
      msg.reply(`message is too short... can't repeat nothing i'm afraid ${msg.author.username}`);
      return;
    }
    msg.channel.send(string);
    console.log('parroting message: ' + string);
  }
}
