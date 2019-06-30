var calc = { // array of handled operations
  "+": function(){},
  "-": function(){},
  "*": function(){},
  "/": function(){},
};

async function math(){

}

module.exports = {
  "CommandArray": [
    // {
    //   "name":"dmath",
    //   "description":"",
    //   "run": async function run(client, msg, args, command){
    //
    //   }
    // },
    {
      "name":"math",
      "description":"does math-y stuff",
      "adminOnly": true,
      "run": async function run(client, msg, args, command){

        //TODO: add proper query stuff, either wolfram|alpha as interpreter or matlab... wolfram|alpha is more versatile...

        const postData = querystring.stringify({
          'msg': 'Hello World!'
        });

        const options = {
          hostname: 'www.google.com',
          port: 80,
          path: '/upload',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
          });
          res.on('end', () => {
            console.log('No more data in response.');
          });
        });

        req.on('error', (err) => {
          console.error(`problem with request: ${err.message}`);
        });

        // Write data to request body
        req.write(postData);
        req.end();
      }
    }
  ]
};
