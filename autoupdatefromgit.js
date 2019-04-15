const git = require('simple-git')('./');
const winston = require('./logger').winston;
const restart = require('./logger').restart;

var doUpdate = true; //weither or not it automatically updates from git repo.


git.pull().tags((err, tags) => console.log("Latest available tag: %s", tags.latest));

async function autoUpdate(){
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

if (doUpdate) setInterval(autoUpdate, 60000); // 60000 = 1min






// update repo and when there are changes, restart the app
