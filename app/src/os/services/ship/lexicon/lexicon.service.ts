import Database from 'better-sqlite3-multiple-ciphers';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';
import { LexiconUpdateType } from './lexicon.types';

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

class LexiconService extends AbstractService<LexiconUpdateType> {
  public db?: Database;

  constructor(options?: ServiceOptions, db?: Database) {
    super('LexiconService', options);
    this.db = db;
    if (options?.preload) {
      return;
    }
  }

  async init() {
    //insert all the words/votes/definitions/sentences in our local sqlite database
    const { words, votes, definitions, sentences } = await this._getState();
    this._insertVotes(votes);
    this._insertWords(words);
    this._insertDefinitions(definitions);
    this._insertSentences(sentences);
    return;
  }
  // INSERT statements
  private _insertVotes(votes: any) {
    if (!this.db?.open) return;

    const insert = this.db.prepare(
      `REPLACE INTO ${LEXICON_TABLES.VOTES} (
        id,
        received_at,
        parent_path,
        updated_at,
        revision,
        creator,
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
        @creator,
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
          parent_path: vote.data['parent-path'],
          updated_at: vote['updated-at'],
          revision: vote['revision'],
          id: vote['id'],
          creator: vote['creator'],
          created_at: vote['created-at'],
          up: vote.data['up'] ? 1 : 0, //conver boolean to 1 or 0
          path: vote['path'],
          type: vote['type'],
          parent_id: vote.data['parent-id'],
          parent_type: vote.data['parent-type'],
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
          word: word.data['word'], // should be data.word
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
          definition: definition.data['definition'],
          updated_at: definition['updated-at'],
          revision: definition['revision'],
          id: definition['id'],
          created_at: definition['created-at'],
          path: definition['path'],
          type: definition['type'],
          word_id: definition.data['word-id'],
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
          sentence: sentence.data['sentence'],
          updated_at: sentence['updated-at'],
          revision: sentence['revision'],
          id: sentence['id'],
          created_at: sentence['created-at'],
          path: sentence['path'],
          type: sentence['type'],
          word_id: sentence.data['word-id'],
          v: sentence['v'],
        });
      }
    });
    insertMany(sentences);
  }
  private _deleteWord(wordId: string) {
    if (!this.db?.open) return;
    const deleteWord = this.db.prepare(
      `DELETE FROM ${LEXICON_TABLES.WORDS} WHERE id = ?`
    );
    deleteWord.run(wordId);
  }
  private _deleteVote(voteId: string) {
    if (!this.db?.open) return;
    const deleteVote = this.db.prepare(
      `DELETE FROM ${LEXICON_TABLES.VOTES} WHERE id = ?`
    );
    deleteVote.run(voteId);
  }
  // database queries
  _getVotes(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.VOTES} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
  }
  _getWords(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.WORDS} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
  }
  _getDefinitions(path: string) {
    if (!this.db?.open) return;
    const query = this.db.prepare(
      `SELECT * FROM ${LEXICON_TABLES.DEFINITIONS} WHERE path = ?;`
    );
    const result: any = query.all(path);
    return result;
  }
  _getSentences(path: string) {
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
      app: 'bedrock',
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
      app: 'bedrock',
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
      app: 'bedrock',
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
    const json: any = {
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
  /* async relayWord() {
     *
     * How to get relays working:
     * -below relay creates a row in the relay table,
     *    where the data object is a reference to the original row
     *
     * -never copy the original row, allows fetch it from the original
     *    space and add it to the result of the state fetch so it appears in the UI
     *
     * -new votes should live in current space, but should also show the votes form the
     *    original space
    
    const targetPath = '/~lux/our';

    const data = {
      deleted: false,
      revision: 0,
      protocal: 'all',
      type: 'lexicon-word',
      id: '/~lux/~2023.6.23..16.58.30..3b60',
      path: '/~lux/randy',
    };
    const json: any = {
      relay: {
        path: targetPath,
        type: 'relay',
        v: 0,
        data: data,
        schema: [],
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
   */
  async createWord(path: string, word: string) {
    const data = [word];

    return this.runThread(path, 'lexicon-word', 0, data, WordSchema);
  }
  async editWord(path: string, wordID: string, word: string) {
    const data = [word];
    return await this.edit(wordID, path, 'lexicon-word', 0, data, WordSchema);
  }
  async removeWord(path: string, wordID: string) {
    return await this.remove(wordID, path, 'lexicon-word');
  }
  async createDefinition(path: string, wordID: string, definition: string) {
    const data = [definition, wordID];
    return await this.create(
      path,
      'lexicon-definition',
      0,
      data,
      DefinitionSchema
    );
  }
  async createSentence(path: string, wordID: string, sentence: string) {
    const data = [sentence, wordID];
    return await this.create(path, 'lexicon-sentence', 0, data, SentenceSchema);
  }
  async createRelated(path: string, wordID: string, related: string) {
    const data = [related, wordID];
    return await this.create(path, 'lexicon-related', 0, data, RelatedSchema);
  }
  async voteOnWord(
    path: string,
    wordID: string,
    voteId: string,
    vote: boolean | null,
    ship: string
  ) {
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
      app: 'bedrock',
      path: `/path${path}`,
      onEvent: (data: any) => {
        //send update to the IPC update handler in app.store
        this.sendUpdate({ type: 'lexicon-update', payload: data });
        // sync changes to sql db here
        this.onUpdate(data);
      },
      onError: () => console.log('Subscription rejected.'),
      onQuit: () => console.log('Kicked from subscription.'),
    });
  }
  onUpdate(update: any) {
    if (update.length === 0) return;
    const type = update[0].change;
    if (type === 'add-row') {
      //insert a new row into the db
      const change = update[0].row.type;
      switch (change) {
        case 'lexicon-word': {
          this._insertWords([update[0].row]);
          break;
        }
        case 'lexicon-definition': {
          this._insertDefinitions([update[0].row]);
          break;
        }
        case 'lexicon-sentence': {
          this._insertSentences([update[0].row]);
          break;
        }
        case 'vote': {
          this._insertVotes([update[0].row]);
          break;
        }
      }
    } else if (type === 'del-row') {
      //delete a row from the db
      const change = update[0].type;
      switch (change) {
        case 'lexicon-word': {
          this._deleteWord(update[0].id);
          break;
        }
        case 'vote': {
          this._deleteVote(update[0].id);
          break;
        }
      }
    }
  }
  getPath(path: string) {
    return this._getPath(path);
  }
  _getPath(path: string) {
    // fetch from db all the rows lexicon needs at the given path
    const words = this._getWords(path);
    const definitions = this._getDefinitions(path);
    const sentences = this._getSentences(path);
    const votes = this._getVotes(path);
    return { words, definitions, sentences, votes };
  }
  async _getState() {
    const result = await APIConnection.getInstance().conduit.scry({
      app: 'bedrock',
      path: '/db',
    });

    let words: any = [];
    let votes: any = [];
    let definitions: any = [];
    let sentences: any = [];

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
  async getDictonaryDefinition(word: string) {
    try {
      const result = await fetch(
        'https://api.dictionaryapi.dev/api/v2/entries/en/' + word
      );
      const data = await result.json();
      return data;
    } catch (e) {
      return [];
    }
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
