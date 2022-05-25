import { generateChannelId } from './ship/util';
import axios from 'axios';
import EventEmitter from 'events';
import EventSource from 'eventsource';

export type ActionType = {
  action: string;
  context:
    | {
        resource: string;
        key: string;
        [key: string]: any;
      }
    | undefined;
  effects: EffectType[];
};

export type EffectType = {
  effect: 'add' | 'update' | 'delete' | 'initial';
  key: string; // ~zod, group name, etc
  resource: string;
  data: any;
};

export type ChannelResponseType = {
  id?: number;
  json: ActionType | any;
  response: 'diff';
};

// TODO rewrite conduit

class RetriableError extends Error {}
class FatalError extends Error {}

type WireHandlerType = {
  onError?: (err: any) => void;
  onEvent: (data: any) => void;
  onQuit?: (data: any) => void;
};

// TODO catch Promise rejections on subcription cancelled
// eyre: no subscription for request-id 2
// http: %cancel not handled yet
export class Conduit extends EventEmitter {
  url: string;
  ship: string;
  private cookie: string;
  counter: number = 0;
  sse: EventSource | null = null;
  retryTimeout: any = 0;
  wires: Map<
    number,
    { id: number; app: string; path: string; handlers: WireHandlerType }
  >;
  isConnected: boolean = false;
  controller = new AbortController();
  private channelUrl: string = '';
  private channelId: string = '';

  constructor(url: string, ship: string, cookie: string) {
    super();
    this.url = url;
    this.ship = ship.substring(1);
    this.cookie = cookie;
    this.wires = new Map();
    this.channelUrl = `${this.url}/~/channel/${this.channelId}`;
    this.initialize();
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };
  }

  initialize() {
    this.channelId = `${generateChannelId()}`;
    this.action('hood', 'opening airlock', 'helm-hi')
      .then((actionResponse: any) => {
        const { response, msgId } = actionResponse;
        this.cookie = response.headers['set-cookie']![0];
        this.ack(msgId);
        // TODO set new cookie in ShipManager
        this.stream().then(() => this.emit('ready', this));
      })
      .catch((err: any) => {
        // console.log(err);
      });
  }

  async stream(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sse = new EventSource(this.channelUrl, {
        headers: { Cookie: this.cookie },
      });
      this.sse.addEventListener('open', () => {
        // console.log('conduit opened');
        this.isConnected = true;
        resolve();
      });
      this.sse.addEventListener('message', (e) => {
        let event = JSON.parse(e.data);
        // console.log('event', event);
        // 1. Acknowledge event
        this.ack(event.id).catch((e: any) => {
          console.log(`error acking ${event.id}`);
          console.error(e);
        });
        if (event.response === 'subscribe') {
          // console.log('subscribed to ', event.id);
        }

        // 2. Get wire handlers
        // console.log(this.wires);
        const wire = this.wires.get(event.id);
        // console.log(wire?.app, wire?.path, event.json);
        if (!wire) {
          // TODO first poke to hood has no handler, give a stubbed one?
          // console.log(`no handler for event ${event.id}`, event);
          return;
        }
        const { app, path, handlers } = wire;
        if (event.err) {
          handlers.onError && handlers.onError(event);
          return;
        }
        // 3. Handle onEvent
        if (event.response === 'diff') {
          handlers.onEvent(event);
        }
        // 3. Handle reconnect
        if (event.response === 'quit') {
          console.log(`received a quit. reconnecting to %${app} on ${path}...`);
          this.reconnect(app, path, handlers);
        }
      });
      this.sse.addEventListener('error', (e: any) => {
        console.log('An error occurred while attempting to connect.', e);
      });
    });
  }

  private async ack(msgId: number) {
    return await axios.request({
      url: this.channelUrl,
      method: 'PUT',
      headers: this.headers,
      signal: this.controller.signal,
      data: [
        {
          action: 'ack',
          'event-id': msgId,
        },
      ],
    });
  }

  async reconnect(app: string, path: string, handlers: WireHandlerType) {
    if (this.retryTimeout !== 0) clearTimeout(this.retryTimeout);
    this.subscribe(app, path, handlers)
      .then(() => console.log(`re-subscribed to %${app} on ${path}`))
      .catch((e) => {
        console.log(
          `could not subscribe to %${app} on ${path}. retrying in 2 seconds...`
        );
        (function (watcher: Conduit, app: string, path: string) {
          watcher.retryTimeout = setTimeout(() => {
            watcher.reconnect(app, path, handlers);
          }, 2000);
        })(this, app, path);
      });
  }

  async subscribe(
    app: string,
    path: string,
    handlers: WireHandlerType = {
      onError: () => {},
      onEvent: () => {},
      onQuit: () => {},
    }
  ) {
    const msgId: number = ++this.counter;
    // console.log('sub', app, path, msgId);
    await axios.request({
      url: this.channelUrl,
      method: 'PUT',
      headers: this.headers,
      signal: this.controller.signal,
      data: [
        {
          id: msgId,
          action: 'subscribe',
          ship: this.ship,
          app,
          path,
        },
      ],
    });
    this.wires.set(msgId, { id: msgId, app, path, handlers });
    return msgId;
  }

  async action(app: string, data: any, mark?: string) {
    const msgId: number = ++this.counter;
    const response = await axios.request({
      url: this.channelUrl,
      method: 'PUT',
      headers: this.headers,
      signal: this.controller.signal,
      data: [
        {
          id: msgId,
          action: 'poke',
          ship: this.ship,
          app: app,
          mark,
          json: data,
        },
      ],
    });
    console.log('action, ', msgId, app, mark);
    return { msgId, response };
  }

  async bulkAction(app: string, data: any[], mark?: string) {
    const msgId: number = ++this.counter;
    const response = await axios.request({
      url: this.channelUrl,
      method: 'PUT',
      headers: this.headers,
      signal: this.controller.signal,
      data: data.map((action) => ({
        id: msgId,
        action: 'poke',
        ship: this.ship,
        app: app,
        mark,
        json: action,
      })),
    });
    return { msgId, response };
  }

  async scry(app: string, path: string) {
    try {
      const response = await axios.request({
        url: `${this.url}/~/scry/${app}${path}.json`,
        headers: this.headers,
        signal: this.controller.signal,
      });
      if (response.status === 200) {
        return { response: 'scry', json: { app, path, data: response.data } };
      }
      return { response: 'scry', json: null };
    } catch (err) {
      console.log(err);
      throw err;
      // Handle errors
    }
  }

  static async scryFetch(
    url: string,
    cookie: string,
    app: string,
    path: string
  ) {
    const headers = {
      'Content-Type': 'application/json',
      Cookie: cookie,
    };
    try {
      const response = await axios.request({
        url: `${url}/~/scry/${app}${path}.json`,
        headers: headers,
      });
      if (response.status === 200) {
        return { response: 'scry', json: { app, path, data: response.data } };
      }
      return { response: 'scry', json: null };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async ackOnce(channelUrl: string, headers: any, msgId: any) {
    await axios.request({
      url: channelUrl,
      method: 'PUT',
      headers,
      data: [
        {
          action: 'ack',
          'event-id': msgId,
        },
      ],
    });
  }

  static async pokeOnce(
    ship: string,
    url: string,
    cookie: string,
    app: string,
    mark: string,
    responsePath: string,
    data: any
  ) {
    const headers = {
      Cookie: cookie,
      'Content-Type': 'application/json',
    };
    const msgId: number = 1;
    const channelUrl = `${url}/~/channel/${generateChannelId()}`;
    const hoodResponse = await axios.request({
      url: channelUrl,
      method: 'PUT',
      headers,
      data: [
        {
          id: msgId,
          action: 'poke',
          ship: ship,
          app: 'hood',
          mark: 'helm-hi',
          data: 'opening airlock',
        },
      ],
    });
    headers.Cookie = hoodResponse.headers['set-cookie']![0];
    Conduit.ackOnce(channelUrl, headers, msgId);
    const requestConfig: any = {
      url: channelUrl,
      method: 'PUT',
      headers,
      data: [
        {
          id: msgId + 1,
          action: 'subscribe',
          ship,
          app,
          path: responsePath,
        },
      ],
    };
    console.log(requestConfig);
    const subResponse = await axios.request(requestConfig);
    console.log('sub response', subResponse.data);
    const sse = new EventSource(channelUrl, {
      headers: { Cookie: cookie },
    });
    const pokeResponse = await axios.request({
      url: channelUrl,
      method: 'PUT',
      headers,
      data: [
        {
          id: msgId + 2,
          action: 'poke',
          ship,
          app,
          mark,
          json: data,
        },
      ],
    });
    console.log('response', pokeResponse.data);
    return new Promise((resolve, reject) => {
      sse.addEventListener('message', (e) => {
        let event = JSON.parse(e.data);
        console.log('in quick poke listener', event);
        if (event.response === 'diff') {
          resolve(event);
          sse.close();
        } else {
          console.log(event);
          sse.close();
        }
      });
      sse.addEventListener('error', (e: any) => {
        console.log('An error occurred while attempting to connect.', e);
        reject(e);
        sse.close();
      });
    });
  }

  // static quickAction(app: string, data: any, mark?: string) {
  //   const msgId: number = ++this.counter;
  //   const response = await axios.request({
  //     url: this.channelUrl,
  //     method: 'PUT',
  //     headers: this.headers,
  //     signal: this.controller.signal,
  //     data: [
  //       {
  //         id: msgId,
  //         action: 'poke',
  //         ship: this.ship,
  //         app: app,
  //         mark,
  //         json: data,
  //       },
  //     ],
  //   });
  //   return { msgId, response };
  // }

  static async quickPoke(
    ship: string,
    url: string,
    cookie: string,
    app: string,
    mark: string,
    responsePath: string,
    data: any
  ) {
    const headers = {
      Cookie: cookie,
    };
    const msgId: number = 1;
    const channelUrl = `${url}/~/channel/${generateChannelId()}`;
    console.log({
      url: channelUrl,
      method: 'PUT',
      headers: headers,
      data: [
        {
          id: msgId,
          action: 'subscribe',
          ship: ship,
          app,
          path: responsePath,
        },
      ],
    });
    const response = await axios.request({
      url: channelUrl,
      method: 'PUT',
      headers,
      data: [
        {
          id: msgId,
          action: 'subscribe',
          ship,
          app,
          path: responsePath,
        },
      ],
    });
    console.log('sub response', response);
    const sse = new EventSource(channelUrl, {
      headers: { Cookie: cookie },
    });
    console.log(channelUrl, data);
    try {
      const response = await axios.request({
        url: channelUrl,
        method: 'PUT',
        headers,
        data: [
          {
            id: msgId + 1,
            action: 'poke',
            ship,
            app,
            mark,
            json: data,
          },
        ],
      });
      console.log('response', response);
      return new Promise((resolve, reject) => {
        sse.addEventListener('message', (e) => {
          let event = JSON.parse(e.data);
          console.log('in quick poke listener');
          if (event.response === 'diff') {
            resolve(event);
            sse.close();
          } else {
            console.log(event);
            sse.close();
          }
        });
        sse.addEventListener('error', (e: any) => {
          console.log('An error occurred while attempting to connect.', e);
          reject(e);
          sse.close();
        });
      });
    } catch (err: any) {
      // console.log(err);
      throw err;
    }
    // TODO
    // try {
    //   const response = await axios.request({
    //     url: `${url}/~/scry/${app}${path}.json`,
    //     headers: headers,
    //   });
    //   if (response.status === 200) {
    //     return { response: 'scry', json: { app, path, data: response.data } };
    //   }
    //   return { response: 'scry', json: null };
    // } catch (err) {
    //   console.log(err);
    //   throw err;
    // }
    return;
  }

  async unsubscribe(id: number) {
    return axios
      .request({
        url: this.channelUrl,
        method: 'PUT',
        headers: this.headers,
        signal: this.controller.signal,
        data: [
          {
            id: id,
            action: 'unsubscribe',
            subscription: id,
          },
        ],
      })
      .then(() => {
        this.wires.delete(id);
      });

    // ({
    //     id: this.getEventId(),
    //     action: 'unsubscribe',
    //     subscription,
    //   })
    //   .then(() => {
    //     this.outstandingSubscriptions.delete(subscription);
    //   });
  }

  async close() {
    this.isConnected = false;
    await Promise.all(
      Array.from(this.wires.keys()).map((id: number) => this.unsubscribe(id))
    );
    this.sse?.close();
    this.controller.abort(); // cancels all requests
    this.wires = new Map();
  }
}

// TODO REMOVE BELOW
// export class Conduit {
//   counter: number = 0; // ~lodlev-migdev - used to generate unique id values
//   sse: EventSource | null = null; // ~lodlev-migdev - sse (server-side-events) event source
//   url: string;
//   ship: string;
//   cookie: string;
//   channelUrl: string = '';
//   retryTimeout: any = 0;
//   private channels?: Map<string, any>;

//   constructor(url: string, ship: string, cookie: string) {
//     this.url = url;
//     this.ship = ship.substring(1);
//     this.cookie = cookie;
//   }

//   initialize = (app: string, path: string, onChannel: (data: any) => void) => {
//     this.channelUrl = `${this.url}/~/channel/${generateChannelId()}`;

//     this.shconn(app, path, onChannel).then(() => {
//       this.subscribe(app, path, onChannel)
//         .then(() => console.log(`subscribed to %${app} on ${path}`))
//         .catch((e: any) => console.error(e));
//     });
//   };

//   // ~lodlev-migdev - helper to ack a message received on the channel
//   ack = async (id: number) => {
//     return this.send([
//       {
//         id: ++this.counter,
//         action: 'ack',
//         'event-id': id,
//       },
//     ]);
//   };

//   // ~lodlev-migdev - connect to the ship (create a channel)
//   //      and open an event stream
//   shconn = async (app: string, path: string, onChannel: any) => {
//     return new Promise((resolve, reject) => {
//       this.send([
//         {
//           id: ++this.counter,
//           action: 'poke',
//           ship: this.ship,
//           app: 'hood',
//           mark: 'helm-hi',
//           json: 'opening airlock',
//         },
//       ])
//         .then((res) => {
//           this.stream(this.channelUrl, app, path, onChannel);
//           resolve(null);
//         })
//         .catch((err) => {
//           reject(err);
//         });
//     });
//   };

//   send = async (payload: any) => {
//     const response = await axios.request({
//       url: this.channelUrl,
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Cookie: this.cookie,
//       },
//       data: payload,
//     });
//     return response;
//   };

//   stream(
//     channelUrl: string,
//     app: string,
//     path: string,
//     onChannel: (data: any) => void
//   ) {
//     const sse = new EventSource(channelUrl, {
//       headers: { Cookie: this.cookie },
//     });

//     this.channels?.set(`${app}${path}`, sse);

//     sse.addEventListener('error', (e) => {
//       console.log('An error occurred while attempting to connect.');
//     });

//     sse.addEventListener('message', (e) => {
//       let jon = JSON.parse(e.data);

//       this.ack(jon.id)
//         // .then(() => console.log(`message ${jon.id} ack'd`))
//         .catch((e: any) => console.error(e));

//       if (jon.response === 'diff') {
//         onChannel(jon);
//       }

//       if (jon.response === 'quit') {
//         console.log(`received a quit. reconnecting to %${app} on ${path}...`);
//         this.reconnect(app, path, onChannel);
//       }
//     });

//     sse.addEventListener('open', (e) => {
//       console.log(`The connection has been established to %${app} on ${path}`);
//     });
//   }

//   reconnect = async (
//     app: string,
//     path: string,
//     onChannel: (data: any) => void
//   ) => {
//     if (this.retryTimeout !== 0) clearTimeout(this.retryTimeout);
//     this.subscribe(app, path, onChannel)
//       .then(() => console.log(`re-subscribed to %${app} on ${path}`))
//       .catch((e) => {
//         console.log(
//           `could not subscribe to %${app} on ${path}. retrying in 2 seconds...`
//         );
//         (function (watcher: Conduit, app: string, path: string) {
//           watcher.retryTimeout = setTimeout(() => {
//             watcher.reconnect(app, path, onChannel);
//           }, 2000);
//         })(this, app, path);
//       });
//   };

//   //
//   // ~lodlev-migdev
//   //    send subscribe action to the specified app/path
//   //     - handler will get called when messages are received on the
//   //       channel that match the agent wire path
//   //
//   subscribe = async (
//     app: string,
//     path: string,
//     onChannel: (data: any) => void
//   ) => {
//     return new Promise((resolve, reject) => {
//       const payload = [
//         {
//           id: ++this.counter,
//           action: 'subscribe',
//           ship: this.ship,
//           app: app,
//           path: path,
//         },
//       ];
//       this.send(payload)
//         .then((res: any) => {
//           if (res.response === 'diff') {
//             onChannel(res.json);
//           }
//           resolve(null);
//         })
//         .catch(reject);
//     });
//   };
//   unsubscribe(app: string, path: string) {
//     // console.log(`Connection to channel ${this.channelUrl}`);
//     this.channels?.get(`${app}${path}`).close();
//     // this.sse?.close();
//     // this.send({
//     //   id: this.channelUrl,
//     //   action: "unsubscribe",
//     //   subscription: this.counter,
//     // });
//   }
// }

// export const Watcher = new BaseWatcher();
