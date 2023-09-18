import { flow, types } from 'mobx-state-tree';

import { Json } from 'os/services/api/types';
import { BedrockUpdateType } from 'os/services/ship/bedrock/bedrock.types';
import { BedrockSchema } from 'os/types';

//import { toJS } from 'mobx';
import { BedrockIPC } from './ipc';

const RowModel = types.map(
  types.model('RowModel', {
    id: types.string,
    path: types.string,
    type: types.string,
    creator: types.string,
    created_at: types.number,
    updated_at: types.number,
    received_at: types.number,
    data: types.frozen(),
  })
);

export const BedrockStore = types
  .model('BedrockStore', {
    tables: types.array(types.string),
    rows: types.map(RowModel),
    initializing: types.optional(types.boolean, false),
  })
  .views((self) => ({
    table(table: string) {
      if (!self.tables.find((t) => t === table)) return false;
      return self.rows.get(table);
    },
  }))
  .actions((self) => ({
    initialize: flow(function* ({ tables }: { tables: string[] }) {
      self.initializing = true;
      const newtables: string[] = Array.from(self.tables.values()).concat(
        tables.filter((t: string) => !self.tables.find((inner) => inner === t))
      );
      yield BedrockIPC.init();

      for (const tbl of newtables) {
        const rows = yield BedrockIPC.queryTable(tbl);
        console.log(tbl, rows);
        const tblModel: any = {};
        for (const row of rows) {
          console.log(row);
          tblModel[row.id] = row;
        }
        self.rows.set(tbl, RowModel.create(tblModel));
      }

      self.tables.replace(newtables);

      return (self.initializing = false);
    }),

    createRow(path: string, type: string, data: Json, schema: BedrockSchema) {
      return BedrockIPC.create({
        path,
        type,
        data,
        schema,
      });
    },

    maybeAddRow(row: any) {
      const weCareAboutThisChange = !!self.tables.find((t) => t === row.type);
      if (weCareAboutThisChange) {
        const tbl = self.rows.get(row.type);
        if (tbl) {
          self.rows.set(row.type, tbl.set(row.id, row));
        } else {
          console.error(
            'we are missing a table we thought we should have',
            row.type,
            row
          );
        }
      }
    },
  }));

export const bedrockStore: any = BedrockStore.create({
  tables: [],
  rows: {},
  initializing: false,
});

// -------------------------------
// Listen for bedrock updates from the main process.
// -------------------------------
BedrockIPC.onUpdate(({ type, payload }: BedrockUpdateType) => {
  if (type === 'bedrock-update') {
    for (const change of payload) {
      const changeType = change.change;
      if (changeType === 'add-row') {
        bedrockStore.maybeAddRow(change);
      } else if (changeType === 'del-row') {
        console.log('not implemented');
      }
    }
  } else {
    console.error('BedrockStore.onUpdate', 'Unknown type');
  }
});
