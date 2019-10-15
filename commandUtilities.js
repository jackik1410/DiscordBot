var client = require('./client.js');
const winston = require(`./logger.js`).winston;

module.exports = class botCommand {
    constructor(cmdObject){
        cmdObject;
        if (typeof cmdObject.run == "string") {
            this.run = eval(cmdObject.run); //to support true JSON
        } else {
            this.run = cmdObject.run;
        }
        this.name = cmdObject.name || "name undefined";
        this.description = cmdObject.description || "no description set for this command";
        if (cmdObject.repeatable === true && false) {
            this.function = this.run;
            this.run = ()=>{
                let returned = this.function(arguments);
                if (returned.constructor.name === "Message" && false==true) {
                    let timeout;

                    returned.react("🔁");
                    const filter = (reaction, user) => reaction.emoji.name=="🔁" && user.id != client.user.id;
                    let collector = returned.createReactionCollector(filter).on('collect', async r => {
                      returned.delete(); //delete msg

                      collector.stop(); //delete anything remaining here
                      stopTimeout(timeout);

                      this.run(arguments); //run the command again
                    });

                    timeout = setTimeout(()=>{
                            returned.react("🔁");
                            collector.stop();
                        },60*1000);
                } else {
                    // console.error(this)
                    winston.error( ""+this.name + " didn't return a msg despite being set to repeatable!")
                }
            }
        }
    }

    isAllowed(MemberOrUser){ //is that a smart idea? I'm not sure... Might rather expand the guild and user objects instead...
        return true;
    }
}
