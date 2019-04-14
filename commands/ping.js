const Discord = require("discord.js");


module.exports = {
  "name":"ping",
  "aliases": ["lag"],
  "description":"measuring ping",
  "adminOnly": false,
  "run": async function run(client, msg, args) {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await msg.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
}
