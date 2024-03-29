import create from 'zustand';

import { trovePreload } from '../../../app/src/os/services/ship/trove/trove.service';
import { Role } from '../types';

export type Folder = null | string;

export type Node = null | {
  id: string;
  type: 'file' | 'folder';
};
interface TroveRenderFile {
  [key: string]: {
    url: string;
    dat: {
      size: string;
      title: string;
      key: string;
      from: number;
      description: string;
      by: string;
      extension: string;
    };
    type: string;
  };
}
interface TroveRenderFolder {
  text: string;
  path: string;
  type: string;
  timestamp: number;
  children: TroveRenderFolder | TroveRenderFile | []; //has either a folder or a file as a child or is an empty array
}
export type TroveRenderTree =
  | {
      [key: string]: TroveRenderFolder | TroveRenderFile | []; //a map of ship/space to trove folder and their files..
    }[]
  | null;
export interface TroveStore {
  api: null | typeof trovePreload;
  setApi: (api: typeof trovePreload) => void;

  troves: any; //a list of our troves unedited, kept flat for ease of interaction
  setTroves: (troves: any) => void;

  inPersonalSpace: null | boolean;
  setInPersonalSpace: (state: boolean) => void;

  troveRenderTree: TroveRenderTree; //calculated from the troves variable, for rendering in react
  setTroveRenderTree: (newTroveRenderTree: TroveRenderTree) => void;

  topLevelFolders: any;
  setTopLevelFolders: (newTopLevelFolders: any) => void;

  selectedTopLevelFolder: Folder;
  setSelectedTopLevelFolder: (folder: Folder) => void;

  selectedNode: Node;
  setSelectedNode: (node: Node) => void;

  space: string;
  setSpace: (space: string) => void;

  currentSpace: string;
  setCurrentSpace: (currentSpace: string) => void;

  myRole: Role;
  setMyRole: (role: Role) => void;

  myPerms: any;
  setMyPerms: (myPerms: any) => void;

  dateSorting: any;
  setDateSorting: (dateSorting: any) => void;

  shipName: string;
  setShipName: (shipName: string) => void;

  mySpace: string;
  setMySpace: (mySpace: string) => void;
}

const useTroveStore = create<TroveStore>((set) => ({
  api: null, //set to the TroveIPC passed down from Realm
  setApi: (api: any) => set({ api }),

  troves: null,
  setTroves: (troves: any) => set(() => ({ troves })),

  inPersonalSpace: null,
  setInPersonalSpace: (state: any) => set(() => ({ inPersonalSpace: state })),

  troveRenderTree: null,
  setTroveRenderTree: (newTroveRenderTree: TroveRenderTree) =>
    set(() => ({ troveRenderTree: newTroveRenderTree })),

  topLevelFolders: [],
  setTopLevelFolders: (newTopLevelFolders: any) =>
    set(() => ({ topLevelFolders: newTopLevelFolders })),

  selectedTopLevelFolder: null,
  setSelectedTopLevelFolder: (folder: Folder) =>
    set(() => ({ selectedTopLevelFolder: folder })),

  selectedNode: null,
  setSelectedNode: (node: Node) => set(() => ({ selectedNode: node })),

  space: '',
  setSpace: (space: string) => {
    set(() => ({ space }));
  },
  shipName: '',
  setShipName: (shipName: string) => set(() => ({ shipName })),

  currentSpace: '',
  setCurrentSpace: (currentSpace: string) => set(() => ({ currentSpace })),

  mySpace: '',
  setMySpace: (mySpace: string) => set(() => ({ mySpace })),

  myRole: null,
  setMyRole: (role: Role) => {
    set(() => ({ myRole: role }));
  },

  myPerms: null,
  setMyPerms: (myPerms: any) => {
    set(() => ({ myPerms }));
  },

  dateSorting: 'asc',
  setDateSorting: (dateSorting: any) => {
    set(() => ({ dateSorting }));
  },
}));

export default useTroveStore;
