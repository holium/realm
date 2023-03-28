export {};
declare global {
  interface Window {
    ship: string;
    onSpotifyIframeApiReady: any;
  }
}
declare module 'urbit-ob';
