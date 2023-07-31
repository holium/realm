import { IRootStore } from '../ws';

const network = 'holium.network';

export enum ConduitConnectionState {
  connected = 'connected',
  closed = 'closed',
  reconnecting = 'reconnecting',
}

export interface IConduitProtocol {
  conduit: IConduit;
  rootStore: IRootStore;
  match(message: any): boolean;
  send(msg: any): any;
  on_new_message(msg: any): boolean;
}

export interface IConduit {
  readonly patp: string;
  readonly code: string;
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
  private connectionStatus: ConduitConnectionState | undefined = undefined;
  private protocol: IConduitProtocol | undefined = undefined;

  public constructor(
    patp: string,
    accessCode: string,
    conduitProtocol: IConduitProtocol
  ) {
    this.patp = patp;
    this.code = accessCode;

    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const domain =
      process.env.NODE_ENV === 'production'
        ? `${patp.substring(1)}.${network}`
        : 'localhost:3030';
    this.url = `${protocol}://${domain}/ws?access_code=${accessCode}`;

    this.protocol = conduitProtocol;
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

        this.protocol?.on_new_message(data);
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
  private protocol: IConduitProtocol | undefined;
  // @ts-ignore
  private rootStore: IRootStore | undefined;

  private constructor(patp: string, accessCode: string) {
    this.patp = patp;
    this.accessCode = accessCode;
    this._conduit = undefined;
    this.rootStore = undefined;
    this.protocol = undefined;
  }

  // url - e.g. wss://pasren-satmex.holium.network
  // accessCode: ship code (e.g. )
  public static getInstance(patp: string, accessCode: string): APIConnection {
    if (APIConnection.instance) return APIConnection.instance;
    APIConnection.instance = new APIConnection(patp, accessCode);
    return APIConnection.instance;
  }

  public use(protocol: IConduitProtocol) {
    this.protocol = protocol;
  }
  // connect to the underlying conduit. in the case of browser chat,
  //  this will be the new websocket capability
  public connect(): Promise<ConduitConnectionState> {
    if (this._conduit) {
      console.error('ws: error. _conduit instance already established');
      return new Promise((_, reject) => reject('conduit is single instance'));
    }
    if (!this.protocol) {
      console.error(
        "ws: error. connection needs a protocol to function property. please call the 'use' method of the api"
      );
      return new Promise((_, reject) => reject('conduit is single instance'));
    }

    // store this for now. there will most probably be a future use-case for this reference
    // this.rootStore = rootStore;

    // const messageHandlers = [
    //   new HolonMessageHandler(this.conduit, rootStore),
    //   new UrbitMessageHandler(this.conduit, rootStore),
    // ];

    this._conduit = new WebSocketConduit(
      this.patp,
      this.accessCode,
      this.protocol
    ) as IConduit;
    return this._conduit.connect();
  }

  get conduit(): IConduit {
    return this._conduit as IConduit;
  }
}
