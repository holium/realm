export type CreateBookmarkPayload = {
  path: string;
  url: string;
  title: string;
  favicon: string;
  color: string;
};

type BookmarkAddedType = {
  type: 'bookmark-added';
  payload: CreateBookmarkPayload;
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
