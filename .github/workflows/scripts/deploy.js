var https = require('https');
module.exports = ({ github }, { ship, code, rootUrl, mounts }) => {
  var req = https.request(
    `${rootUrl}/~/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
    },
    (response) => {
      const cookie = response.headers['set-cookie'][0];
      console.log('cookie obtained...poking remote ship...');
      var req = https.request(
        `${rootUrl}/~/channel/${Date.now()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookie,
          },
        },
        (response) => {
          console.log('poke processed');
        }
      );
      req.on('error', (e) => {
        console.error(e);
      });
      let id = 0;
      let pokes = [];
      for (let i = 0; i < mounts.length; i++) {
        pokes.push({
          id: Date.now() + id++,
          action: 'poke',
          ship: ship,
          app: 'marshal',
          mark: 'marshal-action',
          json: {
            commit: {
              'mount-point': mounts[i],
            },
          },
        });
      }
      req.write(JSON.stringify(pokes));
      req.end();
    }
  );
  req.on('error', (e) => {
    console.error(e);
  });
  req.write(`password=${code}`);
  req.end();
};
