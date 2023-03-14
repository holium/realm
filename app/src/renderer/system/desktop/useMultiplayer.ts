import { useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import {
  CursorOutPayload,
  CursorEvent,
  CursorDownPayload,
  CursorUpPayload,
  CursorMovePayload,
  CursorClickPayload,
  TransactionPayload,
  CaretPayload,
  ChatPayload,
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
    const chatPayload: ChatPayload = {
      patp,
      message,
      event: CursorEvent.Chat,
    };
    roomsManager.sendData({
      kind: DataPacket_Kind.DATA,
      value: { chat: chatPayload },
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

  useEffect(() => {
    if (!ship) return;

    // Translate keypresses into chat messages.
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isInRoom) return;

      closeEphemeralChat(); // Refresh the 5s timer.

      if (e.key === '/') {
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
      } else if (e.key === 'Backspace') {
        const newChat = chat.current.slice(0, -1);
        chat.current = newChat;
        window.electron.app.realmToAppEphemeralChat(ship.patp, newChat);
        broadcastChat(ship.patp, newChat);
      } else {
        let newKey = e.key;
        // If the key is not a regular character, ignore it
        if (newKey.length > 1) return;
        // Handle caps lock and shift.
        if (e.getModifierState('CapsLock') || e.shiftKey) {
          newKey = newKey.toUpperCase();
        }

        const newChat = chat.current + newKey;
        chat.current = newChat;
        window.electron.app.realmToAppEphemeralChat(ship.patp, newChat);
        broadcastChat(ship.patp, newChat);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ephemeralChat.isOn, closeEphemeralChat, ship, isInRoom]);

  useEffect(() => {
    if (!ship) return;

    window.electron.app.onMouseOut(() => {
      const cursorOutPayload: CursorOutPayload = {
        patp: ship.patp,
        event: CursorEvent.Out,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorOutPayload },
      });
    });

    window.electron.app.onMouseDown(() => {
      const cursorDownPayload: CursorDownPayload = {
        patp: ship.patp,
        event: CursorEvent.Down,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: {
          cursor: cursorDownPayload,
        },
      });
    });

    window.electron.app.onMouseUp(() => {
      const cursorUpPayload: CursorUpPayload = {
        patp: ship.patp,
        event: CursorEvent.Up,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorUpPayload },
      });
    });

    window.electron.app.onMouseMove((position, state) => {
      const cursorMovePayload: CursorMovePayload = {
        patp: ship.patp,
        event: CursorEvent.Move,
        position: normalizePosition(position, shell.desktopDimensions),
        state,
        hexColor: ship.color ?? '#000000',
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorMovePayload },
      });
    });

    window.electron.multiplayer.onAppToRealmMouseClick((patp, elementId) => {
      const cursorClickPayload: CursorClickPayload = {
        patp,
        elementId,
        event: CursorEvent.Click,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorClickPayload },
      });
    });

    window.electron.multiplayer.onAppToRealmSendTransaction(
      (patp, version, steps, clientID) => {
        const transactionPayload: TransactionPayload = {
          patp,
          version,
          steps,
          clientID,
          event: CursorEvent.Transaction,
        };
        roomsManager.sendData({
          kind: DataPacket_Kind.DATA,
          value: { transaction: transactionPayload },
        });
      }
    );

    window.electron.multiplayer.onAppToRealmSendCaret((patp, position) => {
      const caretPayload: CaretPayload = {
        patp,
        position,
        event: CursorEvent.Caret,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { caret: caretPayload },
      });
    });

    roomsManager.on(RoomManagerEvent.LeftRoom, (_, patp) => {
      const cursorOutPayload: CursorOutPayload = {
        patp,
        event: CursorEvent.Out,
      };
      roomsManager.sendData({
        kind: DataPacket_Kind.DATA,
        value: { cursor: cursorOutPayload },
      });
    });

    roomsManager.on(
      RoomManagerEvent.OnDataChannel,
      async (_rid: string, _peer: string, data) => {
        const chatPayload = data.value.chat;
        if (chatPayload) {
          if (chatPayload.event === CursorEvent.Chat) {
            const { patp, message } = chatPayload as ChatPayload;
            window.electron.multiplayer.realmToAppSendChat(patp, message);
          }
        }

        const cursorPayload = data.value.cursor;
        if (!cursorPayload) return;

        const { event } = cursorPayload;

        if (event === CursorEvent.Move) {
          const { patp, position, state, hexColor } =
            cursorPayload as CursorMovePayload;
          window.electron.multiplayer.mouseMove(
            patp,
            position,
            state,
            hexColor
          );
        } else if (event === CursorEvent.Out) {
          const { patp } = cursorPayload as CursorOutPayload;
          window.electron.multiplayer.mouseOut(patp);
        } else if (event === CursorEvent.Down) {
          const { patp } = cursorPayload as CursorDownPayload;
          window.electron.multiplayer.mouseDown(patp);
        } else if (event === CursorEvent.Up) {
          const { patp } = cursorPayload as CursorUpPayload;
          window.electron.multiplayer.mouseUp(patp);
        } else if (event === CursorEvent.Click) {
          const { patp, elementId } = cursorPayload as CursorClickPayload;
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
