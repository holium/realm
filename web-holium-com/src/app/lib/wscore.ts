import { IRootStore } from '../ws';

const network = 'holium.network';

export enum ConduitConnectionState {
  initial = 'initial',
  connected = 'connected',
  closed = 'closed',
  error = 'error',
  reconnecting = 'reconnecting',
}

export interface IConduitProtocol {
  conduit: IConduit | undefined;
  rootStore: IRootStore;
  attach(conduit: IConduit): void;
  match(message: any): boolean;
  send(msg: any): any;
  on_new_message(msg: any): boolean;
}

export interface IConduit {
  readonly patp: string;
  readonly code: string;
  protocols: IConduitProtocol[];
  connect(): Promise<ConduitConnectionState>;
  status(): ConduitConnectionState | undefined;
  // register(handler: IConduitMessageHandler): void;
  transmit(data: any): void;
}

class WebSocketConduit implements IConduit {
  private url: string;
  private ws: WebSocket | undefined;
  public patp: string;
  public code: string;
  private connectionStatus: ConduitConnectionState;
  public protocols: IConduitProtocol[];
  public rootStore: IRootStore;

  public constructor(
    patp: string,
    accessCode: string,
    protocols: IConduitProtocol[],
    rootStore: IRootStore
  ) {
    this.connectionStatus = ConduitConnectionState.initial;
    this.patp = patp;
    this.code = accessCode;
    this.protocols = protocols;
    this.rootStore = rootStore;

    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const domain =
      process.env.NODE_ENV === 'production'
        ? `${patp.substring(1)}.${network}`
        : 'localhost:3030';
    this.url = `${protocol}://${domain}/ws?access_code=${accessCode}`;
  }

  public status(): ConduitConnectionState | undefined {
    return this.connectionStatus;
  }

  public connect(): Promise<ConduitConnectionState> {
    return new Promise((resolve, reject) => {
      console.log(`opening websocket connection to '${this.url}...`);
      const ws = new WebSocket(this.url);

      ws.onopen = (event) => {
        console.log('ws: [onopen] web socket opened %o', event);

        // notify any thing observing our state
        this.rootStore.setConnectionState(ConduitConnectionState.connected);

        // ask the protocol if it recognizes the message and, if so, allow
        //  it to handle the message
        for (let i = 0; i < this.protocols.length; i++) {
          this.protocols[i].attach(this);
        }

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

        // ask the protocol if it recognizes the message and, if so, allow
        //  it to handle the message
        for (let i = 0; i < this.protocols.length; i++) {
          if (this.protocols[i].match(data)) {
            this.protocols[i].on_new_message(data);
          }
        }
      };

      ws.onclose = (event) => {
        console.log('ws: [onclose] web socket closed %o', event);
        this.ws = undefined;
      };

      ws.onerror = (event) => {
        console.log('ws: [onerror] web socket error %o', event);

        // notify anyone observing connection state
        this.rootStore.setConnectionState(ConduitConnectionState.error);

        reject('error trying to connect to websocket');
      };
    });
  }

  transmit(data: any): void {
    this.ws?.send(JSON.stringify(data));
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
  // @ts-ignore
  private rootStore: IRootStore | undefined;
  private protocols: IConduitProtocol[];

  private constructor(patp: string, accessCode: string) {
    this.patp = patp;
    this.accessCode = accessCode;
    this._conduit = undefined;
    this.rootStore = undefined;
    this.protocols = [];
  }

  // url - e.g. wss://pasren-satmex.holium.network
  // accessCode: ship code (e.g. )
  public static getInstance(patp: string, accessCode: string): APIConnection {
    if (APIConnection.instance) return APIConnection.instance;
    APIConnection.instance = new APIConnection(patp, accessCode);
    return APIConnection.instance;
  }

  public register_protocol(protocol: IConduitProtocol) {
    this.protocols.push(protocol);
  }

  // connect to the underlying conduit. in the case of browser chat,
  //  this will be the new websocket capability
  public connect(rootStore: IRootStore): Promise<ConduitConnectionState> {
    if (this._conduit) {
      console.error('ws: error. _conduit instance already established');
      return new Promise((_, reject) => reject('conduit is single instance'));
    }

    this.rootStore = rootStore;

    this._conduit = new WebSocketConduit(
      this.patp,
      this.accessCode,
      this.protocols,
      this.rootStore
    ) as IConduit;

    return this._conduit?.connect();
  }

  get conduit(): IConduit {
    return this._conduit as IConduit;
  }
}
