import { generateChannelId } from './ship/util';
import axios from 'axios';
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

export class Conduit {
  counter: number = 0; // ~lodlev-migdev - used to generate unique id values
  sse: EventSource | null = null; // ~lodlev-migdev - sse (server-side-events) event source
  url: string;
  ship: string;
  cookie: string;
  channelUrl: string = '';
  retryTimeout: any = 0;

  constructor(url: string, ship: string, cookie: string) {
    this.url = url;
    this.ship = ship.substring(1);
    this.cookie = cookie;
  }

  initialize = (app: string, path: string, onChannel: (data: any) => void) => {
    this.channelUrl = `${this.url}/~/channel/${generateChannelId()}`;

    this.shconn(app, path, onChannel).then(() => {
      this.subscribe(app, path, onChannel)
        .then(() => console.log(`subscribed to %${app} on ${path}`))
        .catch((e: any) => console.error(e));
    });
  };

  // ~lodlev-migdev - helper to ack a message received on the channel
  ack = async (id: number) => {
    return this.send([
      {
        id: ++this.counter,
        action: 'ack',
        'event-id': id,
      },
    ]);
  };

  // ~lodlev-migdev - connect to the ship (create a channel)
  //      and open an event stream
  shconn = async (app: string, path: string, onChannel: any) => {
    return new Promise((resolve, reject) => {
      this.send([
        {
          id: ++this.counter,
          action: 'poke',
          ship: this.ship,
          app: 'hood',
          mark: 'helm-hi',
          json: 'opening airlock',
        },
      ])
        .then((res) => {
          this.stream(this.channelUrl, app, path, onChannel);
          resolve(null);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  send = async (payload: any) => {
    const response = await axios.request({
      url: this.channelUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.cookie,
      },
      data: payload,
    });
    return response;
  };

  stream(
    channelUrl: string,
    app: string,
    path: string,
    onChannel: (data: any) => void
  ) {
    this.sse = new EventSource(channelUrl, {
      headers: { Cookie: this.cookie },
    });

    this.sse.addEventListener('error', (e) => {
      console.log('An error occurred while attempting to connect.');
    });

    this.sse.addEventListener('message', (e) => {
      let jon = JSON.parse(e.data);

      this.ack(jon.id)
        // .then(() => console.log(`message ${jon.id} ack'd`))
        .catch((e: any) => console.error(e));

      if (jon.response === 'diff') {
        onChannel(jon);
      }

      if (jon.response === 'quit') {
        console.log(`received a quit. reconnecting to %${app} on ${path}...`);
        this.reconnect(app, path, onChannel);
      }
    });

    this.sse.addEventListener('open', (e) => {
      console.log(`The connection has been established to %${app} on ${path}`);
    });
  }

  reconnect = async (
    app: string,
    path: string,
    onChannel: (data: any) => void
  ) => {
    if (this.retryTimeout !== 0) clearTimeout(this.retryTimeout);
    this.subscribe(app, path, onChannel)
      .then(() => console.log(`re-subscribed to %${app} on ${path}`))
      .catch((e) => {
        console.log(
          `could not subscribe to %${app} on ${path}. retrying in 2 seconds...`
        );
        (function (watcher: Conduit, app: string, path: string) {
          watcher.retryTimeout = setTimeout(() => {
            watcher.reconnect(app, path, onChannel);
          }, 2000);
        })(this, app, path);
      });
  };

  //
  // ~lodlev-migdev
  //    send subscribe action to the specified app/path
  //     - handler will get called when messages are received on the
  //       channel that match the agent wire path
  //
  subscribe = async (
    app: string,
    path: string,
    onChannel: (data: any) => void
  ) => {
    return new Promise((resolve, reject) => {
      const payload = [
        {
          id: ++this.counter,
          action: 'subscribe',
          ship: this.ship,
          app: app,
          path: path,
        },
      ];
      this.send(payload)
        .then((res: any) => {
          if (res.response === 'diff') {
            onChannel(res.json);
          }
          resolve(null);
        })
        .catch(reject);
    });
  };
  unsubscribe() {
    // console.log(`Connection to channel ${this.channelUrl}`);
    this.sse?.close();
    // this.send({
    //   id: this.channelUrl,
    //   action: "unsubscribe",
    //   subscription: this.counter,
    // });
  }
}

// export const Watcher = new BaseWatcher();
