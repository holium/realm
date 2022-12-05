// var http = require('https');
module.exports = ({ github, context }) => {
  console.log('%o', { github, context });
  // const options = {
  //   hostname: 'firluc-hinhul-lodlev-migdev.holium.live.holium.live',
  //   port: 443,
  //   path: '/~/channel/123',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Content-Length': Buffer.byteLength(postData),
  //   },
  // };
  // callback = function (response) {
  //   var str = '';
  //   response.on('data', function (chunk) {
  //     str += chunk;
  //   });

  //   response.on('end', function () {
  //     console.log(str);
  //   });
  // };
  // var req = https.request(options, callback);
  // //This is the data we are posting, it needs to be a string or a buffer
  // req.write(
  //   JSON.stringify({
  //     id: Date.now(),
  //     action: Action.Poke,
  //     ship: context.
  //     app: 'usher',
  //     mark: 'marshal-action',
  //     json: {
  //       commit: null,
  //     },
  //   })
  // );
  // req.end();
};
