import EventEmitter, { setMaxListeners } from 'events';
import EventSource from 'eventsource';
import axios, { AxiosError } from 'axios';
import { Patp } from 'os/types';

const ActionType = {
  poke: 0,
  watch: 1,
  diff: 2,
  quit: 3,
};

type Actions = 'poke' | 'watch' | 'diff' | 'quit';

/**
 * Conduit
 *
 * SSE library for interfacing with Urbit
 */
export class Conduit extends EventEmitter {
  private url: string = '';
  private prevMsgId: number = 0;
  private sse: EventSource | undefined;
  cookie: string;
  ship?: string | null;
  desk: 'realm' | string;
  pokes: Map<number, PokeCallbacks>;
  watches: Map<number, any>;
  private abort = new AbortController();
  private uid: string = `${Math.floor(Date.now() / 1000)}-realm`;

  constructor(url: string, ship: string, cookie: string, desk: string) {
    super();
    this.url = url;
    this.ship = ship;
    this.cookie = cookie;
    this.desk = desk;
    this.pokes = new Map();
    this.watches = new Map();
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };
  }

  private get channelUrl(): string {
    return `${this.url}/~/channel/${this.uid}`;
  }

  nextMsgId() {
    let next = this.prevMsgId + 1;
    this.prevMsgId = next;
    return next;
  }

  static async fetchCookie(
    url: string,
    code: Patp
  ): Promise<string | undefined> {
    let cookie;
    try {
      const response = await axios.put(`${url}/~/login`, {
        method: 'put',
        body: `password=${code}`,
        credentials: 'include',
      });
      cookie = response.headers['set-cookie']![0];
    } catch (err: any) {
      console.error(err);
    } finally {
      return cookie;
    }
  }

  async init(): Promise<void> {
    if (this.sse) {
      // TODO cleanup here
      if (this.channelUrl)
        // this.removeAllListeners();
        console.log('sse already exists. Only one per session.');
      this.sse = undefined;
    }
    await this.poke({
      app: 'hood',
      mark: 'helm-hi',
      json: 'Opening API channel',
    });
    console.log(this.channelUrl);

    return new Promise((resolve, reject) => {
      this.sse = new EventSource(this.channelUrl, {
        headers: { Cookie: this.cookie },
      });

      this.sse.onopen = async (response) => {
        if (response.type === 'open') {
          resolve();
        } else {
          reject(new Error('failed to open sse'));
        }
      };

      this.sse.onmessage = async (event: MessageEvent) => {
        const parsedData = JSON.parse(event.data);
        const eventId = parseInt(parsedData.id, 10);
        this.ack(eventId);
        const type = parsedData.response as Actions;
        switch (type) {
          // poke
          case 'poke':
            console.log('pokes handle', this.pokes);
            if (this.pokes.has(eventId)) {
              const handler = this.pokes.get(eventId);
              console.log(event);
              if (parsedData.ok && handler) {
                handler.onSuccess!(eventId);
              } else if (parsedData.err) {
                // error()
              } else {
                // console.error()
              }
              this.pokes.delete(eventId);
            }
            break;
          // watch
          case 'watch':
            console.log('watch handle');
            if (parsedData.err) {
              console.error('watch err', parsedData.err);
              this.watches.delete(eventId);
            }
            break;
          // diff
          case 'diff':
            console.log('diff handle');
            if (parsedData.err) {
              console.error('watch err', parsedData.err);
              this.watches.delete(eventId);
            }
            break;
          // quit
          case 'quit':
            console.log('quit handle');
            break;
          default:
            console.log('unrecognized', parsedData);
            // other
            break;
        }
      };
    });
  }

  private async ack(eventId: number): Promise<number | void> {
    // this.lastAcknowledgedEventId = eventId;
    const message = {
      action: 'ack',
      'event-id': eventId,
    };
    await this.postToChannel(message);
    return eventId;
  }

  async poke(params: Poke & PokeCallbacks): Promise<number | any | undefined> {
    const handlers: PokeCallbacks = {
      onResponse: (data) => {
        console.log('poke responding', data);
      },
      onSuccess: (id) => {
        console.log('poke success', id);
      },
      onError: (err) => {
        console.error('poke error', err);
      },
      ...params,
    };
    const message = {
      id: this.nextMsgId(),
      action: 'poke',
      ship: this.ship,
      app: params.app,
      mark: params.mark,
      json: params.json,
    };
    this.postToChannel(message).then((msgId) => {
      this.pokes.set(msgId, handlers);
    });
    // try {
    //   const response = await axios.put(this.channelUrl, [body], {
    //     headers: this.headers,
    //     signal: this.abort.signal,
    //   });
    //   if (response.statusText !== 'ok') {
    //     throw new Error('Poke failed');
    //   }
    // } catch (e) {
    //   console.log('poke failed');
    // }
    // return body.id;
  }

  async postToChannel(body: any) {
    try {
      const response = await axios.put(this.channelUrl, [body], {
        headers: this.headers,
        signal: this.abort.signal,
      });
      if (response.statusText !== 'ok') {
        throw new Error('Poke failed');
      }
    } catch (e) {
      console.log('poke failed');
    }
    return body.id;
  }

  watch() {}

  async scry(params: Scry): Promise<any> {
    const { app, path } = params;
    return await axios.get(`${this.url}/~/scry/${app}${path}.json`);
  }

  closeChannel() {
    this.postToChannel({ id: this.nextMsgId(), action: 'delete' })
      .then((res) => console.log('deleting connection'))
      .catch((err) => console.error('error deleting channel'));
  }
}

type Poke = {
  ship?: string; // lomder-librun
  app: string; // passports
  mark: string; // visa-action
  json: any; // { "data": "something" }
};

type PokeCallbacks = {
  onSuccess?: (id: number) => void;
  onResponse?: (data: any) => void;
  onError?: (e: any) => void;
};

type Scry = {
  app: string; // passports
  path: string; // /<path>/members
};
