import { LocalPeer } from 'peer/LocalPeer';
import { IAudioAnalyser } from './types';

export class BaseAnalyser implements IAudioAnalyser {
  peer: LocalPeer | null = null;
  attach(peer: LocalPeer) {
    this.peer = peer;
  }
  detach() {}
}
