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
    | 'joined-bazaar'
    | 'treaties-loaded'
    | 'new-ally';
  payload: any;
};
