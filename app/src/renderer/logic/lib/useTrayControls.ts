import { DMPreviewType } from 'os/services/ship/models/courier';
import { ChatStoreInstance } from 'renderer/apps/Courier/store';
import { DmAppInstance } from 'renderer/apps/Messages/store';
import { defaultTrayDimensions } from 'renderer/system/desktop/components/SystemBar/apps';
import { AppRegistry } from 'renderer/apps/registry';

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

export const openChatToPath = (
  chatStore: ChatStoreInstance,
  setActiveApp: any,
  path: string,
  _msgId?: string
) => {
  chatStore.setChat(path);
  chatStore.setSubroute('chat');
  // TODO scrollTo and highlight msgId
  const { position, anchorOffset, dimensions } = AppRegistry['chat'];
  setActiveApp('messages-tray', {
    willOpen: true,
    anchorOffset,
    position,
    dimensions,
  });
};

// export const openWalletToTx = (
//   walletApp: DmAppInstance,
//   dmPreview: DMPreviewType,
//   setActiveApp: any
// ) => {
//   dmApp.setSelectedChat(dmPreview);
//   dmApp.setView('dm-chat');
//   setActiveApp('messages-tray', {
//     willOpen: true,
//     anchorOffset: { x: 4, y: 26 },
//     position: 'top-left',
//     dimensions: defaultTrayDimensions['messages-tray'],
//   });
// };
