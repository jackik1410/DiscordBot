const git = require('simple-git')('./');
const winston = require('./logger').winston;
const restart = require('./logger').restart;

var doUpdate = true; //weither or not it automatically updates from git repo.

git.pull().tags((err, tags) => console.log("Latest available tag: %s", tags.latest));

async function checkForUpdates(){
  git.pull((err, update) => {
    if(update && update.summary.changes) {
      winston.info('update found, restarting bot');
      restart();
      // require('child_process').exec('npm restart');
    } else {
      // winston.info('no updates found');
    }
    if (err) {
      winston.error('Update '+err);
    }
  });
  return;
}

function initialiseRepo (git) {
  return git.init()
    .then(() => git.addRemote('origin', 'https://github.com/jackik1410/DiscordBot'))
}


if (doUpdate) {
  if(!git.checkIsRepo()){
    initialiseRepo(git).
    git.fetch();
  }

  setInterval(checkForUpdates, 60000);// 60000 = 1min
}
