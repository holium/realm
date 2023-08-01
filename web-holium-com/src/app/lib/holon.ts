import { IRootStore } from '../ws';
import { IConduit, IConduitProtocol } from './wscore';

export class HolonProtocol implements IConduitProtocol {
  public conduit: IConduit | undefined;
  public rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;
  }

  attach(conduit: IConduit) {
    this.conduit = conduit;
  }

  match(message: any): boolean {
    // assume that if the message has response and id fields that it is an urbit
    //  ship response. so this holon protocol wants everything that's NOT an urbit payload
    if (
      !(typeof message === 'object' && 'id' in message && 'response' in message)
    ) {
      return true;
    }
    return false;
  }

  // wrap the message in an array .. the actual underlying conduit
  // (in the case of websocket), will JSON.stringify this payload.
  send(msg: any) {
    this.conduit?.transmit([msg]);
  }

  on_new_message(msg: any): boolean {
    // simply print the message
    console.log('holon protocol: [on_new_message] %o', msg);
    return true;
  }
}
