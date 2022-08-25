const Conduit = require('../dist/holium-conduit.cjs.js');

const RealmAPI = new Conduit.Conduit(
  'http://localhost:8083',
  'fes',
  'urbauth-~fes=0v5.87816.sckim.5asm8.i6cec.ecm46; Path=/; Max-Age=604800',
  'realm'
);

RealmAPI.init().then(() => {
  RealmAPI.watch({
    app: 'friends',
    path: '/all',
    onEvent: (data) => {
      // console.log('in sample.js', data);
    },
  });

  RealmAPI.poke({
    app: 'friends',
    mark: 'friends-action',
    json: {
      'add-friend': {
        ship: '~dev',
      },
    },
    reaction: 'friends-reaction.new-friend',
    onReaction: (data) => {
      // console.log('is it poke reaction?', data);
    },
  });

  RealmAPI.scry({
    app: 'passports',
    path: '/visas',
  }).then((res) => {
    // console.log('scry, ', res);
  });

  // RealmAPI.closeChannel().then(() => {
  //   RealmAPI.init();
  // });

  setTimeout(() => {
    RealmAPI.init().then(() => {
      RealmAPI.scry({
        app: 'passports',
        path: '/visas',
      }).then((res) => {
        // console.log('scry again', res);
      });
    });
  }, 5000);

  setTimeout(async () => {
    await RealmAPI.closeChannel();
    // console.log('closed');
  }, 7000);
});
