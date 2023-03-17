import { useCallback, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';
import {
  MultiplayerOut,
  MultiplayerDown,
  MultiplayerUp,
  MultiplayerMove,
  MultiplayerClick,
  MultiplayerChat,
  PresenceBroadcast,
} from '@holium/realm-presence';
import {
  DataPacket,
  DataPacket_Kind,
  RoomManagerEvent,
  RoomsManager,
} from '@holium/realm-room';
import { normalizePosition } from 'os/services/shell/lib/window-manager';
import { useToggle } from 'renderer/logic/lib/useToggle';
import { Dimensions } from 'os/types';

type Props = {
  patp: string | undefined;
  shipColor: string;
  desktopDimensions: Dimensions;
  isMultiplayerEnabled: boolean;
  roomsManager: RoomsManager;
};

export const useMultiplayer = ({
  patp,
  shipColor,
  desktopDimensions,
  isMultiplayerEnabled,
  roomsManager,
}: Props) => {
  const chat = useRef('');
  const ephemeralChat = useToggle(false);

  const isInRoom = useMemo(
    () => Boolean(roomsManager.presentRoom),
    [roomsManager.presentRoom]
  );

  const broadcastChat = (patp: string, message: string) => {
    const multiplayerChat: MultiplayerChat = {
      patp,
      message,
      event: 'chat',
    };
    roomsManager.sendData({
      kind: DataPacket_Kind.DATA,
      value: { multiplayer: multiplayerChat },
    });
  };

  const closeEphemeralChat = useCallback(
    debounce(() => {
      chat.current = '';
      patp && broadcastChat(patp, '');
      ephemeralChat.toggleOff();
      window.electron.app.toggleOffEphemeralChat();
    }, 5000),
    [patp]
  );

  const onKeyDown = useCallback(
    (key: string) => {
      if (!patp) return;
      if (!isInRoom) return;
      if (!isMultiplayerEnabled) return;

      closeEphemeralChat(); // Refresh the 5s timeout.

      if (key === '/') {
        chat.current = '';
        window.electron.app.realmToAppEphemeralChat(patp, '');
        broadcastChat(patp, '');
        if (ephemeralChat.isOn) {
          ephemeralChat.toggleOff();
          window.electron.app.toggleOffEphemeralChat();
        } else {
          ephemeralChat.toggleOn();
          window.electron.app.toggleOnEphemeralChat();
        }
      } else if (key === 'Backspace') {
        const newChat = chat.current.slice(0, -1);
        chat.current = newChat;
        window.electron.app.realmToAppEphemeralChat(patp, newChat);
        broadcastChat(patp, newChat);
      } else {
        let newKey = key;
        // If the key is not a regular character, ignore it.
        if (newKey.length > 1) return;

        const newChat = chat.current + newKey;
        chat.current = newChat;

        window.electron.app.realmToAppEphemeralChat(patp, newChat);
        broadcastChat(patp, newChat);
      }
    },
    [patp, isInRoom, ephemeralChat.isOn, isMultiplayerEnabled]
  );

  useEffect(() => {
    window.electron.app.onKeyDown(onKeyDown);

    return () => {
      window.electron.app.removeOnKeyDown();
    };
  });

  useEffect(() => {
    if (!patp) return;

    if (!isMultiplayerEnabled) {
      // Remove player's cursor when they stop sharing.
      const multiplayerOut: MultiplayerOut = {
        patp,
        event: 'mouse-out',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { multiplayer: multiplayerOut },
      });
    }
  }, [patp, isMultiplayerEnabled]);

  useEffect(() => {
    if (!patp) return;

    window.electron.app.onMouseOut(() => {
      if (!isMultiplayerEnabled) return;
      const multiplayerOut: MultiplayerOut = {
        patp,
        event: 'mouse-out',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { multiplayer: multiplayerOut },
      });
    });

    window.electron.app.onMouseDown(() => {
      if (!isMultiplayerEnabled) return;
      const multiplayerDown: MultiplayerDown = {
        patp,
        event: 'mouse-down',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: {
          multiplayer: multiplayerDown,
        },
      });
    });

    window.electron.app.onMouseUp(() => {
      if (!isMultiplayerEnabled) return;
      const multiplayerUp: MultiplayerUp = {
        patp,
        event: 'mouse-up',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { multiplayer: multiplayerUp },
      });
    });

    window.electron.app.onMouseMove((position, state) => {
      if (!isMultiplayerEnabled) return;
      const multiplayerMove: MultiplayerMove = {
        patp,
        event: 'mouse-move',
        position: normalizePosition(position, desktopDimensions),
        state,
        hexColor: shipColor,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { multiplayer: multiplayerMove },
      });
    });

    window.electron.multiplayer.onAppToRealmMouseClick((patp, elementId) => {
      if (!isMultiplayerEnabled) return;
      const multiplayerClick: MultiplayerClick = {
        patp,
        elementId,
        event: 'mouse-click',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { multiplayer: multiplayerClick },
      });
    });

    window.electron.multiplayer.onAppToRealmBroadcast((...data) => {
      if (!isMultiplayerEnabled) return;
      const broadcast: PresenceBroadcast = {
        event: 'broadcast',
        data: [...data],
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { broadcast },
      });
    });

    const onLeftRoom = (_rid: string, patp: string) => {
      const multiplayerOut: MultiplayerOut = {
        patp,
        event: 'mouse-out',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { multiplayer: multiplayerOut },
      });
    };

    const onDataChannel = async (
      _rid: string,
      _peer: string,
      data: DataPacket
    ) => {
      const multiplayerPayload = data.value.multiplayer;
      if (!multiplayerPayload) return;

      const { event } = multiplayerPayload;

      if (event === 'mouse-move') {
        const { patp, position, state, hexColor } = multiplayerPayload;
        window.electron.multiplayer.mouseMove(patp, position, state, hexColor);
      } else if (event === 'mouse-out') {
        const { patp } = multiplayerPayload;
        window.electron.multiplayer.mouseOut(patp);
      } else if (event === 'mouse-down') {
        const { patp } = multiplayerPayload;
        window.electron.multiplayer.mouseDown(patp);
      } else if (event === 'mouse-up') {
        const { patp } = multiplayerPayload;
        window.electron.multiplayer.mouseUp(patp);
      } else if (event === 'mouse-click') {
        const { patp, elementId } = multiplayerPayload;
        window.electron.multiplayer.realmToAppMouseClick(patp, elementId);
      } else {
        const { patp, message } = multiplayerPayload;
        window.electron.multiplayer.realmToAppSendChat(patp, message);
      }
    };

    roomsManager.on(RoomManagerEvent.LeftRoom, onLeftRoom);
    roomsManager.on(RoomManagerEvent.OnDataChannel, onDataChannel);

    return () => {
      window.electron.app.removeOnMouseOut();
      window.electron.app.removeOnMouseDown();
      window.electron.app.removeOnMouseUp();
      window.electron.app.removeOnMouseMove();
      window.electron.multiplayer.removeOnAppToRealmMouseClick();
      window.electron.multiplayer.removeOnAppToRealmBroadcast();

      roomsManager.removeListener(RoomManagerEvent.LeftRoom, onLeftRoom);
      roomsManager.removeListener(
        RoomManagerEvent.OnDataChannel,
        onDataChannel
      );
    };
  }, [shipColor, patp, isMultiplayerEnabled, desktopDimensions]);
};

/**
 * We should not use dispatch if we can use @holium/realm-presence (more reliable).
 * We might need to dispatch for the browser where we can't use realm-presence though.
 */
// const dispatchClickEvent = async (
//   position: Position,
//   desktopDimensions: Dimensions
// ) => {
//   const absolutePosition = denormalizePosition(position, desktopDimensions);
//   const element = document.elementFromPoint(
//     absolutePosition.x,
//     absolutePosition.y
//   );
//   const isMultiplayerWindow = element?.closest('.multiplayer-window');
//   if (element && isMultiplayerWindow) {
//     const isWebView = element.tagName === 'WEBVIEW';
//     if (isWebView) {
//       /* This is unreliable, let's not do it for now. */
//       const webview = element as Electron.WebviewTag;
//       const relativePosition = {
//         x: absolutePosition.x - webview.offsetLeft,
//         y: absolutePosition.y - webview.offsetTop,
//       };
//       try {
//         await webview?.executeJavaScript(`
//           const el = document.elementFromPoint(${relativePosition.x}, ${relativePosition.y});
//           el?.dispatchEvent(new MouseEvent('click', {
//             bubbles: true,
//             cancelable: true,
//           }));
//         `);
//       } catch (error) {
//         console.error('error', error);
//       }
//     } else {
//       const clickEvent = new MouseEvent('click', {
//         bubbles: true,
//         cancelable: true,
//       });
//       element.dispatchEvent(clickEvent);
//     }
//   }
// };
