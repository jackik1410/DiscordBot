const git = require('simple-git')('./');
const winston = require('./logger').winston;
const restart = require('./logger').restart;

var doAutoUpdate = true; //weither or not it automatically updates from git repo.


const {username, password, token} = require("./auth.json").git;

function initialiseRepo (git) {
  return git.init()
    .then(() => git.addRemote('origin', 'https://github.com/jackik1410/DiscordBot')); //edit this if you want it to fetch from somewhere else.
}

// git.pull().tags((err, tags) => console.log("Latest available tag: %s", tags.latest));

async function checkForUpdates(){
  try {
    git.pull(async (err, update) => {
      if(update && update.summary.changes) {
        await winston.info('update found, restarting bot');
        await winston.debug(update.summary.changes);
        restart('Updating from GIT', 10);
        // require('child_process').exec('npm restart');
        return("now updating");
      } else {
        // winston.info('no updates found');
        return("no updates found");
      }

      if (err) {
        winston.error('Update '+err);
        return("error while updating");
      }
    });
  } catch (e) {
    winston.error('Update '+e);
  } finally {

  }
}


//here starts the actuak loop
if (doAutoUpdate) {
  if(!git.checkIsRepo()){
    initialiseRepo(git).
    git.fetch();
  }

  setInterval(checkForUpdates, 1 * 60 * 1000);// 60000 = 1min
}

module.exports = {
  "checkForUpdates": checkForUpdates
}
