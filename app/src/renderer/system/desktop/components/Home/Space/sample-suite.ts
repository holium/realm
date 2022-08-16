export const sampleSuite = [
  {
    id: 'ballot',
    title: 'Ballot',
    info: 'An app that allows you to vote with other ships. Built by Holium.',
    color: '#cebef0',
    type: 'urbit',
    image:
      'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg',
    href: {
      glob: {
        base: 'ballot',
        'glob-reference': {
          location: {
            http: 'https://lomder-librun.sfo3.digitaloceanspaces.com/globs/glob-0v2.qk6se.sg3dr.q5dnr.jeie1.79lkf.glob',
          },
          hash: '0v2.qk6se.sg3dr.q5dnr.jeie1.79lkf',
        },
      },
    },
    version: '0.0.5',
    website: 'https://holium.com',
    license: 'MIT',
  },
  {
    id: 'campfire',
    title: 'Campfire',
    info: 'Hang out with your friends. Voice and video chat by Holium.',
    color: '#ffc179',
    type: 'urbit',
    image:
      'https://raw.githubusercontent.com/datryn-ribdun/urbit-webrtc/master/campfire/logo.svg',
    href: {
      glob: {
        base: 'campfire',
        'glob-reference': {
          location: {
            ames: '~dister-dister-datryn-ribdun',
          },
          hash: '0vibu41.fj3s4.s7p7a.1lgc8.62pav',
        },
      },
    },
    version: '0.1.3',
    website: 'https://github.com/datryn-ribdun/urbit-webrtc',
    license: 'MIT',
  },
];
