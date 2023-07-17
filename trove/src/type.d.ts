declare module 'urbit-ob';
declare const window: Window &
  typeof globalThis & {
    scry: any;
    poke: any;
    ship: string;
  };
