const Discord = require('discord.js'); //basic discord functionality


var auth = require('./auth.json'); // contains the authentication token for the bot
const client = new Discord.Client({
   token: auth.token, //can be manually edited here aswell to token: 'YouRTokenHeRe',
   autorun: true
});
client.login(auth.token);//needed


module.exports = client;
