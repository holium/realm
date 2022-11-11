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
  UnsubscribeParams,
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
  private code: string | undefined = undefined;
  private sse: EventSource | undefined;

  constructor() {
    super();
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.handleError = this.handleError.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.reconnectToChannel = this.reconnectToChannel.bind(this);
    this.startSSE = this.startSSE.bind(this);
    // Add a response interceptor
    axios.interceptors.response.use(undefined, this.handleError);
  }

  generateUID() {
    return `${Math.floor(Date.now() / 1000)}-realm`;
  }

  /**
   * Global error handler for axios errors. For now , hook 403 responses and use
   *  to indicate that cookie has expired (stale connection).
   *
   * @param err
   * @returns
   */
  async handleError(err: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (err.status === 403 || err.response?.status === 403) {
        // if (!this.code) {
        //   console.log(
        //     'warn: http request 403 error. unable to refresh token due to missing code'
        //   );
        //   reject(err);
        //   return;
        // }
        // if (err.response) {
        //   // The request was made and the server responded with a status code
        //   // that falls out of the range of 2xx
        //   console.log(err.response.data);
        //   console.log(err.response.status);
        //   console.log(err.response.headers);
        // } else if (err.request) {
        //   // The request was made but no response was received
        //   // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        //   // http.ClientRequest in node.js
        //   console.log(err.request);
        // } else {
        //   // Something happened in setting up the request that triggered an Error
        //   console.log('Error', err.message);
        // }
        // console.log(err.config);
        console.log(
          '403 [stale connection] refreshing cookie => %o',
          this.code
        );
        let cookie: string | undefined = undefined;
        try {
          cookie = await Conduit.fetchCookie(this.url, this.code!);
          // console.log(cookie);
          if (cookie) {
            this.cookie = cookie;
            this.updateStatus(ConduitState.Refreshed, {
              url: this.url,
              ship: `~${this.ship}`,
              cookie: this.cookie,
              code: this.code,
            });
            if (err.originator === 'sse') {
              await this.init(this.url, this.ship!, this.cookie, this.code);
              resolve(undefined);
              return;
            }
            err.config.headers['Cookie'] = cookie;
            const result = await axios(err.config);
            resolve(result);
            return;
          }
          console.log('error: could not refresh token');
          reject(undefined);
          return;
        } catch (e) {
          console.log(e);
          reject(e);
          return;
        }
      }
      reject(err);
      return;
      // Promise.reject(err);
    });
  }

  updateStatus(status: ConduitState, ...args: any[]) {
    this.status = status;
    this.emit(status, ...args);
  }

  /**
   *
   * @param ship i.e. lomder-librun without the ~
   * @returns
   */
  async init(
    url: string,
    ship: Patp,
    cookie: string,
    code: string | undefined = undefined
  ): Promise<void> {
    this.url = url;
    this.ship = ship;
    this.cookie = cookie;
    this.code = code;
    this.uid = this.generateUID();
    await this.startSSE(this.channelUrl(this.uid));
  }

  /**
   * Refresh the underlying conduit cookie that's used for all interactions
   *   with the ship.
   * @param url ship root url (e.g. http://localhost:80)
   * @returns
   */
  async refresh(url: string, code: string): Promise<string | undefined> {
    this.url = url;
    const cookie: string | undefined = await Conduit.fetchCookie(url, code);
    if (cookie === undefined) {
      // console.log('Conduit.fetchCookie call failed with args => %o', {
      //   url,
      //   code,
      // });
      return undefined;
    }
    this.cookie = cookie;
    return this.cookie;
  }

  async startSSE(channelUrl: string): Promise<void> {
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
      // console.log(channelUrl);

      // console.log(`EventSource => ['${channelUrl}', '${this.cookie}']`);
      this.sse = new EventSource(channelUrl, {
        headers: { Cookie: this.cookie },
      });
      // this.sse = new EventSource(channelUrl);

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
        if (this.status !== ConduitState.Connected) {
          this.updateStatus(ConduitState.Connected);
        }
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
            } else {
              const watchHandler = this.watches.get(eventId);
              if (watchHandler) {
                watchHandler.onSubscribed!(eventId);
              }
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
        // @ts-ignore
        if (error.status === 403) {
          // @ts-ignore
          error.originator = 'sse';
          this.handleError(error);
        }
        // @ts-ignore
        if (error.status === '404') {
          return;
        }
        // @ts-ignore
        if (error.status >= 500) {
          // @ts-ignore
          this.updateStatus(ConduitState.Failed);
          this.failGracefully();
        }
        // @ts-ignore
        if (!error.status) {
          // this happens when the ship is offline
          this.updateStatus(ConduitState.Failed);
          this.disconnectGracefully();
        }
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
      onSubscribed: (_id) => {},
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
   * watch
   *
   * @param params
   */
  async unsubscribe(subscription: number) {
    const message: Message = {
      id: this.nextMsgId,
      action: Action.Unsubscribe,
      subscription: subscription,
    };
    this.postToChannel(message).then(() => {
      this.watches.delete(subscription);
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
    } catch (err: any) {
      console.log('scry error', app, path, err.response.status);
      // console.log(err);
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

  private channelUrl(uuid: string): string {
    return `${this.url}/~/channel/${uuid}`;
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
    // if (this.reconnectTimeout !== 0) clearTimeout(this.reconnectTimeout);
    // this.uid = this.generateUID();
    const channelId = this.channelUrl(this.uid);
    await this.startSSE(channelId)
      .then(() => {
        console.log(`reconnected to channel ${channelId}`);
      })
      .catch((err) => {
        console.log('reconnectToChannel err', err);
        // (function (conduit: Conduit) {
        //   conduit.reconnectTimeout = setTimeout(() => {
        //     conduit.startSSE();
        //   }, 2000);
        // })(this);
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
      const response = await axios.put(this.channelUrl(this.uid), [body], {
        headers: this.headers,
        signal: this.abort.signal,
      });
      if (response.status > 300 && response.status < 200) {
        // console.log('postToChannel poke failed');
        throw new Error('Poke failed');
      }
      if (this.status !== ConduitState.Initialized) {
        // console.log('postToChannel starting');
        await this.startSSE(this.channelUrl(this.uid));
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

  cleanup() {
    this.prevMsgId = 0;
    this.pokes = new Map();
    this.watches = new Map();
    this.reactions = new Map();
    this.abort.abort();

    this.abort = new AbortController();
    this.sse?.close();
    this.sse = undefined;
  }

  failGracefully() {
    this.cleanup();
    this.updateStatus(ConduitState.Failed);
  }

  disconnectGracefully() {
    this.cleanup();
    this.updateStatus(ConduitState.Disconnected);
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
      const response = await axios.request({
        url: `${url}/~/login`,
        method: 'post',
        data: `password=${code}`,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      cookie = response.headers['set-cookie']![0];
    } catch (err: any) {
      console.log(err);
    }
    return cookie;
  }
}

export { ConduitState };
