import Urbit from '@urbit/http-api';
import memoize from 'lodash/memoize';

import { isDev, log } from '../utils';
import {
  DefinitionSchema,
  RelatedSchema,
  SentenceSchema,
  WordSchema,
} from './types';
import { PeerParm, PeerParms, Schema } from './types/bedrock';
import { changesHandler } from './updates';

const api = {
  createApi: memoize(() => {
    const urb = isDev()
      ? new Urbit(import.meta.env.VITE_SHIP_URL, import.meta.env.VITE_SHIP_CODE)
      : new Urbit('');
    urb.ship = isDev() ? import.meta.env.VITE_SHIP_NAME : window.ship;
    // Just log errors if we get any
    urb.onError = (message: string) => log('onError: ', message);
    urb.onOpen = () => log('urbit onOpen');
    urb.onRetry = () => log('urbit onRetry');
    //sub to our frontend updates
    urb.connect();

    return urb;
  }),
  getSpaces: async () => {
    return await api.createApi().scry({ app: 'spaces', path: '/all' });
  },

  getState: async () => {
    return api.createApi().scry({ app: 'db', path: '/db' });
  },

  getPath: async (path: string) => {
    return api.createApi().scry({ app: 'db', path: '/db/path' + path });
  },
  getAfter: async (start: number) => {
    return api.createApi().scry({ app: 'db', path: `/db/start-ms/${start}` });
  },
  createPath: async (path: string, peers: PeerParms) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        'create-path': {
          path: path,
          peers: peers,
        },
      },
    });
  },
  createPathFromSpace: async (
    path: string,
    spaceHost: string,
    spaceName: string,
    spaceRole: string
  ) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        'create-from-space': {
          path: path,
          'space-path': {
            ship: spaceHost,
            space: spaceName,
          },
          sr: spaceRole,
        },
      },
    });
  },
  removePath: async (path: string) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: { 'remove-path': path },
    });
  },
  addPeer: async (path: string, peer: PeerParm) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        'add-peer': {
          path: path,
          ship: peer.ship,
          role: peer.role,
        },
      },
    });
  },
  kickPeer: async (path: string, ship: string) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        'kick-peer': {
          path: path,
          ship: ship,
        },
      },
    });
  },
  create: async (
    path: string,
    type: string,
    version: number,
    data: any,
    schema: Schema
  ) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        create: {
          path: path,
          type: type,
          v: version,
          data: data,
          schema: schema,
        },
      },
    });
  },
  edit: async (
    rowID: string,
    path: string,
    type: string,
    version: number,
    data: any,
    schema: Schema
  ) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        edit: {
          id: rowID,
          'input-row': {
            path: path,
            type: type,
            v: version,
            data: data,
            schema: schema,
          },
        },
      },
    });
  },
  remove: async (rowID: string, path: string, type: string) => {
    return api.createApi().poke({
      app: 'db',
      mark: 'db-action',
      json: {
        remove: {
          id: rowID,
          path: path,
          type: type,
        },
      },
    });
  },
  runThread: async (
    path: string,
    type: string,
    version: number,
    data: any,
    schema: Schema
  ) => {
    const json = {
      create: {
        path: path,
        type: type,
        v: version,
        data: data,
        schema: schema,
      },
    };
    return api.createApi().thread({
      inputMark: 'db-action',
      outputMark: 'db-vent',
      threadName: 'venter',
      body: json,
      desk: 'realm',
    });
  },
  subscribeDB: async (): Promise<number> => {
    return api.createApi().subscribe({
      app: 'db',
      path: '/db',
      event: changesHandler,
      err: () => console.log('Subscription rejected.'),
      quit: () => console.log('Kicked from subscription.'),
    });
  },
  subscribePath: async (path: string): Promise<number> => {
    return api.createApi().subscribe({
      app: 'db',
      path: `/path${path}`,
      event: changesHandler,
      err: () => console.log('Subscription rejected.'),
      quit: () => console.log('Kicked from subscription.'),
    });
  },
  unsubscribe: async (subNumber: number) => {
    return api.createApi().unsubscribe(subNumber);
  },

  // Lexicon-specific
  //
  createWord: async (path: string, word: string) => {
    const data = [word, {}];

    return api.runThread(path, 'lexicon-word', 0, data, WordSchema);
  },
  editWord: async (path: string, wordID: string, word: string) => {
    const data = [word, {}];
    return await api.edit(wordID, path, 'lexicon-word', 0, data, WordSchema);
  },
  removeWord: async (path: string, wordID: string) => {
    return await api.remove(wordID, path, 'lexicon-word');
  },
  createDefinition: async (
    path: string,
    wordID: string,
    definition: string
  ) => {
    const data = [definition, wordID, {}];
    return await api.create(
      path,
      'lexicon-definition',
      0,
      data,
      DefinitionSchema
    );
  },
  createSentence: async (path: string, wordID: string, sentence: string) => {
    const data = [sentence, wordID, {}];
    return await api.create(path, 'lexicon-sentence', 0, data, SentenceSchema);
  },
  createRelated: async (path: string, wordID: string, related: string) => {
    const data = [related, wordID, {}];
    return await api.create(path, 'lexicon-related', 0, data, RelatedSchema);
  },
  voteOnWord: async (
    path: string,
    wordID: string,
    voteId: string,
    vote: boolean | null,
    ship: string
  ) => {
    if (vote === null) {
      return await api.remove(voteId, path, 'vote');
    } else {
      // Example vote
      const data = {
        up: vote,
        ship,
        'parent-type': 'lexicon-word',
        'parent-id': wordID,
        'parent-path': path,
      };

      // add conditionals for editing instead of creating
      return await api.create(path, 'vote', 0, data, []);
    }
  },
};
export default api;
