import { useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import {
  MultiplayerOut,
  MultiplayerDown,
  MultiplayerUp,
  MultiplayerMove,
  MultiplayerClick,
  PresenceChat,
  PresenceBroadcast,
  PresenceTransaction,
} from '@holium/realm-presences';
import { DataPacket_Kind, RoomManagerEvent } from '@holium/realm-room';
import { normalizePosition } from 'os/services/shell/lib/window-manager';
import { useRooms } from 'renderer/apps/Rooms/useRooms';
import { useServices } from 'renderer/logic/store';
import { useToggle } from 'renderer/logic/lib/useToggle';

export const useMultiplayer = () => {
  const { ship, shell } = useServices();
  const roomsManager = useRooms(ship?.patp);

  const chat = useRef('');
  const ephemeralChat = useToggle(false);

  const isInRoom = useMemo(
    () => Boolean(roomsManager.presentRoom),
    [roomsManager.presentRoom]
  );

  const broadcastChat = (patp: string, message: string) => {
    const PresenceChat: PresenceChat = {
      patp,
      message,
      event: 'chat',
    };
    roomsManager.sendData({
      kind: DataPacket_Kind.DATA,
      value: { chat: PresenceChat },
    });
  };

  const closeEphemeralChat = useCallback(
    debounce(() => {
      chat.current = '';
      ship && broadcastChat(ship.patp, '');
      ephemeralChat.toggleOff();
      window.electron.app.toggleOffEphemeralChat();
    }, 5000),
    []
  );

  const onKeyDown = useCallback(
    (key: string, isShift: boolean, isCapsLock: boolean) => {
      if (!ship) return;
      if (!isInRoom) return;

      closeEphemeralChat(); // Refresh the 5s timer.

      if (key === '/') {
        chat.current = '';
        window.electron.app.realmToAppEphemeralChat(ship.patp, '');
        broadcastChat(ship.patp, '');
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
        window.electron.app.realmToAppEphemeralChat(ship.patp, newChat);
        broadcastChat(ship.patp, newChat);
      } else {
        let newKey = key;
        // If the key is not a regular character, ignore it
        if (newKey.length > 1) return;
        // Handle caps lock and shift.
        if (isCapsLock || isShift) {
          newKey = newKey.toUpperCase();
        }

        const newChat = chat.current + newKey;
        chat.current = newChat;
        window.electron.app.realmToAppEphemeralChat(ship.patp, newChat);
        broadcastChat(ship.patp, newChat);
      }
    },
    [ephemeralChat.isOn, closeEphemeralChat, ship, isInRoom]
  );

  useEffect(() => {
    window.electron.app.onKeyDown(onKeyDown);

    return () => {
      window.electron.app.removeOnKeyDown();
    };
  });

  useEffect(() => {
    if (!ship) return;

    window.electron.app.onMouseOut(() => {
      const MultiplayerOut: MultiplayerOut = {
        patp: ship.patp,
        event: 'mouse-out',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: MultiplayerOut },
      });
    });

    window.electron.app.onMouseDown(() => {
      const MultiplayerDown: MultiplayerDown = {
        patp: ship.patp,
        event: 'mouse-down',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: {
          cursor: MultiplayerDown,
        },
      });
    });

    window.electron.app.onMouseUp(() => {
      const MultiplayerUp: MultiplayerUp = {
        patp: ship.patp,
        event: 'mouse-up',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: MultiplayerUp },
      });
    });

    window.electron.app.onMouseMove((position, state) => {
      const MultiplayerMove: MultiplayerMove = {
        patp: ship.patp,
        event: 'mouse-move',
        position: normalizePosition(position, shell.desktopDimensions),
        state,
        hexColor: ship.color ?? '#000000',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: MultiplayerMove },
      });
    });

    window.electron.multiplayer.onAppToRealmMouseClick((patp, elementId) => {
      const MultiplayerClick: MultiplayerClick = {
        patp,
        elementId,
        event: 'mouse-click',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: MultiplayerClick },
      });
    });

    window.electron.multiplayer.onAppToRealmSendTransaction(
      (patp, version, steps, clientID) => {
        const PresenceTransaction: PresenceTransaction = {
          patp,
          version,
          steps,
          clientID,
          event: 'transaction',
        };
        roomsManager.sendData({
          kind: DataPacket_Kind.DATA,
          value: { transaction: PresenceTransaction },
        });
      }
    );

    window.electron.multiplayer.onAppToRealmBroadcast((...data) => {
      const broadcast: PresenceBroadcast = {
        event: 'broadcast',
        data: [...data],
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { broadcast },
      });
    });

    roomsManager.on(RoomManagerEvent.LeftRoom, (_, patp) => {
      const MultiplayerOut: MultiplayerOut = {
        patp,
        event: 'mouse-out',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: MultiplayerOut },
      });
    });

    roomsManager.on(
      RoomManagerEvent.OnDataChannel,
      async (_rid: string, _peer: string, data) => {
        const PresenceChat = data.value.chat;
        if (PresenceChat) {
          if (PresenceChat.event === 'chat') {
            const { patp, message } = PresenceChat as PresenceChat;
            window.electron.multiplayer.realmToAppSendChat(patp, message);
          }
        }

        const cursorPayload = data.value.cursor;
        if (!cursorPayload) return;

        const { event } = cursorPayload;

        if (event === 'mouse-move') {
          const { patp, position, state, hexColor } = cursorPayload;
          window.electron.multiplayer.mouseMove(
            patp,
            position,
            state,
            hexColor
          );
        } else if (event === 'mouse-out') {
          const { patp } = cursorPayload;
          window.electron.multiplayer.mouseOut(patp);
        } else if (event === 'mouse-down') {
          const { patp } = cursorPayload;
          window.electron.multiplayer.mouseDown(patp);
        } else if (event === 'mouse-up') {
          const { patp } = cursorPayload;
          window.electron.multiplayer.mouseUp(patp);
        } else {
          const { patp, elementId } = cursorPayload;
          window.electron.multiplayer.realmToAppMouseClick(patp, elementId);
        }
      }
    );
  }, [ship?.color, ship?.patp]);
};

/**
 * We should not use dispatch if we can use @holium/realm-presences (more reliable).
 * We might need to dispatch for the browser where we can't use realm-presences though.
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
