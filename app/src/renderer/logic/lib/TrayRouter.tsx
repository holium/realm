interface ITrayRouter {
  apps: {
    dm: {
      currentView: '';
      views: 'dm-list' | 'dm-chat' | 'new-chat' | 'loading';
    };
  };
}

export class TrayRouter {
  apps = {
    dm: {
      currentView: 'dm-chat',
      state: {
        contact: '~lomder-librun',
      },
      views: ['dm-list', 'dm-chat', 'new-chat', 'loading'],
    },
    assembly: {
      currentView: 'assembly-list',
      state: {},
      views: ['assembly-list', 'assembly-room', 'new-assembly', 'loading'],
    },
    wallet: {
      currentView: 'wallet',
      state: {
        address: '1JCKfg...u8vJCh',
      },
      views: ['wallet', 'wallet-list', 'new-wallet', 'wallet-transaction'],
    },
  };
}
