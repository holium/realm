import { RealmUpdateTypes } from 'os/realm.types';
import { BazaarIPC, RealmIPC, SpacesIPC, NotifIPC } from './ipc';
import { shipStore } from './ship.store';

// updates
RealmIPC.onUpdate((_event: any, update: RealmUpdateTypes) => {
  if (update.type === 'booted') {
    if (update.payload.session) {
      shipStore.setShip(update.payload.session);
    }
  }
  if (update.type === 'authenticated') {
    shipStore.setShip(update.payload);
  }
});

NotifIPC.onUpdate(({ type, payload }: any) => {
  switch (type) {
    case 'notification-added':
      shipStore.notifStore.onNotifAdded(payload);
      if (
        shipStore.chatStore.isChatSelected(payload.path) &&
        payload.app === 'realm-chat'
      ) {
        shipStore.notifStore.readPath(payload.app, payload.path);
      }
      break;
    case 'notification-updated':
      shipStore.notifStore.onNotifUpdated(payload);
      break;
    case 'notification-deleted':
      shipStore.notifStore.onNotifDeleted(payload);
      break;
  }
});

SpacesIPC.onUpdate((_event: any, update: any) => {
  const { type, payload } = update;
  // on update we need to requery the store
  switch (type) {
    case 'initial':
      shipStore.spacesStore.init();
      break;
    case 'invitations':
      shipStore.spacesStore._onInitialInvitationsUpdate(payload);
      break;
    case 'invite-sent':
      shipStore.spacesStore._onSpaceMemberAdded(payload);
      break;
    case 'invite-updated':
      shipStore.spacesStore._onSpaceMemberUpdated(payload);
      break;
    case 'kicked':
      shipStore.spacesStore._onSpaceMemberKicked(payload);
      break;
    case 'edited':
      shipStore.spacesStore._onSpaceMemberUpdated(payload);
      break;
    case 'add':
      shipStore.spacesStore._onSpaceAdded(payload);
      break;
    case 'replace':
      shipStore.spacesStore._onSpaceUpdated(payload);
      break;
    case 'remove':
      shipStore.spacesStore._onSpaceRemoved(payload);
      break;
  }
});

BazaarIPC.onUpdate((_event: any, update: any) => {
  const { type, payload } = update;
  // on update we need to requery the store
  switch (type) {
    case 'initial':
      // shipStore.bazaarStore.loadDevApps(payload.devApps);
      // shipStore.bazaarStore.loadDevs(payload.devs);
      break;
    case 'installation-update':
      shipStore.bazaarStore._onInstallationUpdate(payload);
      break;
    case 'recommended':
      shipStore.bazaarStore._onRecommendedUpdate(payload.appId);
      break;
    case 'unrecommended':
      shipStore.bazaarStore._onUnrecommendedUpdate(payload.appId);
      break;
    case 'pinned-update':
      shipStore.bazaarStore._onPinnedUpdate(payload.app.id, payload.index);
      break;
    case 'pins-reordered':
      shipStore.bazaarStore._onUnrecommendedUpdate(payload.appId);
      break;
    case 'dock-update':
      shipStore.spacesStore._onDockUpdate(payload);
      break;
    case 'stall-update':
      shipStore.spacesStore._onStallUpdate(payload);
      break;
  }
});
