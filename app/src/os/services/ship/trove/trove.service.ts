// @ts-nocheck
import Database from 'better-sqlite3-multiple-ciphers';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';
import { TroveUpdateType } from './trove.types';

class TroveService extends AbstractService<TroveUpdateType> {
  public db?: Database;

  constructor(options?: ServiceOptions, db?: Database) {
    super('TroveService', options);
    this.db = db;
    if (options?.preload) {
      return;
    }
  }
  async UIUpdates() {
    return APIConnection.getInstance().conduit.watch({
      app: 'os-trove',
      path: '/ui',
      onEvent: (data: any) => {
        //send update to the IPC update handler in app.store
        this.sendUpdate({ type: 'trove-update', payload: data });
      },
      onError: () => console.log('Subscription rejected.'),
      onQuit: () => console.log('Kicked from subscription.'),
    });
  }
  async addFile(
    space: string,
    trove: null | string,
    pathToparent: any,
    url: string,
    title: string,
    description: string,
    extension: string,
    size: string,
    key: string
  ) {
    const newFile = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'add-node': {
            trail: pathToparent, //path to parent
            url: url,

            title: title, //"cat meme file 1",
            description,
            extension: extension, //"jpg", //(hoon, txt, md, wav, etc...)
            size,
            key, //an id used to trace this file to the S3 node
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: newFile,
    });
  }
  async editFile(
    space: string,
    trove: null | string,
    id: string,
    pathToParent: string,
    newTitle: string,
    newDescription = ''
  ) {
    const editFile = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'edit-node': {
            id,
            trail: pathToParent, //"/path/to/parent/folder",
            tut: newTitle, //null or "new title",
            dus: newDescription, //null or "new description"
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: editFile,
    });
  }
  async addTrove(space: string, name: string, perms: any) {
    const newTrove = {
      space: {
        space,
        axn: {
          'add-trove': {
            name: name,
            perms /*: {
                admins: "rw", // (can be "r" for read, or "rw" for read and write)
                member: "r", // (can be null for no perms, "r" for read, or "rw" for read and write)
                custom: {}, // (map from subset of space members to "r" or "rw") { "~nec": "rw", "~bud": "rw" }, or empty {}
              },*/,
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: newTrove,
    });
  }
  async editTrove(space: string, trove: null | string, newName: any) {
    const editTrove = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'edit-name': {
            name: newName,
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: editTrove,
    });
  }
  async removeTrove(space: string, trove: null | string) {
    const remTrove = {
      space: {
        space,
        axn: {
          'rem-trove': {
            tope: trove, //"~zod/trove-name",
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: remTrove,
    });
  }
  async repermTrove(space: string, trove: null | string, perms: any) {
    const reperTrove = {
      trove: {
        st: { space, tope: trove },
        axn: {
          reperm: {
            perms,
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: reperTrove,
    });
  }
  async createFolder(
    space: string,
    trove: null | string,
    pathToNewFolder: any
  ) {
    const newFolder = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'add-folder': {
            trail: pathToNewFolder, //"/path/to/new-folder",
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: newFolder,
    });
  }
  async removeFolder(space: string, trove: null | string, pathToFolder: any) {
    const removeFolder = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'rem-folder': {
            trail: pathToFolder,
          },
        },
      },
    };

    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: removeFolder,
    });
  }
  async removeFile(
    space: string,
    trove: null | string,
    fileId: any,
    pathToParent: string
  ) {
    const removeFile = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'rem-node': {
            id: fileId,
            trail: pathToParent, //"/path/to/parent/folder",
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: removeFile,
    });
  }
  async moveFolder(
    space: string,
    trove: null | string,
    fromPath: string,
    toPath: string
  ) {
    const moveFolder = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'move-folder': {
            from: fromPath, //"/path/to/old/folder/name",
            to: toPath, //"/path/to/new/folder/name"
          },
        },
      },
    };

    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: moveFolder,
    });
  }
  async moveFile(
    space: string,
    trove: null | string,
    id: string,
    fromPath: string,
    toPath: string
  ) {
    const moveNode = {
      trove: {
        st: { space, tope: trove },
        axn: {
          'move-node': {
            id,
            from: fromPath, // "/path/to/parent/folder",
            to: toPath, //"/path/to/new-parent/folder",
          },
        },
      },
    };
    return APIConnection.getInstance().conduit.poke({
      app: 'os-trove',
      mark: 'trove-action',
      json: moveNode,
    });
  }
  async getTroves(space: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'os-trove',
      path: '/troves/' + space,
    });
  }
  async getFullState() {
    return APIConnection.getInstance().conduit.scry({
      app: 'os-trove',
      path: '/state',
    });
  }
  async getS3credentials() {
    return APIConnection.getInstance().conduit.scry({
      app: 's3-store',
      path: '/credentials',
    });
  }
  async getS3Configuration() {
    return APIConnection.getInstance().conduit.scry({
      app: 's3-store',
      path: '/configuration',
    });
  }
  async getSpaces() {
    return APIConnection.getInstance().conduit.scry({
      app: 'os-trove',
      path: '/hosts',
    });
  }
  async getMembers(space: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'spaces',
      path: '/' + space + '/members',
    });
  }
}

export default TroveService;

// Generate preload
const TroveServiceInstance = TroveService.preload(
  new TroveService({ preload: true })
);

export const trovePreload = {
  ...TroveServiceInstance,
};
