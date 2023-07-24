type Permissions = {
  admins: 'rw' | 'rw'; // (can be "r" for read, or "rw" for read and write)
  member: 'rw' | 'r'; // (can be null for no perms, "r" for read, or "rw" for read and write)
  custom: Custom; // (map from subset of space members to "r" or "rw") { "~nec": "rw", "~bud": "rw" }, or empty {}
};
type Custom = {
  [key: string]: 'r' | 'rw';
};
interface AddFolderUpdate {
  space: string;
  update: {
    'add-folder': {
      tract: {
        from: number;
        files: any;
        by: string;
      };
      trail: string;
    };
  };
  tope: string;
}
interface addFileUpdate {
  space: string;
  update: {
    'add-node': {
      node: {
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
      trail: string;
      id: string;
    };
  };
  tope: string;
}
interface AddTroveUpdate {
  space: string;
  update: {
    'add-trove': {
      name: string;
      perms: Permissions;
      trove: {
        '/': {
          from: number;
          files: Record<string, any>;
          by: string;
        };
      };
      tope: string;
    };
  };
}

interface RemoveTroveUpdate {
  space: string;
  update: {
    'rem-trove': {
      tope: string;
    };
  };
}

interface RemoveFolderUpdate {
  space: string;
  update: {
    'rem-folder': {
      trail: string;
    };
  };
  tope: string;
}

interface RemoveFileUpdate {
  space: string;
  update: {
    'rem-node': {
      trail: string;
      id: string;
    };
  };
  tope: string;
}

interface EditTroveTitleUpdate {
  space: string;
  update: {
    'edit-name': {
      name: string;
    };
  };
  tope: string;
}

interface EditFolderUpdate {
  space: string;
  update: {
    'move-folder': {
      from: string;
      to: string;
    };
  };
  tope: string;
}

interface EditFileUpdate {
  space: string;
  update: {
    'edit-node': {
      title: string;
      description: string;
      trail: string;
      id: string;
    };
  };
  tope: string;
}

interface MoveFileUpdate {
  space: string;
  update: {
    'move-node': {
      from: string;
      to: string;
      id: string;
    };
  };
  tope: string;
}

interface MoveFolderUpdate {
  space: string;
  update: {
    'move-folder': {
      from: string;
      to: string;
    };
  };
  tope: string;
}

interface TroveRepermUpdate {
  space: string;
  update: {
    reperm: {
      perms: Permissions;
    };
  };
  tope: string;
}
export type TroveUpdateType = {
  type: 'trove-update';
  payload:
    | AddFolderUpdate
    | addFileUpdate
    | AddTroveUpdate
    | RemoveTroveUpdate
    | RemoveFolderUpdate
    | RemoveFileUpdate
    | EditTroveTitleUpdate
    | EditFolderUpdate
    | EditFileUpdate
    | MoveFileUpdate
    | MoveFolderUpdate
    | TroveRepermUpdate;
};
