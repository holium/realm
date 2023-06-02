import { useCallback, useEffect, useMemo, useRef } from 'react';
import { onAction } from 'mobx-state-tree';

import { Dimensions, useToggle } from '@holium/design-system';
import {
  MultiplayerChat,
  MultiplayerClick,
  MultiplayerDown,
  MultiplayerMove,
  MultiplayerOut,
  MultiplayerUp,
  PresenceBroadcast,
} from '@holium/realm-presence';

import { normalizePosition } from 'renderer/lib/window-manager';
import { DataPacket, DataPacketKind } from 'renderer/stores/rooms/rooms.types';
import { ShipStoreInstance } from 'renderer/stores/ship.store';

import { RoomsMobxType } from './../../stores/rooms.store';

type Props = {
  patp: string | undefined;
  shipColor: string;
  desktopDimensions: Dimensions;
  isMultiplayerEnabled: boolean;
  shipStore: ShipStoreInstance;
};

export const useMultiplayer = ({
  patp,
  shipColor,
  desktopDimensions,
  isMultiplayerEnabled,
  shipStore,
}: Props) => {
  const chat = useRef('');
  const ephemeralChat = useToggle(false);
  const roomsStore = shipStore.roomsStore as RoomsMobxType;

  const timeout = useRef<NodeJS.Timeout | null>(null);

  const isInRoom = useMemo(
    () => Boolean(roomsStore.current),
    [roomsStore.current]
  );

  const broadcastChat = useCallback((patp: string, message: string) => {
    const multiplayerChat: MultiplayerChat = {
      patp,
      message,
      event: 'chat',
    };
    roomsStore.sendData({
      kind: DataPacketKind.DATA,
      value: { multiplayer: multiplayerChat },
    });
  }, []);

  const closeEphemeralChat = useCallback(() => {
    chat.current = '';
    patp && broadcastChat(patp, '');
    ephemeralChat.toggleOff();
    window.electron.app.toggleOffEphemeralChat();
  }, [patp, ephemeralChat, broadcastChat]);

  const closeEphemeralChatDelayed = useCallback(() => {
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(closeEphemeralChat, 5000);
  }, [closeEphemeralChat]);

  const onKeyDown = useCallback(
    (key: string, isFocused: boolean) => {
      if (!patp) return;
      if (!isInRoom) return;
      if (!isMultiplayerEnabled) return;

      if (isFocused) {
        // Don't trigger ephemeral chat if the user is typing in a text field.
        closeEphemeralChat();
        return;
      }

      closeEphemeralChatDelayed(); // Refresh the 5s countdown.

      if (ephemeralChat.isOn) {
        if (key === '/') {
          chat.current = '';
          window.electron.app.realmToAppEphemeralChat(patp, '');
          broadcastChat(patp, '');
          ephemeralChat.toggleOff();
          window.electron.app.toggleOffEphemeralChat();
        } else if (key === 'Backspace') {
          const newChat = chat.current.slice(0, -1);
          chat.current = newChat;
          window.electron.app.realmToAppEphemeralChat(patp, newChat);
          broadcastChat(patp, newChat);
        } else {
          const newKey = key;
          // If the key is not a regular character, ignore it.
          if (newKey.length > 1) return;

          const newChat = chat.current + newKey;
          chat.current = newChat;

          window.electron.app.realmToAppEphemeralChat(patp, newChat);
          broadcastChat(patp, newChat);
        }
      } else {
        if (key === '/') {
          ephemeralChat.toggleOn();
          window.electron.app.toggleOnEphemeralChat();
        }
      }
    },
    [
      patp,
      isInRoom,
      ephemeralChat.isOn,
      isMultiplayerEnabled,
      broadcastChat,
      closeEphemeralChat,
      closeEphemeralChatDelayed,
    ]
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
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
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
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
        value: { multiplayer: multiplayerOut },
      });
    });

    window.electron.app.onMouseDown(() => {
      if (!isMultiplayerEnabled) return;
      const multiplayerDown: MultiplayerDown = {
        patp,
        event: 'mouse-down',
      };
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
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
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
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
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
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
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
        value: { multiplayer: multiplayerClick },
      });
    });

    window.electron.multiplayer.onAppToRealmBroadcast((...data) => {
      if (!isMultiplayerEnabled) return;
      const broadcast: PresenceBroadcast = {
        event: 'broadcast',
        data: [...data],
      };
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
        value: { broadcast },
      });
    });

    const onLeftRoom = (_rid: string, patp: string) => {
      const multiplayerOut: MultiplayerOut = {
        patp,
        event: 'mouse-out',
      };
      roomsStore.sendData({
        kind: DataPacketKind.DATA,
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

    onAction(shipStore, (call) => {
      if (call.path === '/roomsStore') {
        if (call.name === 'deleteRoom') {
          // we deleted our created room, so we should remove all cursors
          onLeftRoom('', window.ship);
        }
        if (call.name === 'leaveRoom') {
          // we left the room, so we should remove all cursors
          onLeftRoom('', window.ship);
        }
        if (call.name === '_onRoomLeft') {
          // called when we or someone else leaves the room
          if (call.args) {
            const rid = call.args[0];
            const patp = call.args[1];
            onLeftRoom(rid, patp);
          }
        }
        if (call.name === '_onDataChannel') {
          if (call.args) {
            onDataChannel('', '', call.args[0]);
          }
        }
      }
    });

    return () => {
      window.electron.app.removeOnMouseOut();
      window.electron.app.removeOnMouseDown();
      window.electron.app.removeOnMouseUp();
      window.electron.app.removeOnMouseMove();
      window.electron.multiplayer.removeOnAppToRealmMouseClick();
      window.electron.multiplayer.removeOnAppToRealmBroadcast();
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
