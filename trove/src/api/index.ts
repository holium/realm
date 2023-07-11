import Urbit from '@urbit/http-api';
import memoize from 'lodash/memoize';

import { isDev, log } from '../helpers';
import { Folder } from '../store/troveStore';
import updates from './updates';

//todo: make this a ts file

const api = {
  createApi: memoize(() => {
    /*
    Connect to urbit and return the urbit instance
    returns urbit instance
  */
    //ropnys-batwyd-nossyt-mapwet => nec
    //lidlut-tabwed-pillex-ridrup => zod
    const urb = isDev()
      ? new Urbit('http://localhost:8080', 'podbyl-mogdef-wacten-midrup')
      : new Urbit('');
    urb.ship = isDev() ? '~lux' : '';
    // Just log errors if we get any
    urb.onError = (message) => log('onError: ', message);
    urb.onOpen = () => log('urbit onOpen');
    urb.onRetry = () => log('urbit onRetry');
    //sub to our frontend updates
    urb.subscribe(updates);
    urb.connect();

    return urb;
  }),

  addFile: async (
    space: string,
    trove: Folder,
    pathToparent: any,
    url: string,
    title: string,
    description: string,
    extension: string,
    size: string,
    key: string
  ) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: newFile,
    });
  },
  editFile: async (
    space: string,
    trove: Folder,
    id: string,
    pathToParent: string,
    newTitle: string,
    newDescription = ''
  ) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: editFile,
    });
  },
  addTrove: async (space: string, name: string, perms: any) => {
    const newTrove = {
      space: {
        space,
        axn: {
          'add-trove': {
            name: name,
            perms,
            /*: {
              admins: "rw", // (can be "r" for read, or "rw" for read and write)
              member: "r", // (can be null for no perms, "r" for read, or "rw" for read and write)
              custom: {}, // (map from subset of space members to "r" or "rw") { "~nec": "rw", "~bud": "rw" }, or empty {}
            },*/
          },
        },
      },
    };
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: newTrove,
    });
  },
  editTrove: async (space: string, trove: Folder, newName: any) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: editTrove,
    });
  },
  removeTrove: async (space: string, trove: Folder) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: remTrove,
    });
  },
  repermTrove: async (space: string, trove: Folder, perms: any) => {
    const reperTrove = {
      trove: {
        st: { space, tope: trove },
        axn: {
          reperm: {
            perms,
            /*
             { // fully new perms
              admins: "rw", // (can be "r" for read, or "rw" for read and write)
              member: "r", // (can be null for no perms, "r" for read, or "rw" for read and write)
              custom: { "~nec": "rw", "~bud": "rw" }, // (map from subset of space members to "r" or "rw")
            },*/
          },
        },
      },
    };
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: reperTrove,
    });
  },
  createFolder: async (space: string, trove: Folder, pathToNewFolder: any) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: newFolder,
    });
  },
  removeFolder: async (space: string, trove: Folder, pathToFolder: any) => {
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

    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: removeFolder,
    });
  },
  removeFile: async (
    space: string,
    trove: Folder,
    fileId: any,
    pathToParent: string
  ) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: removeFile,
    });
  },
  moveFolder: async (
    space: string,
    trove: Folder,
    fromPath: string,
    toPath: string
  ) => {
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

    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: moveFolder,
    });
  },
  moveFile: async (
    space: string,
    trove: Folder,
    id: string,
    fromPath: string,
    toPath: string
  ) => {
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
    return api.createApi().poke({
      app: 'trove',
      mark: 'trove-action',
      json: moveNode,
    });
  },
  getTroves: async (space: string) => {
    return api.createApi().scry({ app: 'trove', path: '/troves/' + space });
  },
  getFullState: async () => {
    return api.createApi().scry({ app: 'trove', path: '/state' });
  },
  getS3credentials: async () => {
    return api.createApi().scry({ app: 's3-store', path: '/credentials' });
  },

  getS3Configuration: async () => {
    return api.createApi().scry({ app: 's3-store', path: '/configuration' });
  },
  getSpaces: async () => {
    return api.createApi().scry({ app: 'trove', path: '/hosts' });
  },
  getMembers: async (space: string) => {
    return api
      .createApi()
      .scry({ app: 'spaces', path: '/' + space + '/members' });
  },
};
export default api;
