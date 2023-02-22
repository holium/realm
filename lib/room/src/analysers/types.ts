import { LocalPeer } from 'peer/LocalPeer';

export interface IAudioAnalyser {
  attach: (peer: LocalPeer) => void;
  detach: () => void;
}
