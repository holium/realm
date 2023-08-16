import Database from 'better-sqlite3-multiple-ciphers';

import { BedrockSchema } from 'os/types';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';
import { BedrockUpdateType } from './bedrock.types';

export enum BUILTIN_TABLES {
  VOTES = 'votes',
  COMMENTS = 'comments',
  RATINGS = 'ratings',
}

class BedrockService extends AbstractService<BedrockUpdateType> {
  public db?: Database;

  constructor(options?: ServiceOptions, db?: Database) {
    super('BedrockService', options);
    this.db = db;
    if (options?.preload) {
      return;
    }
  }

  async init() {
    const result = await this._getState();
    if (!this.db || !this.db?.open) return;
    for (const table of result['data-tables']) {
      const tableName = `bedrock_${table.type}`;
      const insert = this.db.prepare(
        `REPLACE INTO ${tableName} (
          id,
          received_at,
          updated_at,
          revision,
          creator,
          created_at,
          path,
          type,
          v,
          data
        ) VALUES (
          @id,
          @received_at, 
          @updated_at,
          @revision,
          @creator,
          @created_at,
          @path,
          @type,
          @v,
          @data
        )`
      );
      const insertMany = this.db.transaction((rows: any) => {
        for (const row of rows) {
          insert.run({
            received_at: row['received-at'],
            updated_at: row['updated-at'],
            revision: row['revision'],
            id: row['id'],
            creator: row['creator'],
            created_at: row['created-at'],
            path: row['path'],
            type: row['type'],
            v: row['v'],
            data: JSON.stringify(row.data),
          });
        }
      });
      insertMany(table.rows);
    }
    return;
  }
  // INSERT statements
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
    schema: BedrockSchema
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
    schema: BedrockSchema
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
    schema: BedrockSchema
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
      onEvent: (data) => {
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
    return await APIConnection.getInstance().conduit.scry({
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

export default BedrockService;

// Generate preload
const BedrockServiceInstance = BedrockService.preload(
  new BedrockService({ preload: true })
);

export const bedrockPreload = {
  ...BedrockServiceInstance,
};
