import { BedrockSchema } from 'os/types';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';
import { Json } from '../../api/types';
import AbstractDbManager, { BUILTIN_TYPES } from './abstract';
import {
  BedrockIDTriple,
  BedrockRow,
  BedrockUpdateType,
  CredsRow,
  deleteRowUpdate,
  GeneralRow,
  VoteRow,
} from './bedrock.types';

// knows how to talk to urbit %bedrock agent, and calls out to the passed in AbstractDbManager to actually save the data
class BedrockService extends AbstractService<BedrockUpdateType> {
  public db?: AbstractDbManager;
  private initialized: boolean;

  constructor(options?: ServiceOptions, db?: AbstractDbManager) {
    super('BedrockService', options);
    this.db = db;
    this.initialized = false;
    if (options?.preload) {
      return;
    }
    this.onUpdate = this.onUpdate.bind(this);
  }

  async init() {
    if (this.initialized) return false;
    // pull fresh data from scries
    const result = await this.getState();
    if (!this.db || !this.db?.open) return;
    for (const table of result['data-tables']) {
      if (table.rows[0]) {
        console.log('syncing %bedrock type ', table.type);
        this.db.createTableIfNotExists(this.transform(table.rows[0]));
        this.db.insertRows(table.rows.map(this.transform));
      }
    }
    // Missed delete events must be applied after inserts
    for (const del of result['del-log']) {
      if (del.change === 'del-row') {
        this.db.deleteRows([del]);
      }
    }
    // watch for live updates
    console.log('subscribing to %bedrock /db');
    this.initialized = true;
    return APIConnection.getInstance().conduit.watch({
      app: 'bedrock',
      path: `/db`,
      onEvent: this.onUpdate,
      onError: (err: any) => console.error('err!', err),
      onQuit: () => console.log('Kicked from subscription.'),
    });
  }

  //
  // Fetches
  //
  private async _getScry(path: string) {
    return await APIConnection.getInstance().conduit.scry({
      app: 'bedrock',
      path: path,
    });
  }

  async getState() {
    return await this._getScry('/db');
  }

  async getFullpath(path: string) {
    return await this._getScry(`/db/path${path}`);
  }

  async scryTable(type: string) {
    return await this._getScry(`/db/table${type}`);
  }

  async queryTable(type: string) {
    return this.db?.selectType(type);
  }

  async getHost(path: string) {
    return await this._getScry(`/host/path${path}`);
  }

  async getStateSince(timestamp: number) {
    return await this._getScry(`/db/start-ms/${timestamp}`);
  }

  transform(row: any): BedrockRow {
    const base: any = {
      id: row.id,
      path: row.path,
      type: row.type,
      creator: row.id.split('/')[1],
      created_at: row['created-at'],
      updated_at: row['updated-at'],
      received_at: row['received-at'],
    };
    if (row.type === BUILTIN_TYPES.CREDS) {
      base.endpoint = row.data.endpoint;
      base.access_key_id = row.data['access-key-id'];
      base.secret_access_key = row.data['secret-access-key'];
      base.buckets = row.data['buckets'];
      base.current_bucket = row.data['current-bucket'];
      base.region = row.data['region'];
      return base as CredsRow;
    } else if (row.type === BUILTIN_TYPES.VOTE) {
      base.parent_id = row.data['parent-id'];
      base.parent_type = row.data['parent-type'];
      base.parent_path = row.data['parent-path'];
      base.up = !!row.data['up'];
      return base as VoteRow;
    } else {
      base.data = row['data'];
      return base as GeneralRow;
    }
  }

  //
  // Pokes
  //
  async create(path: string, type: string, data: Json, schema: BedrockSchema) {
    if (!this.db || !this.db?.open) return;
    console.log(path, type, data, schema);
    const row: any = await APIConnection.getInstance().conduit.thread({
      inputMark: 'db-action',
      outputMark: 'db-vent',
      threadName: 'venter',
      body: {
        create: {
          path,
          type,
          data,
          schema,
        },
      },
      desk: 'realm',
    });
    const transformedRow = this.transform(row);
    this.db.createTableIfNotExists(transformedRow);
    this.db.insertRows([transformedRow]);
  }

  async edit(
    rowID: string,
    path: string,
    type: string,
    data: Json,
    schema: BedrockSchema
  ) {
    if (!this.db || !this.db?.open) return;
    const row: any = await APIConnection.getInstance().conduit.thread({
      inputMark: 'db-action',
      outputMark: 'db-vent',
      threadName: 'venter',
      desk: 'realm',
      body: {
        edit: {
          id: rowID,
          'input-row': {
            path: path,
            type: type,
            data: data,
            schema: schema,
          },
        },
      },
    });
    const transformedRow = this.transform(row);
    this.db.updateRows([transformedRow]);
  }

  async remove(rowID: string, path: string, type: string) {
    if (!this.db || !this.db?.open) return;
    const row: deleteRowUpdate =
      await APIConnection.getInstance().conduit.thread({
        inputMark: 'db-action',
        outputMark: 'db-vent',
        threadName: 'venter',
        desk: 'realm',
        body: {
          remove: {
            id: rowID,
            path,
            type,
          },
        },
      });
    this.db.deleteRows([row]);
  }

  async createVote(path: string, up: boolean, on: BedrockIDTriple) {
    return this.create(
      path,
      BUILTIN_TYPES.VOTE,
      {
        up,
        'parent-type': on.type,
        'parent-id': on.id,
        'parent-path': on.path,
      },
      []
    );
  }
  async editVote(
    path: string,
    voteId: string,
    up: boolean,
    on: BedrockIDTriple
  ) {
    return await this.edit(
      voteId,
      path,
      BUILTIN_TYPES.VOTE,
      {
        up,
        'parent-type': on.type,
        'parent-id': on.id,
        'parent-path': on.path,
      },
      []
    );
  }
  async removeVote(path: string, id: string) {
    return await this.remove(id, path, BUILTIN_TYPES.VOTE);
  }

  onUpdate(update: any) {
    if (update.length === 0) return;
    if (!this.db || !this.db?.open) return;
    //send update to the IPC update handler in app.store
    for (const change of update) {
      const changeType = change.change;
      if (changeType === 'add-row') {
        console.log(change);
        const transformedRow = this.transform(change.row);
        this.sendUpdate({ type: 'bedrock-add-row', payload: transformedRow });
        this.db.createTableIfNotExists(transformedRow);
        this.db.insertRows([transformedRow]);
      } else if (changeType === 'upd-row') {
        const transformedRow = this.transform(change.row);
        this.db.updateRows([transformedRow]);
      } else if (changeType === 'del-row') {
        this.db.deleteRows([change]);
      }
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
