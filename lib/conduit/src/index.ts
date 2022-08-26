import EventEmitter, { setMaxListeners } from 'events';
import EventSource from 'eventsource';
import axios from 'axios';
import {
  Actions,
  Patp,
  PokeCallbacks,
  PokeParams,
  ReactionPath,
  Scry,
  SubscribeCallbacks,
  SubscribeParams,
} from './types';

// For now, set it to 20
setMaxListeners(20);

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
  watches: Map<number, SubscribeCallbacks>;
  reactions: Map<ReactionPath, (data: any, mark: string) => void>;
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
    this.reactions = new Map();
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
    return new Promise(async (resolve, reject) => {
      if (this.sse) {
        console.warn('sse already exists. Only one per session.');
        return;
      }

      await this.poke({
        app: 'hood',
        mark: 'helm-hi',
        json: 'Opening API channel',
      });

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
          case 'poke':
            if (this.pokes.has(eventId)) {
              const handler = this.pokes.get(eventId);
              if (parsedData.ok && handler) {
                handler.onSuccess!(eventId);
              } else if (parsedData.err && handler) {
                handler.onError!(eventId);
              } else {
                console.error(new Error('poke sse error'));
              }
              this.pokes.delete(eventId);
            }
            break;
          //
          case 'subscribe':
            if (parsedData.err) {
              if (this.pokes.has(eventId)) {
                const handler = this.pokes.get(eventId);
                handler && handler.onError!(parsedData.err);
              }
              console.error('watch err', parsedData.err);
              this.watches.delete(eventId);
            }
            break;
          //
          case 'diff':
            const json = parsedData.json;
            const mark = parsedData.mark;
            if (this.watches.has(eventId)) {
              this.watches.get(eventId)!.onEvent!(json, eventId, mark);
            }
            const reaction = Object.keys(json)[0];
            const maybeReactionPath = `${mark}.${reaction}`;
            if (this.reactions.has(maybeReactionPath)) {
              this.reactions.get(maybeReactionPath)!(parsedData.json, mark);
              this.reactions.delete(maybeReactionPath);
            }
            break;
          // quit
          case 'quit':
            console.log('on quit');
            if (this.watches.has(eventId)) {
              this.watches.get(eventId)!.onQuit!(parsedData);
              this.watches.delete(eventId);
            }
            break;
          //
          default:
            console.log('unrecognized', parsedData);
            // other
            break;
        }
      };
    });
  }

  /**
   * poke
   *
   * @param params
   */
  async poke(
    params: PokeParams & PokeCallbacks
  ): Promise<number | any | undefined> {
    const handlers: PokeCallbacks = {
      onSuccess: (_id) => {},
      onError: (_err) => {},
      ...params,
    };
    const message = {
      id: this.nextMsgId(),
      action: 'poke',
      ship: this.ship,
      reaction: params.reaction,
      app: params.app,
      mark: params.mark,
      json: params.json,
    };
    this.pokes.set(message.id, handlers);
    if (params.reaction && params.onReaction) {
      this.reactions.set(params.reaction, params.onReaction);
    }
    this.postToChannel(message).then((msgId) => {
      return msgId;
    });
  }

  /**
   * watch
   *
   * @param params
   */
  async watch(params: SubscribeParams & SubscribeCallbacks) {
    const handlers: SubscribeCallbacks = {
      onEvent: (_data) => {},
      onQuit: (_id) => {},
      onError: (_err) => {},
      ...params,
    };
    const message = {
      id: this.nextMsgId(),
      action: 'subscribe',
      ship: this.ship,
      app: params.app,
      path: params.path,
    };
    this.watches.set(message.id, handlers);
    this.postToChannel(message).then((msgId) => {
      return msgId;
    });
  }

  /**
   * scry
   *
   * @param params
   * @returns
   */
  async scry(params: Scry): Promise<any> {
    const { app, path } = params;
    try {
      const response = await axios.get(
        `${this.url}/~/scry/${app}${path}.json`,
        {
          headers: this.headers,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }
  /**************************************************************/
  /******************** Internal functions **********************/
  /**************************************************************/

  /**
   * ack
   *
   * @param eventId
   * @returns
   */
  private async ack(eventId: number): Promise<number | void> {
    const message = {
      action: 'ack',
      'event-id': eventId,
    };
    await this.postToChannel(message);
    return eventId;
  }

  /**
   * postToChannel
   *
   * @param body
   * @returns
   */
  private async postToChannel(body: any) {
    // console.log(body);
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

  /**
   * closeChannel
   *
   * @returns
   */
  async closeChannel(): Promise<void> {
    // Lets go ahead and cleanup all the unacked pokes we have
    await Promise.all(
      Array.from(this.pokes.keys()).map((msgId: number) => {
        this.ack(msgId);
        this.pokes.delete(msgId);
        console.log('unacked', msgId);
      })
    );
    // Go through all subscriptions and unsubscribe before deleting channel
    await Promise.all(
      Array.from(this.watches.keys()).map((watchId: number) =>
        this.postToChannel({
          id: this.nextMsgId(),
          action: 'unsubscribe',
          subscription: watchId,
        })
      )
    );
    const deleteMessage = {
      id: this.nextMsgId(),
      action: 'delete',
    };

    const res = await this.postToChannel(deleteMessage);
    this.watches = new Map();
    this.pokes = new Map();
    this.reactions = new Map();
    this.sse?.close();
    return res;
  }
}
