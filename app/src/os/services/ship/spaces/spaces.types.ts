export type SpacesUpdateType = {
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
};
