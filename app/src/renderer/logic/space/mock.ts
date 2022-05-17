export const spaces: { [key: string]: any } = {
  ['the-swolesome-fund']: {
    id: 'the-swolesome-fund',
    name: 'The Swolesome Fund',
    color: '#FF0101',
    type: 'group',
    picture:
      'https://archiv.nyc3.digitaloceanspaces.com/littel-wolfur/2022.2.13..05.27.08-jacked.png',
    members: {
      count: 60,
      list: [{ patp: '~lomder-librun', role: 'admin' }],
    },
    theme: {
      themeId: 'the-swolesome-fund',
      backgroundColor: '#c4c3bf',
      dockColor: '#f5f5f4',
      iconColor: 'rgba(95,94,88,0.5)',
      textColor: '#2a2927',
      textTheme: 'light',
      wallpaper:
        'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=100',
      windowColor: '#f5f5f4',
    },
    apps: {
      pinned: [],
    },
    token: {
      chain: 'ethereum',
      network: 'mainnet',
      contract: '0x3491ur0vjsf1031413413',
      symbol: '$SWOL',
    },
  },
  ['other-life']: {
    id: 'other-life',
    name: 'Other Life',
    color: '#674E81',
    type: 'group',
    picture:
      'https://dl.airtable.com/.attachmentThumbnails/85973e6c8ac12bef0ce4fbc046a2fb7c/8c21d303',
    members: {
      count: 1261,
      list: [{ patp: '~lomder-librun', role: 'admin' }],
    },
    theme: {
      themeId: 'other-life',
      backgroundColor: '#c4c3bf',
      dockColor: '#f5f5f4',
      iconColor: 'rgba(95,94,88,0.5)',
      textColor: '#2a2927',
      textTheme: 'light',
      wallpaper:
        'https://images.unsplash.com/photo-1621290102989-e9865bef2dcf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2103&q=100',
      windowColor: '#f5f5f4',
    },
    apps: {
      pinned: ['ballot'],
      docket: {
        ['gnosis-safe']: {
          id: 'gnosis-safe',
          title: 'Gnosis Safe',
          type: 'web',
          icon: '',
          href: '<link_to_gnosis>',
        },
        ['ballot']: {
          id: 'ballot',
          title: 'Ballot (alpha)',
          type: 'native',
          info: 'An app that allows you to vote with other ships. Built by Holium.',
          color: '#cebef0',
          image:
            'https://lomder-librun.sfo3.digitaloceanspaces.com/tiles/ballot-app-tile.svg',
          href: {
            glob: {
              base: 'ballot',
              'glob-reference': {
                location: {
                  http: 'https://lomder-librun.sfo3.digitaloceanspaces.com/globs/glob-0v28ktr.ujaup.832r3.fbs8q.b9ssn.glob',
                },
                hash: '0v28ktr.ujaup.832r3.fbs8q.b9ssn',
              },
            },
          },
          version: '0.0.4',
          website: 'https://holium.com',
          license: 'MIT',
        },
      },
    },
    token: {
      chain: 'ethereum',
      network: 'mainnet',
      contract: '0x3491ur0vjsf1031413413',
      symbol: '$LIFE',
    },
  },
};
export default spaces;
