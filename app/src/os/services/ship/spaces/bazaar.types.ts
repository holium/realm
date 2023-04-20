export type BazaarUpdateType = {
  type:
    | 'initial'
    | 'installation-update'
    | 'recommended'
    | 'unrecommended'
    | 'pinned-update'
    | 'pins-reordered'
    | 'dock-update'
    | 'stall-update';
  payload: any;
};
