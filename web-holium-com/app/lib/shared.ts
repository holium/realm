// export const shipUrl = 'http://localhost';
export const shipUrl =
  process.env.NEXT_PUBLIC_BUILD === 'development' ? 'http://localhost' : '';
export let shipName = '~zod';
if (typeof window !== 'undefined') {
  shipName = (window as any).ship;
}

export const isProd = process.env.NODE_ENV === 'production';

type SupportedWallets = {
  [key: string]: {
    explorer_id: string;
    image_id: string;
    image_url: string;
  };
};

export const supportedWallets: SupportedWallets = {
  // metamask
  metamask: {
    explorer_id:
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    image_id: '5195e9db-94d8-4579-6f11-ef553be95100',
    image_url:
      'https://explorer-api.walletconnect.com/v3/logo/lg/5195e9db-94d8-4579-6f11-ef553be95100?projectId=f8134a8b6ecfbef24cfd151795e94b5c',
  },
  // rainbow
  rainbow: {
    explorer_id:
      '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    image_id: '7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500',
    image_url:
      'https://explorer-api.walletconnect.com/v3/logo/md/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=f8134a8b6ecfbef24cfd151795e94b5c',
  },
  // trust
  trust: {
    explorer_id:
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    image_id: '0528ee7e-16d1-4089-21e3-bbfb41933100',
    image_url:
      'https://explorer-api.walletconnect.com/v3/logo/md/0528ee7e-16d1-4089-21e3-bbfb41933100?projectId=f8134a8b6ecfbef24cfd151795e94b5c',
  },
};

export const supportedWalletIds = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
];
