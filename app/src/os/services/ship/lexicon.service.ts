import Database from 'better-sqlite3-multiple-ciphers';

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
export enum LEXICON_TABLES {
  WORDS = 'lexicon_words',
  DEFINITIONS = 'lexicon_definitions',
  SENTENCES = 'lexicon_sentences',
  VOTES = 'votes',
}

class LexiconService extends AbstractService<any> {
  //public walletDB?: WalletDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('LexiconService', options);
    this.db = db;
    if (options?.preload) {
      return;
    }
  }

  async init() {
    console.log('initing lexicon ===============>');
    //insert all the words/votes/definitions/sentences in our local sqlite database
    const { words, votes, definitions, sentences } = await this._getState();
    this._insertVotes(votes);
    this._insertWords(words);
    this._insertDefinitions(definitions);
    this._insertSentences(sentences);
    return;
  }
  private _insertVotes(votes: any) {
    if (!this.db?.open) return;

    const insert = this.db.prepare(
      `REPLACE INTO ${LEXICON_TABLES.VOTES} (
        id,
        received_at,
        parent_path,
        updated_at,
        revision,
        ship,
        created_at,
        up,
        path,
        type,
        parent_id,
        parent_type,
        v
      ) VALUES (
        @id,
        @received_at, 
        @parent_path, 
        @updated_at,
        @revision,
        @ship,
        @created_at,
        @up,
        @path,
        @type,
        @parent_id,
        @parent_type,
        @v
      )`
    );
    const insertMany = this.db.transaction((votes: any) => {
      for (const vote of votes) {
        insert.run({
          received_at: vote['received-at'],
          parent_path: vote['parent-path'],
          updated_at: vote['updated-at'],
          revision: vote['revision'],
          id: vote['id'],
          ship: vote['ship'],
          created_at: vote['created-at'],
          up: vote['up'] ? 1 : 0, //conver boolean to 1 or 0
          path: vote['path'],
          type: vote['type'],
          parent_id: vote['parent-id'],
          parent_type: vote['parent-type'],
          v: vote['v'],
          // fall bock to zero since we have not-null constraint
        });
      }
    });
    insertMany(votes);
  }
  private _insertWords(words: any) {
    if (!this.db?.open) return;

    const insert = this.db.prepare(
      `REPLACE INTO ${LEXICON_TABLES.WORDS} (
        id,
        received_at,
        word,
        updated_at,
        revision,
        created_at,
        path,
        type,
        v
      ) VALUES (
        @id,
        @received_at, 
        @word, 
        @updated_at,
        @revision,
        @created_at,
        @path,
        @type,
        @v
      )`
    );
    const insertMany = this.db.transaction((words: any) => {
      for (const word of words) {
        insert.run({
          received_at: word['received-at'],
          word: word['word'],
          updated_at: word['updated-at'],
          revision: word['revision'],
          id: word['id'],
          created_at: word['created-at'],
          path: word['path'],
          type: word['type'],
          v: word['v'],
        });
      }
    });
    insertMany(words);
  }
  private _insertDefinitions(definitions: any) {
    if (!this.db?.open) return;

    const insert = this.db.prepare(
      `REPLACE INTO ${LEXICON_TABLES.DEFINITIONS} (
        id,
        received_at,
        definition,
        updated_at,
        revision,
        created_at,
        path,
        type,
        word_id,
        v
      ) VALUES (
        @id,
        @received_at, 
        @definition, 
        @updated_at,
        @revision,
        @created_at,
        @path,
        @type,
        @word_id,
        @v
      )`
    );

    const insertMany = this.db.transaction((definitions: any) => {
      for (const definition of definitions) {
        insert.run({
          received_at: definition['received-at'],
          definition: definition['definition'],
          updated_at: definition['updated-at'],
          revision: definition['revision'],
          id: definition['id'],
          created_at: definition['created-at'],
          path: definition['path'],
          type: definition['type'],
          word_id: definition['word-id'],
          v: definition['v'],
        });
      }
    });
    insertMany(definitions);
  }
  private _insertSentences(sentences: any) {
    if (!this.db?.open) return;

    const insert = this.db.prepare(
      `REPLACE INTO ${LEXICON_TABLES.SENTENCES} (
        id,
        received_at,
        sentence,
        updated_at,
        revision,
        created_at,
        path,
        type,
        word_id,
        v
      ) VALUES (
        @id,
        @received_at, 
        @sentence, 
        @updated_at,
        @revision,
        @created_at,
        @path,
        @type,
        @word_id,
        @v
      )`
    );

    const insertMany = this.db.transaction((sentences: any) => {
      for (const sentence of sentences) {
        insert.run({
          received_at: sentence['received-at'],
          sentence: sentence['sentence'],
          updated_at: sentence['updated-at'],
          revision: sentence['revision'],
          id: sentence['id'],
          created_at: sentence['created-at'],
          path: sentence['path'],
          type: sentence['type'],
          word_id: sentence['word-id'],
          v: sentence['v'],
        });
      }
    });
    insertMany(sentences);
  }
  // database queries
  getVotes(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.VOTES} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
  }
  getWords(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.WORDS} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
  }
  getDefinitions(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.DEFINITIONS} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
  }
  getSentences(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.SENTENCES} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
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
        this.sendUpdate({ type: 'lexicon-update', payload: data });
        this.onUpdate(data);
      },
      onError: () => console.log('Subscription rejected.'),
      onQuit: () => console.log('Kicked from subscription.'),
    });
  }
  onUpdate(data: any) {
    console.log('data', data);
    if (data.length === 0) return;
    const type = data[0].change;
    if (type === 'add-row') {
      //insert a new row into the db
      const change = data[0].row.type;
      switch (change) {
        case 'lexicon-word': {
          break;
        }
        case 'lexicon-definition': {
          break;
        }
        case 'lexicon-sentence': {
          break;
        }
        case 'vote': {
          break;
        }
      }
    } else if (type === 'del-row') {
      //delete a row from the db
      const change = data[0].type;

      switch (change) {
        case 'lexicon-word': {
          break;
        }
        case 'vote': {
          break;
        }
      }
    }
  }
  async getPath(path: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'db',
      path: '/db/path' + path,
    });
  }
  async _getState() {
    const result = await APIConnection.getInstance().conduit.scry({
      app: 'db',
      path: '/db',
    });
    let words: any = [];
    let votes: any = [];
    let definitions: any = [];
    let sentences: any = [];
    console.log('result', result['data-tables']);
    if (result) {
      result['data-tables'].forEach((item: any) => {
        if (item.type === 'lexicon-word') {
          words = item.rows;
        } else if (item.type === 'vote') {
          votes = item.rows;
        } else if (item.type === 'lexicon-definition') {
          definitions = item.rows;
        } else if (item.type === 'lexicon-sentence') {
          sentences = item.rows;
        }
      });
    }
    return { words, votes, definitions, sentences };
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
