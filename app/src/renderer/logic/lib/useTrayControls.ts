import { DMPreviewType } from 'os/services/ship/models/courier';
import { DmAppInstance } from 'renderer/apps/Messages/store';
import { defaultTrayDimensions } from 'renderer/system/desktop/components/SystemBar/apps';
// TODO make a context for controlling the tray

export const openDMsToChat = (
  dmApp: DmAppInstance,
  dmPreview: DMPreviewType,
  setActiveApp: any
) => {
  dmApp.setSelectedChat(dmPreview);
  dmApp.setView('dm-chat');
  setActiveApp('messages-tray', {
    willOpen: true,
    anchorOffset: { x: 4, y: 26 },
    position: 'top-left',
    dimensions: defaultTrayDimensions['messages-tray'],
  });
};

export const openWalletToTx = (
  walletApp: DmAppInstance,
  dmPreview: DMPreviewType,
  setActiveApp: any
) => {
  dmApp.setSelectedChat(dmPreview);
  dmApp.setView('dm-chat');
  setActiveApp('messages-tray', {
    willOpen: true,
    anchorOffset: { x: 4, y: 26 },
    position: 'top-left',
    dimensions: defaultTrayDimensions['messages-tray'],
  });
};
