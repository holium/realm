import { IRootStore } from '../ws';
import { IConduit, IConduitProtocol } from './wscore';

export class UrbitProtocol implements IConduitProtocol {
  private static nextMessageId = 1;
  private msgs: Map<number, any>;
  public conduit: IConduit | undefined;
  public rootStore: IRootStore;

  constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;
    this.msgs = new Map<number, any>();
  }

  attach(conduit: IConduit) {
    this.conduit = conduit;
  }

  match(message: any): boolean {
    // assume that if the message has response and id fields that it is an urbit
    //  ship response. see: https://developers.urbit.org/reference/arvo/eyre/external-api-ref#responses
    if (
      typeof message === 'object' &&
      'id' in message &&
      'response' in message
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
    if (this.msgs.has(msg.id)) {
      console.warn(
        `ws: [on_urbit_event] message received with no corresponding client side queue entry. detail: ${msg}`
      );
    }

    console.log(`acking ${msg.id} msg-id=${UrbitProtocol.nextMessageId + 1}`);

    // ack the event before doing anything else
    this.conduit?.transmit({
      id: UrbitProtocol.nextMessageId++,
      action: 'ack',
      'event-id': msg.id,
    });

    // remove the message from the queue
    this.msgs.delete(msg.id);

    if (msg.err) {
      console.error(`ws: [on_urbit_event] error: %o`, msg);
      return false;
    }

    switch (msg.response) {
      case 'diff':
        if (this.msgs.has(msg.id)) {
          this.rootStore.app.onMessage(msg.app, msg);
        } else {
          console.warn(`ws: [on_urbit_event] no handler for ${msg}`);
        }
        break;

      case 'subscribe':
        console.log(`ws: [on_urbit_event] quit received`);
        break;

      case 'quit':
        console.log(`ws: [on_urbit_event] quit received`);
        break;

      case 'poke':
        console.log(`ws: [on_urbit_event] poke received`);
        break;

      default:
        console.warn(
          `ws: [on_urbit_event] ${msg.id} unrecognized message 'response' field => %o`,
          msg
        );
        break;
    }

    return true;
  }

  public subscribe(app: string, path: string): void {
    this.send({
      id: UrbitProtocol.nextMessageId++,
      action: 'subscribe',
      // patp always starts with ~
      ship: this.conduit?.patp.substring(1),
      app: app,
      path: path,
    });
  }

  public unsubscribe(subscription: number): void {
    this.send({
      id: UrbitProtocol.nextMessageId++,
      action: 'unsubscribe',
      subscription: subscription,
    });
  }

  public poke(app: string, mark: string, json: any): void {
    this.send({
      id: UrbitProtocol.nextMessageId++,
      action: 'poke',
      // patp always starts with ~
      ship: this.conduit?.patp.substring(1),
      app: app,
      mark: mark,
      json: json,
    });
  }

  public delete_channel(): void {
    this.send({
      id: UrbitProtocol.nextMessageId++,
      action: 'delete',
    });
  }
}
