type BookmarkAddedType = {
  type: 'bookmark-added';
  payload: {
    path: string;
    url: string;
  };
};

type BookmarkRemovedType = {
  type: 'bookmark-removed';
  payload: {
    path: string;
    url: string;
  };
};

export type SpacesUpdateType =
  | {
      type:
        | 'initial'
        | 'invitations'
        | 'invite-sent'
        | 'invite-updated'
        | 'kicked'
        | 'edited'
        | 'add'
        | 'replace'
        | 'remove';
      payload: any;
    }
  | BookmarkAddedType
  | BookmarkRemovedType;
