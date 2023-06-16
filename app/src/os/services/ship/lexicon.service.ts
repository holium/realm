import AbstractService, { ServiceOptions } from '../abstract.service';
import { APIConnection } from '../api';
//TODO: export these types from Lexicon
export type Path = string;
export type Ship = string;

export type Role = string;
export type Type = string;
export type RowID = string;

export type PeerParm = {
  ship: Ship;
  role: Role;
};

export type PeerParms = PeerParm[];

export interface Peer {
  path: Path;
  ship: Ship;
  role: Role;
  createdAt: number;
  updatedAt: number;
  receivedAt: number;
}

export type KeyPair = [name: string, t: string];
export type Schema = KeyPair[];

export interface BedrockRow {
  [key: string]: any;
  path: Path;
  id: RowID;
  type: Type;
  v: number;
  'created-at': number;
  'updated-at': number;
  'received-at': number;
}

export type Replication = 'host' | 'gossip' | 'shared-host';
export type PermissionScope = 'table' | 'own' | 'none';

export type AccessRule = {
  create: boolean;
  edit: PermissionScope;
  delete: PermissionScope;
};

export type AccessRules = Record<Role, AccessRule>;
export type TableAccess = Record<Type, AccessRules>;

export type UniqueColumns = Set<string>;

export type Constraint = {
  type: Type;
  uniques: Set<UniqueColumns>;
  check: null;
};

export interface PathRow {
  path: Path;
  host: Ship;
  replication: Replication;
  defaultAccess: AccessRules;
  tableAccess: TableAccess;
  constraints: Set<Constraint>;
  createdAt: number;
  updatedAt: number;
  receivedAt: number;
}

// Bedrock updates
export interface addRowUpdate {
  change: 'add-row';
  row: BedrockRow;
}

export interface updRowUpdate {
  change: 'upd-row';
  row: BedrockRow;
}

export interface delRowUpdate {
  change: 'del-row';
  path: Path;
  type: Type;
  id: RowID;
  t: number;
}

export interface addPathUpdate {
  change: 'add-path';
  row: PathRow;
}

export interface updPathUpdate {
  change: 'upd-path';
  row: PathRow;
}

export interface delPathUpdate {
  change: 'del-path';
  path: Path;
}

export interface addPeerUpdate {
  change: 'add-peer';
  peer: Peer;
}

export interface updPeerUpdate {
  change: 'upd-peer';
  peer: Peer;
}

export interface delPeerUpdate {
  change: 'del-peer';
  path: Path;
  ship: Ship;
  t: number;
}

export type dbChange =
  | addRowUpdate
  | updRowUpdate
  | delRowUpdate
  | addPathUpdate
  | updPathUpdate
  | delPathUpdate
  | addPeerUpdate
  | updPeerUpdate
  | delPeerUpdate;

export type dbChanges = dbChange[];

// Available Column Types:
//   'rd'   -->
//   'ud'   --> Number
//   'da'   -->
//   'dr'   -->
//   't'    -->
//   'p'    -->
//   'id'   -->
//   'unit' -->
//   'path' -->
//   'list' -->
//   'set'  -->
//   'map'  -->
//
export const WordSchema: Schema = [
  ['word', 't'],
  ['votes', 'map'],
];

export const DefinitionSchema: Schema = [
  ['definition', 't'],
  ['word-id', 'id'],
  ['votes', 'map'],
];

export const SentenceSchema: Schema = [
  ['sentence', 't'],
  ['word-id', 'id'],
  ['votes', 'map'],
];

export const RelatedSchema: Schema = [
  ['related', 't'],
  ['word-id', 'id'],
  ['votes', 'map'],
];
export class LexiconService extends AbstractService {
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
