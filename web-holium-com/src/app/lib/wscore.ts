import { IRootStore } from '../ws';

const network = 'holium.network';

enum ConduitConnectionState {
  connected = 'connected',
  closed = 'closed',
  reconnecting = 'reconnecting',
}

interface IConduitMessageHandler {
  on_new_message(msg: any): { matched: boolean; result: boolean };
}

interface IConduit {
  connect(): Promise<ConduitConnectionState>;
  status(): ConduitConnectionState | undefined;
  register(handler: IConduitMessageHandler): void;
  transmit(data: any): void;
}

class HolonMessageHandler implements IConduitMessageHandler {
  // private _conduit: IConduit = null;

  public constructor(_conduit: IConduit) {
    // this.conduit = conduit;
  }

  on_new_message(msg: any): { matched: boolean; result: boolean } {
    if (typeof msg === 'object' && 'id' in msg && 'response' in msg) {
      return { matched: false, result: false };
    }

    // simply print any messages coming from holon
    console.log(`ws: holon message => %o`, msg);

    return { matched: true, result: true };
  }
}

class UrbitMessageHandler implements IConduitMessageHandler {
  private conduit: IConduit;
  private nextMessageId = 1;
  private msgs: Map<number, object>;

  public constructor(conduit: IConduit) {
    this.conduit = conduit;
    this.msgs = new Map<number, object>();
  }

  // process a message, first checking if it's an actual urbit message
  //  return false, if the message was not processed; otherwise true
  on_new_message(msg: any): { matched: boolean; result: boolean } {
    // assume that if the message has response and id fields that it is an urbit
    //  ship response. see: https://developers.urbit.org/reference/arvo/eyre/external-api-ref#responses
    if (!(typeof msg === 'object' && 'id' in msg && 'response' in msg)) {
      return { matched: false, result: false };
    }

    if (this.msgs.has(msg.id)) {
      console.warn(
        `ws: [on_urbit_event] message received with no corresponding client side queue entry. detail: ${msg}`
      );
    }

    console.log(`acking ${msg.id} msg-id=${this.nextMessageId + 1}`);
    // ack the event before doing anything else
    this.conduit.transmit(
      JSON.stringify([
        {
          id: this.nextMessageId++,
          action: 'ack',
          'event-id': msg.id,
        },
      ])
    );

    // remove the message from the queue
    this.msgs.delete(msg.id);

    if ('err' in msg) {
      console.error(`ws: [on_urbit_event] error: %o`, msg);
      return { matched: true, result: false };
    }

    switch (msg.response) {
      case 'diff':
        if (this.msgs.has(msg.id)) {
          // update mobx state store based on diff data
        } else {
          console.warn(`ws: [on_urbit_event] no handler for ${msg}`);
        }
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

    return { matched: true, result: true };
  }
}

class WebSocketConduit implements IConduit {
  private url: string;
  private ws: WebSocket | undefined;
  private connectionStatus: ConduitConnectionState | undefined = undefined;
  private handlers: IConduitMessageHandler[] = [];

  public constructor(patp: string, accessCode: string) {
    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const domain =
      process.env.NODE_ENV === 'production'
        ? `${patp.substring(1)}.${network}`
        : 'localhost:3030';
    this.url = `${protocol}://${domain}/ws?access_code=${accessCode}`;

    // for now register the Urbit message handler here, but could DI it based
    //   on config or other context
    this.register(new HolonMessageHandler(this));
    this.register(new UrbitMessageHandler(this));
  }

  public status(): ConduitConnectionState | undefined {
    return this.connectionStatus;
  }

  public connect(): Promise<ConduitConnectionState> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);

      ws.onopen = (event) => {
        console.log('ws: [onopen] web socket opened %o', event);
        // hole onto this reference
        this.ws = ws;
        resolve(ConduitConnectionState.connected);
      };

      ws.onmessage = (event) => {
        let data = undefined;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error(e);
          data = event;
        }

        console.log('ws: [onmessage] event received. %o', data);

        for (let i = 0; i < this.handlers.length; i++) {
          this.handlers[i].on_new_message(data);
        }
      };

      ws.onclose = (event) => {
        console.log('ws: [onclose] web socket closed %o', event);
        this.ws = undefined;
      };

      ws.onerror = (event) => {
        console.log('ws: [onerror] web socket error %o', event);
        reject('error trying to connect to websocket');
      };
    });
  }

  transmit(data: any): void {
    this.ws?.send(data);
  }

  register(handler: IConduitMessageHandler): void {
    this.handlers.push(handler);
  }
}

//
// SINGLETON CONDUIT CONNECTION
// in the case of browser chat, the underlying conduit will be a web socket connection
//
export class APIConnection {
  private static instance: APIConnection;
  private patp: string;
  private accessCode: string;
  private _conduit: IConduit | undefined;
  private rootStore: IRootStore | undefined;

  private constructor(patp: string, accessCode: string) {
    this.patp = patp;
    this.accessCode = accessCode;
    this._conduit = undefined;
    this.rootStore = undefined;
  }

  // url - e.g. wss://pasren-satmex.holium.network
  // accessCode: ship code (e.g. )
  public static getInstance(patp: string, accessCode: string): APIConnection {
    if (APIConnection.instance) return APIConnection.instance;
    APIConnection.instance = new APIConnection(patp, accessCode);
    return APIConnection.instance;
  }

  public attach(rootStore: IRootStore) {
    this.rootStore = rootStore;
  }

  // connect to the underlying conduit. in the case of browser chat,
  //  this will be the new websocket capability
  public connect(): Promise<ConduitConnectionState> {
    if (this._conduit) {
      console.error('ws: error. _conduit instance already established');
      return new Promise((_, reject) => reject('conduit is single instance'));
    }
    this._conduit = new WebSocketConduit(
      this.patp,
      this.accessCode
    ) as IConduit;
    return this._conduit.connect();
  }

  get conduit(): IConduit {
    return this._conduit as IConduit;
  }
}
