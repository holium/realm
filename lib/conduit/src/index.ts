import EventEmitter, { setMaxListeners } from 'events';
import EventSource from 'eventsource';
import axios, { AxiosError } from 'axios';
import {
  Action,
  ConduitState,
  Message,
  Patp,
  PokeCallbacks,
  PokeParams,
  ReactionPath,
  Responses,
  Scry,
  SubscribeCallbacks,
  SubscribeParams,
  Thread,
} from './types';

// For now, set it to 20
setMaxListeners(20);

/**
 * Conduit
 *
 * SSE library for interfacing with Urbit.
 */
export class Conduit extends EventEmitter {
  private url: string = '';
  private prevMsgId: number = 0;
  private lastAckId: number = 0;
  cookie!: string;
  ship!: string | null;
  pokes: Map<number, PokeParams & PokeCallbacks>;
  watches: Map<number, SubscribeParams & SubscribeCallbacks>;
  reactions: Map<ReactionPath, (data: any, mark: string) => void>;
  retryTimeout: any = 0;
  reconnectTimeout: any = 0;
  status: ConduitState = ConduitState.Disconnected;
  private abort = new AbortController();
  private uid: string = this.generateUID();
  private sse: EventSource | undefined;

  constructor() {
    super();
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
  }

  generateUID() {
    return `${Math.floor(Date.now() / 1000)}-realm`;
  }

  updateStatus(status: ConduitState) {
    this.status = status;
    this.emit(status);
  }

  /**
   *
   * @param ship i.e. lomder-librun without the ~
   * @returns
   */
  async init(url: string, ship: Patp, cookie: string): Promise<void> {
    this.url = url;
    this.ship = ship;
    this.cookie = cookie;
    this.uid = this.generateUID();
    // console.log(this.channelUrl)

    await this.startSSE();

    // console.log(`opening channel ${this.channelUrl}`);
  }

  async startSSE(): Promise<void> {
    if (this.status === ConduitState.Connected) {
      return Promise.resolve();
    }
    if (this.prevMsgId === 0) {
      await this.poke({
        app: 'hood',
        mark: 'helm-hi',
        json: 'Opening Realm API channel',
      });
      return;
    }

    this.updateStatus(ConduitState.Initialized);

    return new Promise(async (resolve, reject) => {
      // console.log(this.channelUrl);

      this.sse = new EventSource(this.channelUrl, {
        headers: { Cookie: this.cookie },
      });

      this.sse.onopen = async (response) => {
        if (response.type === 'open') {
          this.updateStatus(ConduitState.Connected);
          resolve();
        } else {
          this.updateStatus(ConduitState.Failed);
          reject(new Error('failed to open sse'));
        }
      };

      this.sse.onmessage = async (event: MessageEvent) => {
        const parsedData = JSON.parse(event.data);
        const eventId = parseInt(parsedData.id, 10);
        const type = parsedData.response as Responses;
        const lastEventId = parseInt(event.lastEventId, 10);
        if (lastEventId - this.lastAckId > 20) {
          this.ack(lastEventId);
        }
        switch (type) {
          case 'poke':
            if (this.pokes.has(eventId)) {
              const handler = this.pokes.get(eventId);
              if (parsedData.ok && handler) {
                // @ts-ignore
                handler.onSuccess();
              } else if (parsedData.err && handler) {
                // @ts-ignore
                handler.onError!(parsedData.err);
              } else {
                console.error(new Error('poke sse error'));
              }
            }
            this.pokes.delete(eventId);
            break;
          //
          case 'subscribe':
            if (parsedData.err) {
              const watchHandler = this.watches.get(eventId);
              if (watchHandler) {
                watchHandler.onError!(eventId, parsedData.err);
              } else {
                console.error(new Error('watch sse error'));
              }
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
            /*console.log('maybe => %o', {
              maybeReactionPath,
              reactions: this.reactions,
              json: parsedData.json,
            });*/
            if (this.reactions.has(maybeReactionPath)) {
              this.reactions.get(maybeReactionPath)!(parsedData.json, mark);
              this.reactions.delete(maybeReactionPath);
            }
            break;
          // quit
          case 'quit':
            console.log('on quit', eventId);
            if (this.watches.has(eventId)) {
              const reconnectSub = this.watches.get(eventId);
              reconnectSub!.onQuit!(parsedData);
            }
            break;
          //
          default:
            console.log('unrecognized', parsedData);
            // other
            break;
        }
      };
      this.sse.onerror = async (error) => {
        console.log('sse error', error);
        this.updateStatus(ConduitState.Disconnected);
        await this.closeChannel();
        this.reconnectToChannel();
      };
      this.sse.addEventListener('close', () => {
        console.log('e');
        throw new Error('Ship unexpectedly closed the connection');
      });
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
    const handlers: PokeParams & PokeCallbacks = {
      onSuccess: (_id) => {},
      onError: (_id, _err) => {},
      ...params,
    };
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Poke,
      ship: this.ship!,
      app: params.app,
      mark: params.mark,
      json: params.json,
    };
    if (params.reaction && params.onReaction) {
      this.reactions.set(params.reaction, params.onReaction);
    }
    console.log(params)
    // Properly waiting
    const [_req, res] = await Promise.all([
      this.postToChannel(message),
      new Promise((resolve, reject) => {
        this.pokes.set(message.id, {
          onSuccess: () => {
            handlers.onSuccess!(message.id);
            resolve(message.id);
          },
          onError: (err) => {
            handlers.onError!(message.id, err);
            reject(err);
          },
          ...params,
        });
      }),
    ]);
    return res;
  }

  /**
   * watch
   *
   * @param params
   */
  async watch(params: SubscribeParams & SubscribeCallbacks) {
    const handlers: SubscribeParams & SubscribeCallbacks = {
      onEvent: (_data) => {},
      onQuit: (_id) => {},
      onError: (_id, _err) => {},
      ...params,
    };
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Subscribe,
      ship: this.ship!,
      app: params.app,
      path: params.path,
    };
    this.watches.set(message.id, handlers);
    this.postToChannel(message).then(() => {
      return message.id;
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

  /**
   * thread
   *
   * @param params
   * @returns
   */
  async thread(params: Thread<Action>): Promise<any> {
    const { inputMark, outputMark, threadName, body, desk } = params;

    try {
      const response = await axios.post(
        `${this.url}/spider/${desk}/${inputMark}/${threadName}/${outputMark}.json`,
        {
          headers: this.headers,
          body,
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * ack
   *
   * @param eventId
   * @returns
   */
  private async ack(eventId: number): Promise<number | void> {
    this.lastAckId = eventId;
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Ack,
      'event-id': eventId,
    };
    await this.postToChannel(message);
    return eventId;
  }

  /**************************************************************/
  /************************** Getters ***************************/
  /**************************************************************/
  private get headers() {
    return {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };
  }

  private get channelUrl(): string {
    return `${this.url}/~/channel/${this.uid}`;
  }

  private get nextMsgId() {
    let next = this.prevMsgId + 1;
    this.prevMsgId = next;
    return next;
  }

  /**************************************************************/
  /******************** Internal functions **********************/
  /**************************************************************/

  // TODO perhaps store a map for resubscribing
  private async resubscribe(
    eventId: number,
    params: SubscribeParams & SubscribeCallbacks
  ) {
    this.watches.delete(eventId);
    console.log(`attempting re-subscribed to ${params?.app}${params?.path}`);
    if (this.retryTimeout !== 0) clearTimeout(this.retryTimeout);
    this.watch(params!)
      .then(() => console.log(`re-subscribed to ${params?.app}${params?.path}`))
      .catch((e) => {
        this.retryTimeout = setTimeout(() => {
          this.resubscribe(eventId, params);
        }, 2000);
      });
  }

  /**
   * TODO add a limit here
   */
  private async reconnectToChannel() {
    if (this.reconnectTimeout !== 0) clearTimeout(this.reconnectTimeout);

    this.startSSE()
      .then(() => console.log(`reconnected to channel ${this.channelUrl}`))
      .catch(() => {
        (function (conduit: Conduit) {
          conduit.reconnectTimeout = setTimeout(() => {
            conduit.startSSE();
          }, 2000);
        })(this);
      });
  }

  /**
   * postToChannel
   *
   * @param body
   * @returns
   */
  private async postToChannel(body: Message): Promise<void> {
    try {
      const response = await axios.put(this.channelUrl, [body], {
        headers: this.headers,
        signal: this.abort.signal,
      });
      if (response.status > 300 && response.status < 200) {
        throw new Error('Poke failed');
      }
      if (this.status !== ConduitState.Initialized) {
        await this.startSSE();
      }
    } catch (e: any) {
      // console.log('poke failed', e);
      const err = e as AxiosError;
      if (err.code === 'ECONNREFUSED') {
        // if we cannot connect to the ship, cleanup
        this.failGracefully();
      }
    }
  }

  failGracefully() {
    this.prevMsgId = 0;
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.abort = new AbortController();
    this.sse?.close();
    this.sse = undefined;
    this.updateStatus(ConduitState.Failed);
  }

  /**
   * closeChannel
   *
   * @returns
   */
  async closeChannel(): Promise<void> {
    const res = await this.postToChannel({
      id: this.nextMsgId,
      action: Action.Delete,
    });

    // Reset to 0
    this.prevMsgId = 0;
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.abort.abort();
    this.abort = new AbortController();
    this.sse?.close();
    this.sse = undefined;
    this.updateStatus(ConduitState.Disconnected);
    return res;
  }

  /**
   * fetchCookie
   *
   * Should be used when not connected to a channel to retrieve a cookie
   *
   * @param url
   * @param code
   * @returns
   */
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
}

export { ConduitState };
