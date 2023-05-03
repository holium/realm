export type BazaarUpdateType = {
  type:
    | 'initial'
    | 'installation-update'
    | 'recommended'
    | 'unrecommended'
    | 'pinned'
    | 'unpinned'
    | 'pins-reordered'
    | 'dock-update'
    | 'stall-update'
    | 'joined-bazaar';
  payload: any;
};
