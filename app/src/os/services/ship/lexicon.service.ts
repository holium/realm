import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection } from '../api';

type KeyPair = [name: string, t: string];
type Schema = KeyPair[];

const WordSchema: Schema = [['word', 't']];

const DefinitionSchema: Schema = [
  ['definition', 't'],
  ['word-id', 'id'],
];

const SentenceSchema: Schema = [
  ['sentence', 't'],
  ['word-id', 'id'],
];

const RelatedSchema: Schema = [
  ['related', 't'],
  ['word-id', 'id'],
];

class LexiconService extends AbstractService {
  //public walletDB?: WalletDB;
  lastUpdate = {};
  constructor(options?: ServiceOptions) {
    super('LexiconService', options);
    if (options?.preload) {
      return;
    }
  }

  async create(
    path: string,
    type: string,
    version: number,
    data: any,
    schema: Schema
  ) {
    return APIConnection.getInstance().conduit.poke({
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
  }
  async edit(
    rowID: string,
    path: string,
    type: string,
    version: number,
    data: any,
    schema: Schema
  ) {
    return APIConnection.getInstance().conduit.poke({
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
  }
  async remove(rowID: string, path: string, type: string) {
    return APIConnection.getInstance().conduit.poke({
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
  }
  async runThread(
    path: string,
    type: string,
    version: number,
    data: any,
    schema: Schema
  ) {
    const json = {
      create: {
        path: path,
        type: type,
        v: version,
        data: data,
        schema: schema,
      },
    };

    return APIConnection.getInstance().conduit.thread({
      inputMark: 'db-action',
      outputMark: 'db-vent',
      threadName: 'venter',
      body: json,
      desk: 'realm',
    });
  }
  // Lexicon-specific
  async createWord(path: string, word: string) {
    const data = [word, {}];

    return this.runThread(path, 'lexicon-word', 0, data, WordSchema);
  }
  async editWord(path: string, wordID: string, word: string) {
    const data = [word, {}];
    return await this.edit(wordID, path, 'lexicon-word', 0, data, WordSchema);
  }
  async removeWord(path: string, wordID: string) {
    return await this.remove(wordID, path, 'lexicon-word');
  }
  async createDefinition(path: string, wordID: string, definition: string) {
    const data = [definition, wordID, {}];
    return await this.create(
      path,
      'lexicon-definition',
      0,
      data,
      DefinitionSchema
    );
  }
  async createSentence(path: string, wordID: string, sentence: string) {
    const data = [sentence, wordID, {}];
    return await this.create(path, 'lexicon-sentence', 0, data, SentenceSchema);
  }
  async createRelated(path: string, wordID: string, related: string) {
    const data = [related, wordID, {}];
    return await this.create(path, 'lexicon-related', 0, data, RelatedSchema);
  }
  async voteOnWord(
    path: string,
    wordID: string,
    voteId: string,
    vote: boolean | null,
    ship: string
  ) {
    //TODO: use realm data here (ship Name)
    if (vote === null) {
      return await this.remove(voteId, path, 'vote');
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
      return await this.create(path, 'vote', 0, data, []);
    }
  }
  async subscribePath(path: string) {
    return APIConnection.getInstance().conduit.watch({
      app: 'db',
      path: `/path${path}`,
      onEvent: (data: any) => {
        //send update to the IPC update handler in app.store
        console.log('data', data);
        this.sendUpdate({ type: 'lexicon-update', payload: data });
      },
      onError: () => console.log('Subscription rejected.'),
      onQuit: () => console.log('Kicked from subscription.'),
    });
  }

  async getPath(path: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'db',
      path: '/db/path' + path,
    });
  }
}

export default LexiconService;

// Generate preload
const LexiconServiceInstance = LexiconService.preload(
  new LexiconService({ preload: true })
);

export const lexiconPreload = {
  ...LexiconServiceInstance,
};
