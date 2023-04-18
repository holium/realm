import { ChatStoreInstance } from 'renderer/stores/chat.store';
import { AppRegistry } from 'renderer/apps/registry';

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
